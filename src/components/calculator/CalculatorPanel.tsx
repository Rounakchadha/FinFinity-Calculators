import React, { useEffect, useMemo, useState } from 'react';
import CalculatorSlider from './CalculatorSlider';
import DonutComparisonChart from './DonutComparisonChart';
import ResultCard from './ResultCard';
import TrendLineChart, { type TrendPoint } from './TrendLineChart';
import type { CalculatorConfig, ChartSegment, ResultConfig, TabType } from './calculatorData';
import { calculateEmi } from '@/lib/calculators/emi';
import { formatCurrencyINR } from '@/lib/calculators/formatters';
import { calculateLoanSaver } from '@/lib/calculators/loanSaver';
import { calculateFirstCrore } from '@/lib/calculators/myFirstCrore';
import { calculateStepUpSip } from '@/lib/calculators/stepUpSip';
import { validateRequiredNumber } from '@/lib/calculators/validation';
import { buildCalculatorXml, downloadXmlFile } from '@/lib/calculators/xmlExport';

interface CalculatorPanelProps {
  tab: TabType;
  config: CalculatorConfig;
}

type ScheduleColumn = {
  key: string;
  label: string;
  align?: 'left' | 'right';
  kind?: 'currency' | 'number' | 'text';
};

const toTrendPoints = (
  rows: Array<Record<string, number>>,
  valueKey: string,
  labelPrefix: string,
  maxPoints = 24
): TrendPoint[] => {
  if (rows.length === 0) {
    return [];
  }

  const step = Math.max(1, Math.ceil(rows.length / maxPoints));
  const points: TrendPoint[] = [];

  for (let index = 0; index < rows.length; index += step) {
    const row = rows[index];
    points.push({
      label: `${labelPrefix}${row.month}`,
      value: Number(row[valueKey] ?? 0),
    });
  }

  const lastRow = rows[rows.length - 1];
  const lastLabel = `${labelPrefix}${lastRow.month}`;
  const hasLastPoint = points.some((point) => point.label === lastLabel);

  if (!hasLastPoint) {
    points.push({
      label: lastLabel,
      value: Number(lastRow[valueKey] ?? 0),
    });
  }

  return points;
};

const formatTableCell = (value: string | number, kind: ScheduleColumn['kind']): string => {
  if (typeof value !== 'number') {
    return value;
  }

  if (kind === 'currency') {
    return formatCurrencyINR(value);
  }

  if (kind === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return String(value);
};

const normalizeXmlNumber = (value: number): number => {
  return Number(value.toFixed(2));
};

const TABLE_ROWS_PER_PAGE = 14;
const LONG_TABLE_THRESHOLD = 18;

const CalculatorPanel: React.FC<CalculatorPanelProps> = ({ tab, config }) => {
  const [sliderValues, setSliderValues] = useState<number[]>(
    config.sliders.map((s) => s.defaultValue)
  );
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSliderChange = (index: number, val: number) => {
    setSliderValues((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const hasInvalidValue = sliderValues.some((value) => validateRequiredNumber(value) !== null);

  let results: ResultConfig[] = config.results;
  let chartData: ChartSegment[] = config.chart;
  let trendData: TrendPoint[] = [];
  let trendTitle = 'Value Trend';
  let scheduleTitle = 'Schedule';
  let scheduleColumns: ScheduleColumn[] = [];
  let scheduleRows: Array<Record<string, string | number>> = [];
  let xmlInputs: Record<string, string | number> = {};
  let xmlOutputs: Record<string, string | number> = {};

  if (!hasInvalidValue) {
    if (tab === 'EMI') {
      const [loanAmount, annualInterestRate, tenureYears] = sliderValues;
      const outputs = calculateEmi({
        loanAmount,
        annualInterestRatePercent: annualInterestRate,
        tenureMonths: Math.round(tenureYears * 12),
      });

      results = [
        { label: 'Loan EMI', value: formatCurrencyINR(outputs.emi) },
        { label: 'Total Interest', value: formatCurrencyINR(outputs.totalInterest) },
        { label: 'Total Payment', value: formatCurrencyINR(outputs.totalPayment), highlight: true },
      ];

      chartData = [
        { name: 'Principal', value: loanAmount },
        { name: 'Total Interest', value: outputs.totalInterest },
      ];

      trendTitle = 'Outstanding Balance Trend';
      trendData = toTrendPoints(outputs.schedule as Array<Record<string, number>>, 'closingBalance', 'M');
      scheduleTitle = 'EMI Repayment Schedule';
      scheduleColumns = [
        { key: 'month', label: 'Month', kind: 'number' },
        { key: 'openingBalance', label: 'Opening', align: 'right', kind: 'currency' },
        { key: 'emi', label: 'EMI', align: 'right', kind: 'currency' },
        { key: 'principal', label: 'Principal', align: 'right', kind: 'currency' },
        { key: 'interest', label: 'Interest', align: 'right', kind: 'currency' },
        { key: 'closingBalance', label: 'Closing', align: 'right', kind: 'currency' },
      ];
      scheduleRows = outputs.schedule;

      xmlInputs = {
        loanAmount: normalizeXmlNumber(loanAmount),
        annualInterestRatePercent: normalizeXmlNumber(annualInterestRate),
        tenureYears: normalizeXmlNumber(tenureYears),
      };
      xmlOutputs = {
        emi: normalizeXmlNumber(outputs.emi),
        totalInterest: normalizeXmlNumber(outputs.totalInterest),
        totalPayment: normalizeXmlNumber(outputs.totalPayment),
      };
    }

    if (tab === 'SIP') {
      const [monthlyInvestment, annualStepUp, annualReturn, years] = sliderValues;
      const outputs = calculateStepUpSip({
        monthlyInvestment,
        annualStepUpPercent: annualStepUp,
        expectedAnnualReturnPercent: annualReturn,
        years,
      });

      results = [
        { label: 'Future Value', value: formatCurrencyINR(outputs.futureValue) },
        { label: 'Invested Amount', value: formatCurrencyINR(outputs.investedAmount) },
        { label: 'Wealth Gained', value: formatCurrencyINR(outputs.wealthGained), highlight: true },
      ];

      chartData = [
        { name: 'Invested Amount', value: outputs.investedAmount },
        { name: 'Wealth Gained', value: Math.max(outputs.wealthGained, 0) },
      ];

      trendTitle = 'Portfolio Growth Trend';
      trendData = toTrendPoints(outputs.schedule as Array<Record<string, number>>, 'closingBalance', 'M');
      scheduleTitle = 'Step-Up SIP Schedule';
      scheduleColumns = [
        { key: 'month', label: 'Month', kind: 'number' },
        { key: 'openingBalance', label: 'Opening', align: 'right', kind: 'currency' },
        { key: 'investment', label: 'Investment', align: 'right', kind: 'currency' },
        { key: 'interest', label: 'Interest', align: 'right', kind: 'currency' },
        { key: 'closingBalance', label: 'Closing', align: 'right', kind: 'currency' },
      ];
      scheduleRows = outputs.schedule;

      xmlInputs = {
        monthlyInvestment: normalizeXmlNumber(monthlyInvestment),
        annualStepUpPercent: normalizeXmlNumber(annualStepUp),
        expectedAnnualReturnPercent: normalizeXmlNumber(annualReturn),
        years: normalizeXmlNumber(years),
      };
      xmlOutputs = {
        investedAmount: normalizeXmlNumber(outputs.investedAmount),
        futureValue: normalizeXmlNumber(outputs.futureValue),
        wealthGained: normalizeXmlNumber(outputs.wealthGained),
      };
    }

    if (tab === 'Loan Saver') {
      const [loanAmount, currentInterestRate, tenureYears, transferInterestRate, processingFee] = sliderValues;
      const tenureMonths = Math.round(tenureYears * 12);
      const outputs = calculateLoanSaver({
        loanAmount,
        currentInterestRatePercent: currentInterestRate,
        newInterestRatePercent: transferInterestRate,
        tenureMonths,
        processingFee,
      });

      results = [
        { label: 'Current EMI', value: formatCurrencyINR(outputs.currentEmi) },
        { label: 'New EMI', value: formatCurrencyINR(outputs.newEmi) },
        { label: 'Monthly Savings', value: formatCurrencyINR(outputs.monthlySavings), highlight: true },
      ];

      chartData = [
        { name: 'Current Payment', value: outputs.currentTotalPayment },
        { name: 'New Payment', value: outputs.newTotalPayment },
      ];

      trendTitle = 'EMI Comparison';
      trendData = [
        { label: 'Current', value: outputs.currentEmi },
        { label: 'New', value: outputs.newEmi },
        { label: 'Savings', value: Math.max(outputs.monthlySavings, 0) },
      ];
      scheduleTitle = 'Loan Transfer Comparison';
      scheduleColumns = [
        { key: 'option', label: 'Option', kind: 'text' },
        { key: 'emi', label: 'EMI', align: 'right', kind: 'currency' },
        { key: 'totalPayment', label: 'Total Payment', align: 'right', kind: 'currency' },
      ];
      scheduleRows = [
        {
          option: 'Current Loan',
          emi: outputs.currentEmi,
          totalPayment: outputs.currentTotalPayment,
        },
        {
          option: 'Transferred Loan',
          emi: outputs.newEmi,
          totalPayment: outputs.newTotalPayment,
        },
      ];

      xmlInputs = {
        loanAmount: normalizeXmlNumber(loanAmount),
        currentInterestRatePercent: normalizeXmlNumber(currentInterestRate),
        transferInterestRatePercent: normalizeXmlNumber(transferInterestRate),
        tenureYears: normalizeXmlNumber(tenureYears),
        processingFee: normalizeXmlNumber(processingFee),
      };
      xmlOutputs = {
        currentEmi: normalizeXmlNumber(outputs.currentEmi),
        newEmi: normalizeXmlNumber(outputs.newEmi),
        monthlySavings: normalizeXmlNumber(outputs.monthlySavings),
        totalSavings: normalizeXmlNumber(outputs.totalSavings),
      };
    }

    if (tab === 'My 1st Crore') {
      const [monthlyInvestment, targetAmount, annualReturn] = sliderValues;
      const outputs = calculateFirstCrore({
        monthlyInvestment,
        targetAmount,
        annualReturnPercent: annualReturn,
      });

      results = [
        { label: 'Time Period', value: `${outputs.yearsToTarget.toFixed(1)} yrs` },
        { label: 'Invested Amount', value: formatCurrencyINR(outputs.totalInvested) },
        { label: 'Wealth Gained', value: formatCurrencyINR(outputs.wealthGained), highlight: true },
      ];

      chartData = [
        { name: 'Invested Amount', value: outputs.totalInvested },
        { name: 'Wealth Gained', value: Math.max(outputs.wealthGained, 0) },
      ];

      const totalMonths = Math.max(1, Math.ceil(outputs.monthsToTarget));
      const monthlyRate = outputs.nominalAnnualRate / 12;
      let balance = 0;
      let invested = 0;
      const projectionRows: Array<Record<string, string | number>> = [];

      for (let month = 1; month <= totalMonths; month += 1) {
        balance = (balance + monthlyInvestment) * (1 + monthlyRate);
        invested += monthlyInvestment;

        if (month % 12 === 0 || month === totalMonths) {
          projectionRows.push({
            year: Math.ceil(month / 12),
            investedAmount: invested,
            estimatedValue: balance,
            wealthGained: balance - invested,
          });
        }
      }

      trendTitle = 'Target Journey Trend';
      trendData = projectionRows.map((row) => ({
        label: `Y${row.year}`,
        value: Number(row.estimatedValue),
      }));
      scheduleTitle = 'Year-wise Projection';
      scheduleColumns = [
        { key: 'year', label: 'Year', kind: 'number' },
        { key: 'investedAmount', label: 'Invested', align: 'right', kind: 'currency' },
        { key: 'estimatedValue', label: 'Estimated Value', align: 'right', kind: 'currency' },
        { key: 'wealthGained', label: 'Wealth Gained', align: 'right', kind: 'currency' },
      ];
      scheduleRows = projectionRows;

      xmlInputs = {
        monthlyInvestment: normalizeXmlNumber(monthlyInvestment),
        targetAmount: normalizeXmlNumber(targetAmount),
        annualReturnPercent: normalizeXmlNumber(annualReturn),
      };
      xmlOutputs = {
        yearsToTarget: normalizeXmlNumber(outputs.yearsToTarget),
        totalInvested: normalizeXmlNumber(outputs.totalInvested),
        wealthGained: normalizeXmlNumber(outputs.wealthGained),
      };
    }
  }

  const handleDownloadXml = () => {
    const xml = buildCalculatorXml({
      type: tab,
      timestamp: new Date().toISOString(),
      inputs: xmlInputs,
      outputs: xmlOutputs,
      schedule: scheduleRows.map((row) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (typeof value === 'number') {
              return [key, normalizeXmlNumber(value)];
            }

            return [key, value];
          })
        );
      }),
    });

    const fileSafeTabName = tab.toLowerCase().replace(/\s+/g, '-');
    const datePart = new Date().toISOString().slice(0, 10);
    downloadXmlFile(`${fileSafeTabName}-${datePart}.xml`, xml);
  };

  const isLongTable = scheduleRows.length > LONG_TABLE_THRESHOLD;
  const totalPages = Math.max(1, Math.ceil(scheduleRows.length / TABLE_ROWS_PER_PAGE));

  useEffect(() => {
    setScheduleExpanded(false);
    setCurrentPage(1);
  }, [tab, scheduleRows.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleScheduleRows = useMemo(() => {
    if (scheduleExpanded || !isLongTable) {
      return scheduleRows;
    }

    const startIndex = (currentPage - 1) * TABLE_ROWS_PER_PAGE;
    return scheduleRows.slice(startIndex, startIndex + TABLE_ROWS_PER_PAGE);
  }, [scheduleExpanded, isLongTable, scheduleRows, currentPage]);

  return (
    <div>
      <h3 className="mb-4 text-xl font-bold text-calc-text-primary lg:text-2xl">
        {config.title}
      </h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Left: Sliders */}
        <div className="lg:col-span-7">
          {config.sliders.map((slider, idx) => (
            <CalculatorSlider
              key={idx}
              label={slider.label}
              value={sliderValues[idx]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              unit={slider.unit}
              isCurrency={slider.isCurrency}
              showTenureToggle={tab === 'EMI' && slider.label === 'Loan Tenure'}
              onChange={(val) => handleSliderChange(idx, val)}
            />
          ))}
        </div>

        {/* Right: Results */}
        <div className="flex min-w-0 flex-col justify-start gap-1.5 lg:col-span-5 lg:pl-2 lg:pt-1">
          {results.map((res, idx) => (
            <ResultCard key={idx} label={res.label} value={res.value} highlight={res.highlight} />
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="rounded-2xl border border-calc-border/80 bg-calc-surface/60 p-4">
          <p className="mb-3 text-sm font-semibold text-calc-text-secondary">Breakdown (Pie)</p>
          <DonutComparisonChart data={chartData} />
        </div>
        <TrendLineChart title={trendTitle} data={trendData} />
      </div>

      <div className="mt-8 rounded-2xl border border-calc-border/80 bg-calc-surface/55 p-4 lg:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-base font-semibold text-calc-text-primary">{scheduleTitle}</h4>
          <div className="flex flex-wrap items-center gap-2">
            {isLongTable ? (
              <>
                {!scheduleExpanded ? (
                  <div className="rounded-lg border border-calc-border/80 bg-calc-surface/80 px-2 py-1 text-xs text-calc-text-secondary">
                    Page {currentPage} of {totalPages}
                  </div>
                ) : null}

                {!scheduleExpanded ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage <= 1}
                      className="rounded-lg border border-calc-border/80 bg-calc-surface/80 px-2.5 py-1 text-xs font-semibold text-calc-text-secondary transition hover:border-calc-accent/35 hover:text-calc-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage >= totalPages}
                      className="rounded-lg border border-calc-border/80 bg-calc-surface/80 px-2.5 py-1 text-xs font-semibold text-calc-text-secondary transition hover:border-calc-accent/35 hover:text-calc-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => setScheduleExpanded((state) => !state)}
                  className="rounded-lg border border-calc-border/80 bg-calc-surface/80 px-2.5 py-1 text-xs font-semibold text-calc-text-secondary transition hover:border-calc-accent/35 hover:text-calc-text-primary"
                >
                  {scheduleExpanded ? 'Collapse' : `Show all (${scheduleRows.length})`}
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={handleDownloadXml}
              className="rounded-xl border border-calc-accent/40 bg-calc-accent/10 px-3 py-1.5 text-xs font-semibold text-calc-accent transition hover:bg-calc-accent/20"
            >
              Download XML
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr>
                {scheduleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`border-b border-calc-border px-3 py-2 font-semibold text-calc-text-secondary ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleScheduleRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="rounded-lg bg-calc-surface/65">
                  {scheduleColumns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 py-2 text-calc-text-primary ${
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatTableCell(row[column.key] as string | number, column.kind)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPanel;

import React, { useEffect, useMemo, useState } from 'react';
import CalculatorSlider from './CalculatorSlider';
import DonutComparisonChart from './DonutComparisonChart';
import TrendLineChart, { type TrendPoint } from './TrendLineChart';
import type { CalculatorConfig, ChartSegment, ResultConfig, TabType } from './calculatorData';
import { calculateEmi } from '@/lib/calculators/emi';
import { formatCurrencyINR } from '@/lib/calculators/formatters';
import { calculateLoanSaver } from '@/lib/calculators/loanSaver';
import { calculateFirstCrore } from '@/lib/calculators/myFirstCrore';
import { calculateStepUpSip } from '@/lib/calculators/stepUpSip';
import { calculateLumpsum } from '@/lib/calculators/sip';
import { validateRequiredNumber } from '@/lib/calculators/validation';
import { buildCalculatorXml, downloadXmlFile } from '@/lib/calculators/xmlExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const toTrendPoints = (
  rows: Array<Record<string, string | number>>,
  labelKey: string,
  valueKey: string,
  maxPoints = 18
): TrendPoint[] => {
  if (rows.length === 0) {
    return [];
  }

  const step = Math.max(1, Math.ceil(rows.length / maxPoints));
  const points: TrendPoint[] = [];

  for (let index = 0; index < rows.length; index += step) {
    const row = rows[index];
    points.push({
      label: String(row[labelKey] ?? index + 1),
      value: Number(row[valueKey] ?? 0),
    });
  }

  const lastRow = rows[rows.length - 1];
  const lastLabel = String(lastRow[labelKey] ?? rows.length);
  if (points[points.length - 1]?.label !== lastLabel) {
    points.push({
      label: lastLabel,
      value: Number(lastRow[valueKey] ?? 0),
    });
  }

  return points;
};

const TABLE_ROWS_PER_PAGE = 14;
const LONG_TABLE_THRESHOLD = 18;

const HOW_IT_WORKS_CONTENT: Record<
  TabType,
  {
    title: string;
    intro: string;
    bullets: string[];
    sections: Array<{ heading: string; body: string[] }>;
    faqs: string[];
  }
> = {
  EMI: {
    title: 'How to use this EMI calculator',
    intro:
      'Enter your loan amount, annual interest rate, and tenure. EMI, total interest, and total payment update instantly with Indian number formatting.',
    bullets: [
      'Reducing balance method (standard for banks and NBFCs)',
      'Indian number format (lakh and crore)',
      'Detailed schedule view with export',
    ],
    sections: [
      {
        heading: 'What is EMI?',
        body: [
          'EMI (Equated Monthly Instalment) is a fixed monthly payment containing both principal and interest.',
          'In a reducing-balance loan, interest share decreases over time while principal share increases.',
        ],
      },
      {
        heading: 'EMI Formula',
        body: [
          'EMI = P x r x (1 + r)^n / [(1 + r)^n - 1]',
          'Where P is principal, r is monthly interest rate, and n is total monthly instalments. If r = 0, EMI = P / n.',
        ],
      },
      {
        heading: 'Factors that affect EMI',
        body: [
          'Interest rate, tenure, loan amount, and part-prepayments directly affect EMI and total interest.',
          'Credit profile and lender pricing also influence the offered rate.',
        ],
      },
      {
        heading: 'Reducing balance vs flat interest',
        body: [
          'Reducing-balance EMI calculates interest on outstanding principal each month.',
          'Flat interest charges interest on the original principal through the full tenure, usually costing more overall.',
        ],
      },
    ],
    faqs: [
      'How is EMI calculated?',
      'Why can lender EMI differ slightly from this tool?',
      'What happens after part-prepayment?',
      'Is GST applied on EMI principal/interest or only on fees?',
    ],
  },
  SIP: {
    title: 'How to use this Step-Up SIP calculator',
    intro:
      'Enter monthly investment, annual step-up, expected annual return, and investment period. The tool estimates future value with monthly compounding.',
    bullets: [
      'Step-up SIP growth with annual increase in monthly contribution',
      'Compounding impact shown through projected schedule',
      'Indian currency formatting for all outputs',
    ],
    sections: [
      {
        heading: 'What is Step-Up SIP?',
        body: [
          'Step-Up SIP increases your monthly SIP contribution every year by a chosen percentage.',
          'It helps align investments with rising income and can materially improve final corpus.',
        ],
      },
      {
        heading: 'How this calculator computes',
        body: [
          'Monthly contribution is increased every 12 months by the selected step-up rate.',
          'Returns are applied monthly using effective annual return conversion.',
        ],
      },
      {
        heading: 'Key drivers',
        body: [
          'Higher step-up, higher return, and longer time horizon increase future value.',
          'Missing yearly step-ups can significantly reduce final corpus.',
        ],
      },
      {
        heading: 'Practical tips',
        body: [
          'Keep step-up modest but consistent (for example 5%-15%).',
          'Review assumptions annually and rebalance if risk profile changes.',
        ],
      },
    ],
    faqs: [
      'How is future value estimated?',
      'What is wealth gained?',
      'How does step-up change outcomes vs normal SIP?',
      'Why may actual market returns differ from projection?',
    ],
  },
  'Loan Saver': {
    title: 'How to use this Loan Saver calculator',
    intro:
      'Compare your current loan against a transfer scenario by entering current rate, new rate, tenure, and processing fee.',
    bullets: [
      'Compares current EMI vs transferred-loan EMI',
      'Includes transfer processing fee impact',
      'Shows monthly and total savings view',
    ],
    sections: [
      {
        heading: 'What this calculator tells you',
        body: [
          'It estimates whether a balance transfer or refinance can reduce your EMI and total payout.',
          'Outputs include current EMI, new EMI, monthly savings, and total savings.',
        ],
      },
      {
        heading: 'How savings are calculated',
        body: [
          'Current and new EMIs are computed using standard reducing-balance loan math.',
          'New total payment includes transfer-related processing fee.',
        ],
      },
      {
        heading: 'When transfer helps',
        body: [
          'A meaningful rate drop and sufficient remaining tenure generally improve savings.',
          'Always compare all charges, not just EMI.',
        ],
      },
      {
        heading: 'Checklist before transfer',
        body: [
          'Check foreclosure or prepayment terms at current lender.',
          'Evaluate processing, legal, and administrative charges at new lender.',
        ],
      },
    ],
    faqs: [
      'Can lower EMI still lead to lower total savings?',
      'Should I reduce tenure or EMI after transfer?',
      'How much rate difference is worth switching?',
      'Do fees and taxes affect transfer benefit materially?',
    ],
  },
  'My 1st Crore': {
    title: 'How to use this My 1st Crore calculator',
    intro:
      'Enter monthly investment, target amount, and expected return. The calculator estimates time required and wealth created.',
    bullets: [
      'Goal-based investing projection',
      'Estimates years to reach chosen target corpus',
      'Shows invested amount vs wealth gained breakdown',
    ],
    sections: [
      {
        heading: 'What this calculator solves',
        body: [
          'It estimates how long it may take to reach a target corpus such as one crore.',
          'It helps plan monthly commitment based on desired timeline.',
        ],
      },
      {
        heading: 'How the estimate works',
        body: [
          'Uses monthly compounding derived from annual expected return.',
          'Calculates months needed to cross target using an annuity growth model.',
        ],
      },
      {
        heading: 'Improve your timeline',
        body: [
          'Increase monthly investment or expected return assumptions carefully.',
          'Add annual top-ups to reduce years to target.',
        ],
      },
      {
        heading: 'Reality check',
        body: [
          'Returns are not guaranteed and can vary year to year.',
          'Review assumptions periodically and adjust contributions as income grows.',
        ],
      },
    ],
    faqs: [
      'How accurate is years-to-target?',
      'What if return is lower than expected?',
      'Is monthly or annual step-up needed for faster goals?',
      'Can I use this for targets beyond one crore?',
    ],
  },
};

const HOW_IT_WORKS_FAQ_ANSWERS: Record<TabType, Record<string, string>> = {
  EMI: {
    'How is EMI calculated?':
      'EMI is calculated using the standard amortizing-loan formula with monthly compounding based on principal, monthly rate, and total instalments.',
    'Why can lender EMI differ slightly from this tool?':
      'Lenders may use different rounding conventions, exact day-count methods, or fee treatments, causing slight differences from calculator output.',
    'What happens after part-prepayment?':
      'Part-prepayment reduces outstanding principal and can either lower EMI or reduce tenure, depending on lender option selected.',
    'Is GST applied on EMI principal/interest or only on fees?':
      'GST is generally applied on lender fees and charges, not on EMI principal and interest components.',
  },
  SIP: {
    'How is future value estimated?':
      'Future value is estimated by compounding monthly contributions using expected return assumptions with annual step-up adjustments.',
    'What is wealth gained?':
      'Wealth gained is the difference between projected future value and total invested amount.',
    'How does step-up change outcomes vs normal SIP?':
      'Step-up increases contribution every year, which usually creates a meaningfully larger corpus than flat SIP at the same start amount.',
    'Why may actual market returns differ from projection?':
      'Projected returns are assumption-based; real markets are volatile and can produce higher or lower outcomes over time.',
  },
  'Loan Saver': {
    'Can lower EMI still lead to lower total savings?':
      'Yes, if tenure increases or transfer charges are high, lower EMI may not always maximize total savings.',
    'Should I reduce tenure or EMI after transfer?':
      'Reducing tenure generally saves more total interest, while reducing EMI improves monthly cash flow.',
    'How much rate difference is worth switching?':
      'A useful switch depends on remaining tenure, balance outstanding, and all transfer costs, not just rate gap alone.',
    'Do fees and taxes affect transfer benefit materially?':
      'Yes, processing fees and related charges can materially reduce net benefit, so compare end-to-end cost.',
  },
  'My 1st Crore': {
    'How accurate is years-to-target?':
      'It is an estimate based on constant return assumptions; real-world timelines vary with market performance and contribution consistency.',
    'What if return is lower than expected?':
      'Lower return typically extends timeline to target unless you increase monthly investment.',
    'Is monthly or annual step-up needed for faster goals?':
      'Increasing contributions periodically, even modestly, can meaningfully reduce time to goal.',
    'Can I use this for targets beyond one crore?':
      'Yes, you can set larger target amounts to model higher corpus goals with the same approach.',
  },
};

const getDynamicSipHowItWorks = (
  sipContributionMode: 'sip' | 'lumpsum',
  sipAnnualStepUp: number
) => {
  if (sipContributionMode === 'lumpsum') {
    return {
      content: {
        title: 'How to use this Lumpsum calculator',
        intro:
          'Enter one-time investment amount, expected annual return, and time period. The tool projects future value using monthly compounding.',
        bullets: [
          'One-time investment growth projection',
          'Compounding-based month-wise schedule',
          'Indian number formatting for output readability',
        ],
        sections: [
          {
            heading: 'What this mode calculates',
            body: [
              'Lumpsum mode assumes a single investment at the beginning and no further monthly contributions.',
              'The invested amount grows at the selected expected return rate over time.',
            ],
          },
          {
            heading: 'How calculation works',
            body: [
              'Return is converted to effective monthly growth and applied to the outstanding corpus each month.',
              'Final value is the future corpus after the selected period.',
            ],
          },
          {
            heading: 'When to use lumpsum',
            body: [
              'Useful when you already have capital and want to estimate long-term growth.',
              'Can be compared with monthly SIP strategy to decide contribution style.',
            ],
          },
          {
            heading: 'Practical guidance',
            body: [
              'Choose realistic return assumptions and review annually.',
              'Use staggered deployment if market volatility is a concern.',
            ],
          },
        ],
        faqs: [
          'How is lumpsum future value calculated?',
          'Why can actual returns differ from projection?',
          'Is lumpsum better than monthly SIP?',
          'Can I add more money later?',
        ],
      },
      faqAnswers: {
        'How is lumpsum future value calculated?':
          'The calculator compounds your one-time invested amount monthly at the selected expected annual return.',
        'Why can actual returns differ from projection?':
          'Returns are assumption-based and real market performance is variable over time.',
        'Is lumpsum better than monthly SIP?':
          'It depends on cash availability, risk comfort, and market timing preference. Both have valid use-cases.',
        'Can I add more money later?':
          'Yes. Additional contributions can be modeled by re-running with updated invested amount or using monthly SIP mode.',
      },
    };
  }

  if (sipAnnualStepUp === 0) {
    return {
      content: {
        title: 'How to use this SIP calculator',
        intro:
          'Enter monthly investment, expected annual return, and time period. The tool estimates future value with fixed monthly contributions.',
        bullets: [
          'Fixed monthly contribution model',
          'Month-wise schedule with compounding impact',
          'Clear invested amount vs wealth gained split',
        ],
        sections: [
          {
            heading: 'What this mode calculates',
            body: [
              'Normal SIP keeps your monthly investment constant through the full period.',
              'Future value reflects disciplined monthly investing plus compounding growth.',
            ],
          },
          {
            heading: 'How calculation works',
            body: [
              'Each month contribution is added, then growth is applied at monthly equivalent rate.',
              'Final value is the sum of all contributions plus generated returns.',
            ],
          },
          {
            heading: 'Key drivers',
            body: [
              'Higher monthly contribution, longer duration, and better returns increase final corpus.',
              'Consistency matters more than short-term return swings.',
            ],
          },
          {
            heading: 'Practical guidance',
            body: [
              'Align SIP debit date with income cycle to stay consistent.',
              'Review allocation annually and rebalance based on goal horizon.',
            ],
          },
        ],
        faqs: [
          'How is SIP future value estimated?',
          'What is wealth gained?',
          'What happens if I skip some months?',
          'Why can actual value differ from projection?',
        ],
      },
      faqAnswers: {
        'How is SIP future value estimated?':
          'The calculator compounds each monthly contribution at the selected expected return converted to monthly rate.',
        'What is wealth gained?':
          'Wealth gained is projected future value minus total invested amount.',
        'What happens if I skip some months?':
          'Skipping contributions generally lowers future value because both principal and compounding reduce.',
        'Why can actual value differ from projection?':
          'Market returns are not linear; actual outcomes depend on real portfolio performance and timing.',
      },
    };
  }

  return {
    content: HOW_IT_WORKS_CONTENT.SIP,
    faqAnswers: HOW_IT_WORKS_FAQ_ANSWERS.SIP,
  };
};

const CalculatorPanel: React.FC<CalculatorPanelProps> = ({ tab, config }) => {
  const isLoanSaverTab = tab === 'Loan Saver';
  const isCompactTab = tab === 'SIP' || tab === 'Loan Saver';
  const [sipContributionMode, setSipContributionMode] = useState<'sip' | 'lumpsum'>('sip');
  const [sipAnnualStepUp, setSipAnnualStepUp] = useState<number>(0);
  const [sliderValues, setSliderValues] = useState<number[]>(
    config.sliders.map((s) => s.defaultValue)
  );
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
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
      const outputs =
        sipContributionMode === 'lumpsum'
          ? calculateLumpsum({
              investmentAmount: monthlyInvestment,
              expectedAnnualReturnPercent: annualReturn,
              years,
            })
          : calculateStepUpSip({
              monthlyInvestment,
              annualStepUpPercent: sipAnnualStepUp,
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

      scheduleTitle =
        sipContributionMode === 'lumpsum'
          ? 'Lumpsum Growth Schedule'
          : sipAnnualStepUp > 0
            ? 'Step-Up SIP Schedule'
            : 'SIP Schedule';
      scheduleColumns = [
        { key: 'month', label: 'Month', kind: 'number' },
        { key: 'openingBalance', label: 'Opening', align: 'right', kind: 'currency' },
        { key: 'investment', label: 'Investment', align: 'right', kind: 'currency' },
        { key: 'interest', label: 'Interest', align: 'right', kind: 'currency' },
        { key: 'closingBalance', label: 'Closing', align: 'right', kind: 'currency' },
      ];
      scheduleRows = outputs.schedule;

      xmlInputs = {
        contributionMode: sipContributionMode,
        monthlyInvestment: normalizeXmlNumber(monthlyInvestment),
        annualStepUpPercent:
          sipContributionMode === 'lumpsum'
            ? 0
            : normalizeXmlNumber(sipAnnualStepUp),
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
    if (tab !== 'SIP') {
      return;
    }

    setSliderValues((prev) => {
      const next = [...prev];

      if (sipContributionMode === 'lumpsum') {
        next[0] = Math.min(500000000, Math.max(10000, next[0]));
      } else {
        next[0] = Math.min(500000, Math.max(500, next[0]));
      }

      return next;
    });
  }, [tab, sipContributionMode]);

  useEffect(() => {
    setOpenFaqIndex(null);
  }, [tab, isHowItWorksOpen]);

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

  const dynamicSipHowItWorks = useMemo(() => {
    if (tab !== 'SIP') {
      return null;
    }

    return getDynamicSipHowItWorks(sipContributionMode, sipAnnualStepUp);
  }, [tab, sipContributionMode, sipAnnualStepUp]);

  const howItWorks = dynamicSipHowItWorks?.content ?? HOW_IT_WORKS_CONTENT[tab];
  const faqAnswerMap = dynamicSipHowItWorks?.faqAnswers ?? HOW_IT_WORKS_FAQ_ANSWERS[tab];
  const howItWorksTrend = useMemo<{ title: string; data: TrendPoint[] }>(() => {
    if (tab === 'EMI') {
      return {
        title: 'Outstanding Balance Trend',
        data: toTrendPoints(scheduleRows, 'month', 'closingBalance').map((point) => ({
          ...point,
          label: `M${point.label}`,
        })),
      };
    }

    if (tab === 'SIP') {
      return {
        title: 'Portfolio Growth Trend',
        data: toTrendPoints(scheduleRows, 'month', 'closingBalance').map((point) => ({
          ...point,
          label: `M${point.label}`,
        })),
      };
    }

    if (tab === 'Loan Saver') {
      return {
        title: 'EMI Comparison Trend',
        data: [
          { label: 'Current EMI', value: Number(scheduleRows[0]?.emi ?? 0) },
          { label: 'New EMI', value: Number(scheduleRows[1]?.emi ?? 0) },
          {
            label: 'Monthly Savings',
            value: Math.max(Number(scheduleRows[0]?.emi ?? 0) - Number(scheduleRows[1]?.emi ?? 0), 0),
          },
        ],
      };
    }

    return {
      title: 'Target Journey Trend',
      data: toTrendPoints(scheduleRows, 'year', 'estimatedValue').map((point) => ({
        ...point,
        label: `Y${point.label}`,
      })),
    };
  }, [tab, scheduleRows]);

  return (
    <div>
      <h3 className={`${isCompactTab ? 'mb-3' : 'mb-4'} text-xl font-bold text-calc-text-primary lg:text-2xl`}>
        {config.title}
      </h3>

      <div className={`grid grid-cols-1 gap-4 lg:grid-cols-12 ${isLoanSaverTab ? 'lg:gap-3' : isCompactTab ? 'lg:gap-4' : 'lg:gap-5'}`}>
        <div className={`rounded-3xl border border-calc-border/80 bg-calc-surface/50 lg:col-span-6 ${isCompactTab ? 'p-3 lg:p-4' : 'p-4 lg:p-5'}`}>
          {tab === 'SIP' ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-calc-border/80 bg-calc-surface/75 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setSipContributionMode('sip');
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    sipContributionMode === 'sip'
                      ? 'bg-calc-accent text-background'
                      : 'text-calc-text-secondary hover:text-calc-text-primary'
                  }`}
                >
                  SIP
                </button>
                <button
                  type="button"
                  onClick={() => setSipContributionMode('lumpsum')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    sipContributionMode === 'lumpsum'
                      ? 'bg-calc-accent text-background'
                      : 'text-calc-text-secondary hover:text-calc-text-primary'
                  }`}
                >
                  LUMPSUM
                </button>
              </div>

              {sipContributionMode === 'sip' ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-calc-border/80 bg-calc-surface/75 px-3 py-1.5">
                  <span className="text-xs font-semibold text-calc-text-secondary">Annual Step Up</span>
                  <select
                    value={sipAnnualStepUp}
                    onChange={(event) => setSipAnnualStepUp(Number(event.target.value))}
                    className="rounded-md border border-calc-border/70 bg-calc-surface px-2 py-1 text-xs font-semibold text-calc-text-primary outline-none focus:border-calc-accent"
                  >
                    {Array.from({ length: 26 }, (_, index) => (
                      <option key={index} value={index}>
                        {index}%
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          ) : null}

          {config.sliders.map((slider, idx) => {
            if (tab === 'SIP' && idx === 1) {
              return null;
            }

            const isSipAmountSlider = tab === 'SIP' && idx === 0;
            const sliderLabel = isSipAmountSlider
              ? sipContributionMode === 'lumpsum'
                ? 'Investment Amount'
                : 'Monthly Investment'
              : slider.label;

            const sliderMin = isSipAmountSlider
              ? sipContributionMode === 'lumpsum'
                ? 10000
                : 500
              : slider.min;

            const sliderMax = isSipAmountSlider
              ? sipContributionMode === 'lumpsum'
                ? 500000000
                : 500000
              : slider.max;

            const sliderStep = isSipAmountSlider
              ? sipContributionMode === 'lumpsum'
                ? 10000
                : 500
              : slider.step;

            return (
              <CalculatorSlider
                key={idx}
                label={sliderLabel}
                value={sliderValues[idx]}
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                unit={slider.unit}
                isCurrency={slider.isCurrency}
                compact={isCompactTab}
                dense={isLoanSaverTab}
                showTenureToggle={tab === 'EMI' && slider.label === 'Loan Tenure'}
                onChange={(val) => handleSliderChange(idx, val)}
              />
            );
          })}
        </div>

        <div className={`h-full rounded-3xl border border-calc-border/80 bg-calc-surface/55 lg:col-span-6 ${isCompactTab ? 'p-3 lg:p-4' : 'p-4 lg:p-5'} flex flex-col`}>
          <div className={`${isLoanSaverTab ? 'mb-4' : isCompactTab ? 'mb-5' : 'mb-6'} flex items-start justify-between gap-3`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-calc-text-secondary">
                {results[0]?.label ?? 'Result'}
              </p>
              <p className={`calc-number mt-1 font-semibold text-calc-accent leading-none ${isLoanSaverTab ? 'text-5xl' : isCompactTab ? 'text-3xl' : 'text-4xl'}`}>
                {results[0]?.value ?? '-'}
              </p>
            </div>
          </div>

          <div className={`${isLoanSaverTab ? 'mb-3 gap-2' : isCompactTab ? 'mb-4 gap-2' : 'mb-5 gap-3'} grid grid-cols-1 sm:grid-cols-2`}>
            {results.slice(1).map((res, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border border-calc-border/70 bg-calc-surface/70 ${isLoanSaverTab ? 'px-4 py-3' : isCompactTab ? 'px-3 py-2.5' : 'px-4 py-3'}`}
              >
                <p className="mb-1 text-xs font-medium text-calc-text-secondary">{res.label}</p>
                <p
                  className={`calc-number font-semibold leading-none text-calc-text-primary ${isLoanSaverTab ? 'text-4xl' : isCompactTab ? 'text-2xl' : 'text-3xl'}`}
                >
                  {res.value}
                </p>
              </div>
            ))}
          </div>

          <div className={`flex flex-1 items-center ${isLoanSaverTab ? 'min-h-56' : 'min-h-42.5'}`}>
            <DonutComparisonChart data={chartData} compact={tab === 'SIP'} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsTableOpen(true)}
          className="inline-flex h-10 w-36 items-center justify-center rounded-xl border border-calc-border/80 bg-calc-surface/75 text-sm font-semibold text-calc-text-secondary transition hover:border-calc-accent/35 hover:text-calc-text-primary"
        >
          View Table
        </button>
        <button
          type="button"
          onClick={() => setIsHowItWorksOpen(true)}
          className="inline-flex h-10 w-36 items-center justify-center rounded-xl border border-calc-accent/40 bg-calc-accent/10 text-sm font-semibold text-calc-accent transition hover:bg-calc-accent/20"
        >
          Know How It Works
        </button>
      </div>

      <Dialog open={isTableOpen} onOpenChange={setIsTableOpen}>
        <DialogContent className="max-w-[95vw] border-calc-border bg-calc-surface p-5 text-calc-text-primary sm:max-w-295">
          <DialogHeader>
            <DialogTitle>{scheduleTitle}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {isLongTable && !scheduleExpanded ? (
              <div className="rounded-lg border border-calc-border/80 bg-calc-surface/80 px-2 py-1 text-xs text-calc-text-secondary">
                Page {currentPage} of {totalPages}
              </div>
            ) : (
              <div />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadXml}
                className="rounded-lg border border-calc-accent/40 bg-calc-accent/10 px-2.5 py-1 text-xs font-semibold text-calc-accent transition hover:bg-calc-accent/20"
              >
                Download XML
              </button>

              {isLongTable && !scheduleExpanded ? (
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

              {isLongTable ? (
                <button
                  type="button"
                  onClick={() => setScheduleExpanded((state) => !state)}
                  className="rounded-lg border border-calc-border/80 bg-calc-surface/80 px-2.5 py-1 text-xs font-semibold text-calc-text-secondary transition hover:border-calc-accent/35 hover:text-calc-text-primary"
                >
                  {scheduleExpanded ? 'Collapse' : `Show all (${scheduleRows.length})`}
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[65vh] overflow-auto">
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
        </DialogContent>
      </Dialog>

      <Dialog open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
        <DialogContent className="max-w-[95vw] border-calc-border bg-[#02090d] p-5 text-calc-text-primary shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-none sm:max-w-295">
          <DialogHeader>
            <DialogTitle>{howItWorks.title}</DialogTitle>
          </DialogHeader>

          <div className="calc-scrollbar max-h-[65vh] space-y-4 overflow-auto pr-1">
            <p className="rounded-2xl border border-calc-border/70 bg-[#05141c] px-4 py-3 text-[15px] leading-relaxed text-calc-text-secondary">
              {howItWorks.intro}
            </p>

            {howItWorksTrend.data.length > 0 ? (
              <TrendLineChart title={howItWorksTrend.title} data={howItWorksTrend.data} />
            ) : null}

            <ul className="space-y-1 rounded-2xl border border-calc-border/70 bg-[#05141c] p-4 text-[15px] leading-relaxed text-calc-text-primary">
              {howItWorks.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="text-calc-accent">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {howItWorks.sections.map((section) => (
              <section key={section.heading} className="space-y-1.5 rounded-2xl border border-calc-border/70 bg-[#05141c] px-4 py-3">
                <h5 className="text-base font-semibold text-calc-text-primary">{section.heading}</h5>
                {section.body.map((line) => (
                  <p key={line} className="text-[15px] leading-relaxed text-calc-text-secondary">
                    {line}
                  </p>
                ))}
              </section>
            ))}

            <section className="space-y-2 rounded-2xl border border-calc-border/70 bg-[#05141c] px-4 py-3">
              <h5 className="text-base font-semibold text-calc-text-primary">FAQs</h5>
              <ul className="space-y-2 text-sm text-calc-text-secondary">
                {howItWorks.faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  const answer = faqAnswerMap[faq] ?? 'Answer coming soon.';

                  return (
                    <li key={faq} className="rounded-xl border border-calc-border/70 bg-[#071823]">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex((current) => (current === index ? null : index))}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
                      >
                        <span className="text-sm font-medium text-calc-text-primary">{faq}</span>
                        <span className="text-calc-accent">{isOpen ? '-' : '+'}</span>
                      </button>
                      {isOpen ? <p className="px-3 pb-3 text-sm leading-relaxed text-calc-text-secondary">{answer}</p> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalculatorPanel;

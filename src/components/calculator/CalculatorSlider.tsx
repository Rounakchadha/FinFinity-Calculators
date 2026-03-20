import React, { useEffect, useMemo, useState } from 'react';

interface CalculatorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  isCurrency?: boolean;
  showTenureToggle?: boolean;
  onChange: (val: number) => void;
}

const decimalsFromStep = (step: number): number => {
  const stepText = step.toString();
  const decimalIndex = stepText.indexOf('.');
  return decimalIndex === -1 ? 0 : stepText.length - decimalIndex - 1;
};

const formatInputValue = (val: number, isCurrency?: boolean, decimals = 0): string => {
  if (isCurrency) {
    return Math.round(val).toLocaleString('en-IN');
  }

  return decimals === 0 ? String(Math.round(val)) : val.toFixed(decimals);
};

const parseInputValue = (raw: string, isCurrency?: boolean): number => {
  const cleaned = isCurrency
    ? raw.replace(/,/g, '').replace(/[^0-9]/g, '')
    : raw.replace(/[^0-9.]/g, '');

  if (cleaned.trim() === '') {
    return Number.NaN;
  }

  return Number(cleaned);
};

const formatUnit = (unit: string) => {
  if (unit === '%') return '%';
  if (unit === 'yrs') return 'yrs';
  return '';
};

const getInputWidthCh = (displayValue: string, isCurrency?: boolean) => {
  const compactLength = displayValue.trim().length;
  const safeLength = compactLength <= 0 ? 1 : compactLength;
  const minWidth = isCurrency ? 3 : 2;
  const maxWidth = isCurrency ? 12 : 8;

  return Math.min(maxWidth, Math.max(minWidth, safeLength));
};

const generateTicks = (min: number, max: number): number[] => {
  const range = max - min;
  let tickCount = 5;
  
  if (range <= 5) tickCount = range;
  else if (range <= 20) tickCount = 4;
  else if (range <= 50) tickCount = 5;
  else tickCount = 4;

  const ticks: number[] = [min];
  const step = range / tickCount;
  
  for (let i = 1; i < tickCount; i++) {
    const val = min + step * i;
    // Round nicely
    if (range > 1000000) {
      ticks.push(Math.round(val / 100000) * 100000);
    } else if (range > 1000) {
      ticks.push(Math.round(val / 1000) * 1000);
    } else if (range >= 10) {
      ticks.push(Math.round(val * 2) / 2);
    } else {
      ticks.push(Math.round(val * 10) / 10);
    }
  }
  ticks.push(max);
  return ticks;
};

const formatTick = (val: number, isCurrency?: boolean) => {
  if (isCurrency) {
    if (val >= 10000000) return `${(val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
    return val.toString();
  }
  return val % 1 === 0 ? val.toString() : val.toFixed(1);
};

const CalculatorSlider: React.FC<CalculatorSliderProps> = ({
  label, value, min, max, step, unit, isCurrency, showTenureToggle, onChange
}) => {
  const decimals = decimalsFromStep(step);
  const [tenureMode, setTenureMode] = useState<'Yearly' | 'Monthly'>('Yearly');
  const [inputValue, setInputValue] = useState<string>(formatInputValue(value, isCurrency, decimals));

  useEffect(() => {
    setInputValue(formatInputValue(value, isCurrency, decimals));
  }, [value, isCurrency, decimals]);

  const pct = ((value - min) / (max - min)) * 100;
  const ticks = useMemo(() => generateTicks(min, max), [min, max]);
  const unitSuffix = formatUnit(unit);
  const inputWidthCh = getInputWidthCh(inputValue, isCurrency);

  const commitInputValue = (rawValue: string) => {
    const parsed = parseInputValue(rawValue, isCurrency);

    if (!Number.isFinite(parsed)) {
      setInputValue(formatInputValue(value, isCurrency, decimals));
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setInputValue(formatInputValue(clamped, isCurrency, decimals));
  };

  const handleInputChange = (rawValue: string) => {
    setInputValue(rawValue);

    const parsed = parseInputValue(rawValue, isCurrency);
    if (!Number.isFinite(parsed)) {
      return;
    }

    if (parsed < min || parsed > max) {
      return;
    }

    onChange(parsed);
  };

  return (
    <div className="mb-7">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-calc-text-secondary/90 text-[15px] font-medium tracking-wide">{label}</label>
          {showTenureToggle ? (
            <div className="inline-flex rounded-full border border-calc-accent/80 bg-transparent p-0.5">
              <button
                type="button"
                onClick={() => setTenureMode('Yearly')}
                className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                  tenureMode === 'Yearly'
                    ? 'bg-calc-accent text-background'
                    : 'text-calc-text-secondary hover:text-calc-text-primary'
                }`}
              >
                Yearly
              </button>
              <button
                type="button"
                onClick={() => setTenureMode('Monthly')}
                className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                  tenureMode === 'Monthly'
                    ? 'bg-calc-accent text-background'
                    : 'text-calc-text-secondary hover:text-calc-text-primary'
                }`}
              >
                Monthly
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex items-baseline gap-1.5 max-w-[180px]">
          {isCurrency && <span className="calc-number text-calc-accent text-sm font-medium">₹</span>}
          <input
            type="text"
            inputMode={step < 1 ? 'decimal' : 'numeric'}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => commitInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitInputValue((e.target as HTMLInputElement).value);
              }
            }}
            className="calc-number border-b border-calc-accent/70 bg-transparent pb-0.5 text-right text-[22px] leading-none font-medium tabular-nums text-calc-accent outline-none transition-[width,border-color] duration-200 focus:border-calc-accent"
            style={{
              width: `${inputWidthCh}ch`,
              maxWidth: '150px'
            }}
            aria-label={`${label} value`}
          />
          {unitSuffix && <span className="calc-number ml-1 text-calc-accent text-[16px] font-medium">{unitSuffix}</span>}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full calculator-slider"
          style={{
            background: `linear-gradient(to right, rgba(45, 212, 191, 0.95) 0%, rgba(45, 212, 191, 0.95) ${pct}%, rgba(228, 236, 238, 0.95) ${pct}%, rgba(228, 236, 238, 0.95) 100%)`
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-calc-text-muted/90 font-normal">
        {ticks.map((t, i) => (
          <span key={i}>{formatTick(t, isCurrency)}</span>
        ))}
      </div>
    </div>
  );
};

export default CalculatorSlider;

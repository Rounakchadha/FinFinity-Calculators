import React, { useMemo } from 'react';

interface CalculatorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  isCurrency?: boolean;
  onChange: (val: number) => void;
}

const formatValue = (val: number, unit: string, isCurrency?: boolean) => {
  if (isCurrency) return `₹ ${val.toLocaleString('en-IN')}`;
  if (unit === '%') return `${val}`;
  if (unit === 'yrs') return `${val}`;
  return `${val}${unit}`;
};

const formatUnit = (unit: string) => {
  if (unit === '%') return '%';
  if (unit === 'yrs') return 'yrs';
  return '';
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
  label, value, min, max, step, unit, isCurrency, onChange
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  const ticks = useMemo(() => generateTicks(min, max), [min, max]);
  const unitSuffix = formatUnit(unit);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-baseline mb-5">
        <label className="text-calc-text-secondary font-medium text-lg tracking-wide">{label}</label>
        <div className="flex items-baseline gap-1.5">
          {isCurrency && <span className="text-calc-accent text-lg font-medium">₹</span>}
          <span className="text-calc-accent font-semibold text-xl tabular-nums border-b border-calc-accent/40 pb-0.5 min-w-[60px] text-right">
            {isCurrency ? value.toLocaleString('en-IN') : value % 1 === 0 ? value : value.toFixed(value % 1 === 0 ? 0 : unit === '%' && step < 1 ? 2 : 1)}
          </span>
          {unitSuffix && <span className="text-calc-accent text-base font-medium ml-0.5">{unitSuffix}</span>}
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
            background: `linear-gradient(to right, hsl(var(--calc-accent)) 0%, hsl(var(--calc-accent)) ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`
          }}
        />
      </div>
      <div className="flex justify-between mt-2.5 text-xs text-calc-text-muted font-normal">
        {ticks.map((t, i) => (
          <span key={i}>{formatTick(t, isCurrency)}</span>
        ))}
      </div>
    </div>
  );
};

export default CalculatorSlider;

import React from 'react';

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
  if (isCurrency) return `₹${val.toLocaleString('en-IN')}`;
  return `${val}${unit}`;
};

const CalculatorSlider: React.FC<CalculatorSliderProps> = ({
  label, value, min, max, step, unit, isCurrency, onChange
}) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-7">
      <div className="flex justify-between items-center mb-3">
        <label className="text-calc-text-secondary font-medium text-sm">{label}</label>
        <div className="text-calc-accent font-bold text-base tabular-nums bg-calc-accent/5 px-3 py-1 rounded-lg border border-calc-accent/20">
          {formatValue(value, unit, isCurrency)}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, hsl(168 76% 50%) 0%, hsl(168 76% 50%) ${pct}%, hsl(185 15% 14%) ${pct}%, hsl(185 15% 14%) 100%)`
        }}
      />
      <div className="flex justify-between mt-1.5 text-[10px] uppercase tracking-[0.15em] text-calc-text-muted font-semibold">
        <span>{formatValue(min, unit, isCurrency)}</span>
        <span>{formatValue(max, unit, isCurrency)}</span>
      </div>
    </div>
  );
};

export default CalculatorSlider;

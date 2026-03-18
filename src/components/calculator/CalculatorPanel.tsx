import React, { useState } from 'react';
import CalculatorSlider from './CalculatorSlider';
import DonutComparisonChart from './DonutComparisonChart';
import ResultCard from './ResultCard';
import type { CalculatorConfig } from './calculatorData';

interface CalculatorPanelProps {
  config: CalculatorConfig;
}

const CalculatorPanel: React.FC<CalculatorPanelProps> = ({ config }) => {
  const [sliderValues, setSliderValues] = useState<number[]>(
    config.sliders.map((s) => s.defaultValue)
  );

  const handleSliderChange = (index: number, val: number) => {
    setSliderValues((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  return (
    <div>
      <h3 className="text-2xl lg:text-3xl font-bold mb-10 text-calc-text-primary/90">
        {config.title}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left: Sliders */}
        <div className="lg:col-span-5">
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
              onChange={(val) => handleSliderChange(idx, val)}
            />
          ))}
        </div>

        {/* Center: Chart */}
        <div className="lg:col-span-3 flex items-start justify-center pt-4">
          <DonutComparisonChart data={config.chart} />
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {config.results.map((res, idx) => (
            <ResultCard key={idx} label={res.label} value={res.value} highlight={res.highlight} />
          ))}
          <button className="mt-3 w-full py-4 bg-calc-accent hover:brightness-110 text-calc-bg font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-calc-accent/20">
            Get Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPanel;

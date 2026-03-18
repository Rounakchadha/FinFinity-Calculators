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
      <h3 className="text-2xl lg:text-3xl font-bold mb-10 text-calc-text-primary">
        {config.title}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
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
        <div className="lg:col-span-4 flex items-center justify-center pt-4">
          <DonutComparisonChart data={config.chart} />
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 flex flex-col justify-center gap-2">
          {config.results.map((res, idx) => (
            <ResultCard key={idx} label={res.label} value={res.value} highlight={res.highlight} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorPanel;

import React, { useState } from 'react';
import CalculatorTabs from './CalculatorTabs';
import CalculatorPanel from './CalculatorPanel';
import SectionGlowBackground from './SectionGlowBackground';
import { CALCULATOR_DATA, type TabType } from './calculatorData';

const FeaturedCalculatorsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('EMI');

  return (
    <section className="relative min-h-screen bg-background text-foreground py-6 px-4 overflow-hidden lg:py-8">
      <SectionGlowBackground />

      <div className="max-w-[1220px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight text-calc-text-primary">
            Featured Calculators
          </h2>
          <p className="text-calc-text-muted text-sm max-w-xl mx-auto">
            Most popular tools to help you make smart financial decisions
          </p>
        </div>

        {/* Tabs */}
        <CalculatorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Container */}
        <div className="overflow-hidden rounded-3xl border border-calc-border bg-calc-surface/70 p-4 backdrop-blur-md sm:p-5 lg:p-6">
          <CalculatorPanel key={activeTab} tab={activeTab} config={CALCULATOR_DATA[activeTab]} />
        </div>
      </div>
    </section>
  );
};

export default FeaturedCalculatorsSection;

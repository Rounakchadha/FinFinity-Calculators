import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CalculatorTabs from './CalculatorTabs';
import CalculatorPanel from './CalculatorPanel';
import SectionGlowBackground from './SectionGlowBackground';
import { CALCULATOR_DATA, type TabType } from './calculatorData';

const FeaturedCalculatorsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('EMI');

  return (
    <section className="relative min-h-screen bg-background text-foreground py-20 px-4 overflow-hidden">
      <SectionGlowBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight text-calc-text-primary">
            Featured Calculators
          </h2>
          <p className="text-calc-text-muted text-base max-w-xl mx-auto">
            Most popular tools to help you make smart financial decisions
          </p>
        </div>

        {/* Tabs */}
        <CalculatorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Container */}
        <div className="bg-calc-surface/70 backdrop-blur-md border border-calc-border rounded-3xl p-6 sm:p-8 lg:p-10">
          <CalculatorPanel key={activeTab} config={CALCULATOR_DATA[activeTab]} />
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-calc-text-muted text-sm">
          <Info size={14} />
          <p>Figures are estimates based on your assumptions. Please verify with your financial advisor.</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCalculatorsSection;

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CalculatorTabs from './CalculatorTabs';
import CalculatorPanel from './CalculatorPanel';
import LogoBadge from './LogoBadge';
import SectionGlowBackground from './SectionGlowBackground';
import { CALCULATOR_DATA, type TabType } from './calculatorData';

const FeaturedCalculatorsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('EMI');

  return (
    <section className="relative min-h-screen bg-background text-foreground py-20 px-4 overflow-hidden selection:bg-calc-accent/30">
      <SectionGlowBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-calc-text-primary">
            Featured Calculators
          </h2>
          <p className="text-calc-text-secondary text-lg max-w-2xl mx-auto">
            Most popular tools to help you make smart financial decisions
          </p>
        </div>

        {/* Tabs */}
        <CalculatorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Container */}
        <div className="relative bg-calc-surface/80 backdrop-blur-xl border border-calc-border rounded-[32px] lg:rounded-[40px] p-6 sm:p-8 lg:p-12 shadow-2xl">
          <LogoBadge />
          <CalculatorPanel key={activeTab} config={CALCULATOR_DATA[activeTab]} />
        </div>

        {/* Footer Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-calc-text-muted text-sm">
          <Info size={14} />
          <p>Figures are estimates based on your assumptions. Please verify with your financial advisor.</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCalculatorsSection;

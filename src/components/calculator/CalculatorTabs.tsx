import React from 'react';
import type { TabType } from './calculatorData';

const TABS: TabType[] = ['EMI', 'SIP', 'Loan Saver', 'My 1st Crore'];

interface CalculatorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const CalculatorTabs: React.FC<CalculatorTabsProps> = ({ activeTab, onTabChange }) => (
  <div className="flex flex-wrap justify-center gap-3 mb-10">
    {TABS.map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`relative px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
          activeTab === tab
            ? 'bg-calc-accent/10 border-calc-border-active text-calc-accent shadow-[0_0_15px_hsla(168,76%,50%,0.2)]'
            : 'bg-card/40 border-calc-border text-calc-text-secondary hover:bg-card/70 hover:text-calc-text-primary'
        }`}
      >
        {tab}
        {activeTab === tab && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-calc-accent rounded-full animate-pulse shadow-[0_0_8px_hsl(168,76%,50%)]" />
        )}
      </button>
    ))}
  </div>
);

export default CalculatorTabs;

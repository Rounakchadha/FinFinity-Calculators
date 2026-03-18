import React from 'react';
import type { TabType } from './calculatorData';

const TABS: TabType[] = ['EMI', 'SIP', 'Loan Saver', 'My 1st Crore'];

interface CalculatorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const CalculatorTabs: React.FC<CalculatorTabsProps> = ({ activeTab, onTabChange }) => (
  <div className="flex flex-wrap justify-center gap-3 mb-10">
    {TABS.map((tab) => {
      const isActive = activeTab === tab;
      return (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
            isActive
              ? 'border-calc-accent/50 text-calc-accent bg-calc-accent/5'
              : 'border-calc-border text-calc-text-muted bg-calc-surface/60 hover:text-calc-text-secondary hover:border-calc-border/80'
          }`}
        >
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-calc-accent" />
          )}
          {tab}
        </button>
      );
    })}
  </div>
);

export default CalculatorTabs;

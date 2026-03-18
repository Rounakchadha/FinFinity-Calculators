import React from 'react';

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, highlight }) => (
  <div
    className={`p-5 rounded-2xl border transition-all duration-300 ${
      highlight
        ? 'bg-gradient-to-br from-calc-highlight-bg to-calc-surface border-calc-highlight-border/20 shadow-[0_0_20px_hsla(30,60%,35%,0.08)]'
        : 'bg-card/60 border-calc-border hover:border-calc-border-active/30'
    }`}
  >
    <p className="text-calc-text-muted text-[11px] font-bold uppercase tracking-[0.15em] mb-1.5">{label}</p>
    <p className={`text-2xl lg:text-[28px] font-bold tabular-nums ${highlight ? 'text-orange-200' : 'text-calc-text-primary'}`}>
      {value}
    </p>
  </div>
);

export default ResultCard;

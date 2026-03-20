import React from 'react';

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  accentColor?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, highlight }) => {
  if (highlight) {
    return (
      <div className="w-full min-h-33 rounded-2xl border border-calc-accent/20 bg-calc-accent/8 px-6 py-5">
        <p className="mb-1 text-xs font-medium text-calc-text-secondary">{label}</p>
        <p className="calc-number text-calc-accent text-lg font-semibold tabular-nums">{value}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-28 rounded-2xl border border-calc-border/70 bg-calc-surface/60 px-5 py-4 flex items-center gap-4">
      <div className="h-12 w-1.5 shrink-0 rounded-full bg-calc-accent/70" />
      <div>
        <p className="mb-0.5 text-xs font-medium text-calc-text-muted">{label}</p>
        <p className="calc-number text-calc-text-primary text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
};

export default ResultCard;

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
      <div className="p-5 rounded-xl bg-calc-accent/8 border border-calc-accent/20">
        <p className="text-calc-text-secondary text-sm font-medium mb-1">{label}</p>
        <p className="text-calc-accent text-2xl font-bold tabular-nums">{value}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-1 h-10 rounded-full bg-calc-accent/60 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-calc-text-muted text-sm font-medium mb-0.5">{label}</p>
        <p className="text-calc-text-primary text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
};

export default ResultCard;

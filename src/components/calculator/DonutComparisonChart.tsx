import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ChartSegment } from './calculatorData';

const COLORS = ['hsl(170, 80%, 25%)', 'hsl(168, 76%, 50%)'];

interface DonutComparisonChartProps {
  data: ChartSegment[];
}

const DonutComparisonChart: React.FC<DonutComparisonChartProps> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={88}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-calc-text-muted text-[10px] uppercase font-bold tracking-widest">Total</span>
          <span className="text-calc-text-primary text-lg font-bold tabular-nums">
            ₹{(total / 100000).toFixed(1)}L
          </span>
        </div>
      </div>
      <div className="mt-6 space-y-3 w-full max-w-[200px]">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-sm text-calc-text-secondary font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutComparisonChart;

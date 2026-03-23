import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ChartSegment } from './calculatorData';

const COLORS = ['hsl(168, 76%, 44%)', 'hsl(200, 14%, 34%)'];

interface DonutComparisonChartProps {
  data: ChartSegment[];
  compact?: boolean;
}

const DonutComparisonChart: React.FC<DonutComparisonChartProps> = ({ data, compact = false }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  const dataWithPercent = data.map((d) => ({
    ...d,
    percent: total > 0 ? (d.value / total) * 100 : 0,
  }));

  return (
    <div className={`flex items-center justify-start ${compact ? 'gap-3' : 'gap-4'}`}>
      <div className={`${compact ? 'h-32 w-32' : 'h-40 w-40'} shrink-0`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius={compact ? 36 : 48}
              outerRadius={compact ? 56 : 72}
              paddingAngle={2}
              dataKey="value"
              stroke="rgba(5, 18, 27, 0.45)"
              strokeWidth={2}
            >
              {dataWithPercent.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {dataWithPercent.map((item, index) => (
          <div key={item.name} className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-calc-text-secondary">{item.name}</span>
            <span className="font-semibold text-calc-text-primary">{item.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutComparisonChart;

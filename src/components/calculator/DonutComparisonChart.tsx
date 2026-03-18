import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import type { ChartSegment } from './calculatorData';

const COLORS = ['hsl(200, 10%, 30%)', 'hsl(168, 76%, 50%)'];

interface DonutComparisonChartProps {
  data: ChartSegment[];
}

const DonutComparisonChart: React.FC<DonutComparisonChartProps> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  const dataWithPercent = data.map((d) => ({
    ...d,
    percent: ((d.value / total) * 100).toFixed(1),
  }));

  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = dataWithPercent[index]?.percent;

    return (
      <text
        x={x}
        y={y}
        fill={index === 0 ? 'hsl(180, 10%, 70%)' : 'hsl(192, 75%, 2%)'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
      >
        {pct}%
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              label={renderCustomLabel}
              labelLine={false}
            >
              {dataWithPercent.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutComparisonChart;

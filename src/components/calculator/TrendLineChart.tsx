import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrencyINR } from '@/lib/calculators/formatters';

export type TrendPoint = {
  label: string;
  value: number;
};

interface TrendLineChartProps {
  title: string;
  data: TrendPoint[];
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({ title, data }) => {
  return (
    <div className="w-full rounded-2xl border border-calc-border/80 bg-calc-surface/60 p-4">
      <p className="mb-3 text-sm font-semibold text-calc-text-secondary">{title}</p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'hsl(200 20% 62%)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(val) => `${Math.round(Number(val) / 1000)}K`}
              tick={{ fill: 'hsl(200 20% 62%)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value: number) => formatCurrencyINR(Number(value))}
              labelStyle={{ color: 'hsl(190 18% 80%)' }}
              contentStyle={{
                backgroundColor: 'rgba(4, 17, 24, 0.95)',
                border: '1px solid rgba(45, 212, 191, 0.22)',
                borderRadius: '12px',
                color: 'hsl(180 14% 90%)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(168 76% 50%)"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: 'hsl(168 76% 50%)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendLineChart;
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scan } from '@/types/scan';

interface TrendChartProps {
  scans: Scan[];
  dataKey: string;
  label: string;
  unit?: string;
  color?: string;
}

export default function TrendChart({ scans, dataKey, label, unit, color = '#10B981' }: TrendChartProps) {
  // Prepare data for chart
  const chartData = scans
    .filter(scan => {
      const value = (scan as any)[dataKey];
      return value !== null && value !== undefined;
    })
    .map(scan => {
      const date = new Date(scan.scan_date || scan.created_at);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        value: (scan as any)[dataKey],
      };
    })
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  if (chartData.length === 0) {
    return (
      <div className="card-soft p-8 text-center">
        <p className="text-sage-600">No data available for {label}</p>
      </div>
    );
  }

  return (
    <div className="card-soft p-6">
      <h3 className="text-xl font-display font-semibold text-sage-900 mb-4">
        {label} Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            label={{ value: unit, angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              padding: '8px',
            }}
            formatter={(value: number) => [
              `${value.toFixed(1)}${unit ? ` ${unit}` : ''}`,
              label,
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}




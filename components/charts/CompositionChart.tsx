"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scan } from '@/types/scan';

interface CompositionChartProps {
  scans: Scan[];
}

export default function CompositionChart({ scans }: CompositionChartProps) {
  // Prepare data for chart - muscle mass vs fat mass
  const chartData = scans
    .filter(scan => 
      scan.skeletal_muscle_mass !== null && 
      scan.body_fat_mass !== null
    )
    .map(scan => {
      const date = new Date(scan.scan_date || scan.created_at);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        muscle: scan.skeletal_muscle_mass,
        fat: scan.body_fat_mass,
      };
    })
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  if (chartData.length === 0) {
    return (
      <div className="card-soft p-8 text-center">
        <p className="text-sage-600">No composition data available</p>
      </div>
    );
  }

  return (
    <div className="card-soft p-6">
      <h3 className="text-xl font-display font-semibold text-sage-900 mb-4">
        Body Composition Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              padding: '8px',
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} lbs`,
              name === 'muscle' ? 'Muscle Mass' : 'Fat Mass',
            ]}
          />
          <Legend
            formatter={(value) => value === 'muscle' ? 'Muscle Mass' : 'Fat Mass'}
          />
          <Area
            type="monotone"
            dataKey="muscle"
            stackId="1"
            stroke="#10B981"
            fill="url(#colorMuscle)"
            name="muscle"
          />
          <Area
            type="monotone"
            dataKey="fat"
            stackId="1"
            stroke="#F59E0B"
            fill="url(#colorFat)"
            name="fat"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


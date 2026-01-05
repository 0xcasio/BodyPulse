"use client";

import ChangeIndicator from "./ChangeIndicator";

interface ComparisonCardProps {
  label: string;
  value1: number | null;
  value2: number | null;
  unit?: string;
  change: number | null;
  percentChange: number | null;
  improvementDirection?: 'up' | 'down';
}

export default function ComparisonCard({
  label,
  value1,
  value2,
  unit,
  change,
  percentChange,
  improvementDirection = 'up',
}: ComparisonCardProps) {
  const isImprovement = change !== null && (
    improvementDirection === 'up' ? change > 0 : change < 0
  );

  return (
    <div className="card-soft p-6">
      <h3 className="text-lg font-display font-semibold text-sage-900 mb-4">
        {label}
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* First Value */}
        <div className="text-center">
          <div className="text-sm text-sage-600 mb-2">First Scan</div>
          <div className="text-2xl font-display font-bold text-sage-900">
            {value1 !== null ? value1.toFixed(1) : 'N/A'}
            {value1 !== null && unit && (
              <span className="text-sm text-sage-600 ml-1">{unit}</span>
            )}
          </div>
        </div>

        {/* Second Value */}
        <div className="text-center">
          <div className="text-sm text-sage-600 mb-2">Second Scan</div>
          <div className="text-2xl font-display font-bold text-sage-900">
            {value2 !== null ? value2.toFixed(1) : 'N/A'}
            {value2 !== null && unit && (
              <span className="text-sm text-sage-600 ml-1">{unit}</span>
            )}
          </div>
        </div>
      </div>

      {/* Change Indicator */}
      {change !== null && (
        <div className="mt-4 pt-4 border-t border-sage-200">
          <ChangeIndicator
            change={change}
            percentChange={percentChange}
            unit={unit}
            isImprovement={isImprovement}
          />
        </div>
      )}
    </div>
  );
}


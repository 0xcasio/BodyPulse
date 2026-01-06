"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ChangeIndicatorProps {
  change: number;
  percentChange: number | null;
  unit?: string;
  isImprovement?: boolean;
}

export default function ChangeIndicator({
  change,
  percentChange,
  unit,
  isImprovement = false,
}: ChangeIndicatorProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  // Determine color based on whether it's an improvement
  const getColor = () => {
    if (isNeutral) return 'text-sage-500';
    if (isImprovement) return 'text-sage-600';
    return 'text-amber-600';
  };

  const getBgColor = () => {
    if (isNeutral) return 'bg-sage-100';
    if (isImprovement) return 'bg-sage-100';
    return 'bg-amber-100';
  };

  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full ${getBgColor()}`}>
      {isPositive && <TrendingUp className={`w-4 h-4 ${getColor()}`} />}
      {isNegative && <TrendingDown className={`w-4 h-4 ${getColor()}`} />}
      {isNeutral && <Minus className={`w-4 h-4 ${getColor()}`} />}
      
      <span className={`font-semibold ${getColor()}`}>
        {isPositive ? '+' : ''}{change.toFixed(1)}
        {unit && <span className="ml-1">{unit}</span>}
      </span>
      
      {percentChange !== null && (
        <span className={`text-sm ${getColor()}`}>
          ({isPositive ? '+' : ''}{percentChange.toFixed(1)}%)
        </span>
      )}
    </div>
  );
}



"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getMetricStatus, getMetricTip, METRIC_EXPLANATIONS } from "@/lib/metrics";

interface MetricCardProps {
  metricKey: string;
  value: number;
  unit?: string;
  gender?: 'male' | 'female';
  previousValue?: number;
  delay?: string;
}

export default function MetricCard({
  metricKey,
  value,
  unit,
  gender,
  previousValue,
  delay = '0s',
}: MetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const metric = METRIC_EXPLANATIONS[metricKey];
  if (!metric) {
    return null;
  }

  const status = getMetricStatus(metricKey, value, gender);
  const tip = getMetricTip(metricKey, value, gender);

  const statusConfig = {
    excellent: {
      badge: 'status-excellent',
      label: 'Excellent',
      icon: TrendingUp,
    },
    good: {
      badge: 'status-good',
      label: 'Good',
      icon: Minus,
    },
    moderate: {
      badge: 'status-moderate',
      label: 'Monitor',
      icon: Minus,
    },
    attention: {
      badge: 'status-attention',
      label: 'Needs Attention',
      icon: TrendingDown,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const displayUnit = unit || metric.unit || '';

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="card-soft p-6 cursor-pointer select-none w-full"
      onClick={handleClick}
      style={{ backgroundColor: isExpanded ? '#f0f4f0' : undefined }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-sage-600 mb-1">
            {metric.label}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-sage-900">
              {value.toFixed(1)}
            </span>
            {displayUnit && (
              <span className="text-lg text-sage-500">{displayUnit}</span>
            )}
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${config.badge}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{config.label}</span>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="pt-4 border-t border-sage-100 space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-sage-700 mb-1">What this means:</h4>
            <p className="text-sm text-sage-600">{metric.description}</p>
          </div>

          {metric.healthyRange && (
            <div>
              <h4 className="text-xs font-semibold text-sage-700 mb-1">Healthy Range:</h4>
              <p className="text-sm text-sage-600">{metric.healthyRange}</p>
            </div>
          )}

          {tip && (
            <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
              <h4 className="text-xs font-semibold text-sage-700 mb-1">Tip:</h4>
              <p className="text-sm text-sage-600">{tip}</p>
            </div>
          )}
        </div>
      )}

      {/* Expand Indicator */}
      <div className="flex items-center justify-center mt-4">
        <div
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <ChevronDown className="w-4 h-4 text-sage-400" />
        </div>
      </div>
    </div>
  );
}

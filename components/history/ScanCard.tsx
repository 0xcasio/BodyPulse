"use client";

import { Calendar, TrendingUp, TrendingDown, ArrowRight, BarChart3, Trash2 } from "lucide-react";
import { Scan } from "@/types/scan";

interface ScanCardProps {
  scan: Scan;
  onView: () => void;
  onCompare: () => void;
  onDelete?: () => void;
  showTrend?: boolean;
  previousScan?: Scan | null;
}

export default function ScanCard({ scan, onView, onCompare, onDelete, showTrend, previousScan }: ScanCardProps) {
  const scanDate = new Date(scan.scan_date || scan.created_at);
  const formattedDate = scanDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return current - previous;
  };

  const getChangePercent = (current: number | null, previous: number | null) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const weightChange = showTrend && previousScan
    ? getChange(scan.weight, previousScan.weight)
    : null;

  const bodyFatChange = showTrend && previousScan
    ? getChange(scan.body_fat_percentage, previousScan.body_fat_percentage)
    : null;

  const muscleChange = showTrend && previousScan && scan.skeletal_muscle_mass && previousScan.skeletal_muscle_mass
    ? getChange(scan.skeletal_muscle_mass, previousScan.skeletal_muscle_mass)
    : null;

  return (
    <div className="card-soft p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Date and Key Metrics */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-sage-600" />
            <span className="font-display font-semibold text-sage-900">{formattedDate}</span>
            {scan.test_time && (
              <span className="text-sm text-sage-600">at {scan.test_time}</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Weight */}
            <div>
              <div className="text-xs text-sage-600 mb-1">Weight</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-sage-900">
                  {scan.weight.toFixed(1)}
                </span>
                <span className="text-sm text-sage-600">{scan.weight_unit}</span>
                {weightChange !== null && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    weightChange > 0 ? 'text-amber-600' : weightChange < 0 ? 'text-sage-600' : 'text-sage-500'
                  }`}>
                    {weightChange > 0 ? <TrendingUp className="w-3 h-3" /> : weightChange < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Body Fat % */}
            <div>
              <div className="text-xs text-sage-600 mb-1">Body Fat</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-sage-900">
                  {scan.body_fat_percentage?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-sm text-sage-600">%</span>
                {bodyFatChange !== null && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    bodyFatChange < 0 ? 'text-sage-600' : bodyFatChange > 0 ? 'text-amber-600' : 'text-sage-500'
                  }`}>
                    {bodyFatChange < 0 ? <TrendingDown className="w-3 h-3" /> : bodyFatChange > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                    {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Muscle Mass */}
            <div>
              <div className="text-xs text-sage-600 mb-1">Muscle Mass</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-sage-900">
                  {scan.skeletal_muscle_mass?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-sm text-sage-600">{scan.weight_unit}</span>
                {muscleChange !== null && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    muscleChange > 0 ? 'text-sage-600' : muscleChange < 0 ? 'text-amber-600' : 'text-sage-500'
                  }`}>
                    {muscleChange > 0 ? <TrendingUp className="w-3 h-3" /> : muscleChange < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {muscleChange > 0 ? '+' : ''}{muscleChange.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* InBody Score */}
            <div>
              <div className="text-xs text-sage-600 mb-1">InBody Score</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-sage-900">
                  {scan.inbody_score || 'N/A'}
                </span>
                {scan.inbody_score && (
                  <div className={`w-2 h-2 rounded-full ${
                    scan.inbody_score >= 80 ? 'bg-sage-500' :
                    scan.inbody_score >= 60 ? 'bg-amber-500' :
                    'bg-terracotta-500'
                  }`} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-terracotta-600 border-2 border-terracotta-200 hover:border-terracotta-300 hover:bg-terracotta-50 flex items-center gap-2"
              title="Delete scan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onCompare}
            className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Compare</span>
          </button>
          <button
            onClick={onView}
            className="btn-organic flex items-center gap-2"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


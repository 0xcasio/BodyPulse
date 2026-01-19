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
    <div className="card-soft p-4 md:p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Date and Key Metrics */}
        <div className="flex-1 min-w-0 w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-3 mb-3 flex-wrap">
            <Calendar className="w-5 h-5 text-sage-600 flex-shrink-0" />
            <span className="font-display font-semibold text-sage-900 truncate">{formattedDate}</span>
            {scan.test_time && (
              <span className="text-sm text-sage-600 whitespace-nowrap">at {scan.test_time}</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Weight */}
            <div className="min-w-0">
              <div className="text-xs text-sage-600 mb-1 truncate">Weight</div>
              <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                <span className="text-lg md:text-xl font-display font-bold text-sage-900 break-words">
                  {scan.weight.toFixed(1)}
                </span>
                <span className="text-xs md:text-sm text-sage-600 whitespace-nowrap">{scan.weight_unit}</span>
                {weightChange !== null && (
                  <span className={`text-xs font-medium flex items-center gap-1 whitespace-nowrap ${
                    weightChange > 0 ? 'text-amber-600' : weightChange < 0 ? 'text-sage-600' : 'text-sage-500'
                  }`}>
                    {weightChange > 0 ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : weightChange < 0 ? <TrendingDown className="w-3 h-3 flex-shrink-0" /> : null}
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Body Fat % */}
            <div className="min-w-0">
              <div className="text-xs text-sage-600 mb-1 truncate">Body Fat</div>
              <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                <span className="text-lg md:text-xl font-display font-bold text-sage-900 break-words">
                  {scan.body_fat_percentage?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-xs md:text-sm text-sage-600 whitespace-nowrap">%</span>
                {bodyFatChange !== null && (
                  <span className={`text-xs font-medium flex items-center gap-1 whitespace-nowrap ${
                    bodyFatChange < 0 ? 'text-sage-600' : bodyFatChange > 0 ? 'text-amber-600' : 'text-sage-500'
                  }`}>
                    {bodyFatChange < 0 ? <TrendingDown className="w-3 h-3 flex-shrink-0" /> : bodyFatChange > 0 ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : null}
                    {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Muscle Mass */}
            <div className="min-w-0">
              <div className="text-xs text-sage-600 mb-1 truncate">Muscle Mass</div>
              <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                <span className="text-lg md:text-xl font-display font-bold text-sage-900 break-words">
                  {scan.skeletal_muscle_mass?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-xs md:text-sm text-sage-600 whitespace-nowrap">{scan.weight_unit}</span>
                {muscleChange !== null && (
                  <span className={`text-xs font-medium flex items-center gap-1 whitespace-nowrap ${
                    muscleChange > 0 ? 'text-sage-600' : muscleChange < 0 ? 'text-amber-600' : 'text-sage-500'
                  }`}>
                    {muscleChange > 0 ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : muscleChange < 0 ? <TrendingDown className="w-3 h-3 flex-shrink-0" /> : null}
                    {muscleChange > 0 ? '+' : ''}{muscleChange.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* InBody Score */}
            <div className="min-w-0">
              <div className="text-xs text-sage-600 mb-1 truncate">InBody Score</div>
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-lg md:text-xl font-display font-bold text-sage-900 break-words">
                  {scan.inbody_score || 'N/A'}
                </span>
                {scan.inbody_score && (
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
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
        <div className="flex gap-2 w-full md:w-auto">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 md:px-4 py-2.5 rounded-full font-medium transition-all duration-300 bg-white text-terracotta-600 border-2 border-terracotta-200 hover:border-terracotta-300 hover:bg-terracotta-50 flex items-center justify-center gap-2 min-h-[44px] flex-shrink-0"
              title="Delete scan"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
          <button
            onClick={onCompare}
            className="px-3 md:px-4 py-2.5 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 flex items-center justify-center gap-2 min-h-[44px] text-sm whitespace-nowrap flex-1 md:flex-initial"
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Compare</span>
          </button>
          <button
            onClick={onView}
            className="btn-organic flex items-center justify-center gap-2 min-h-[44px] px-3 md:px-4 py-2.5 text-sm whitespace-nowrap flex-1 md:flex-initial"
          >
            <span className="truncate">View Details</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}


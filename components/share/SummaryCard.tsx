"use client";

import { Scan } from "@/types/scan";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface SummaryCardProps {
  scan: Scan;
  previousScan?: Scan | null;
  theme?: 'light' | 'dark' | 'branded';
  onExport?: () => void;
}

export default function SummaryCard({ 
  scan, 
  previousScan, 
  theme = 'light',
  onExport 
}: SummaryCardProps) {
  const scanDate = new Date(scan.scan_date || scan.created_at);
  const formattedDate = scanDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return current - previous;
  };

  const weightChange = previousScan ? calculateChange(scan.weight, previousScan.weight) : null;
  const bodyFatChange = previousScan ? calculateChange(scan.body_fat_percentage, previousScan.body_fat_percentage) : null;
  const muscleChange = previousScan && scan.skeletal_muscle_mass && previousScan.skeletal_muscle_mass
    ? calculateChange(scan.skeletal_muscle_mass, previousScan.skeletal_muscle_mass)
    : null;

  const themeClasses = {
    light: 'bg-white text-sage-900',
    dark: 'bg-sage-900 text-white',
    branded: 'bg-gradient-to-br from-sage-50 to-terracotta-50 text-sage-900',
  };

  return (
    <div 
      id="summary-card"
      className={`${themeClasses[theme]} rounded-2xl p-8 shadow-lg max-w-md mx-auto`}
      style={{ width: '800px', height: '600px' }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold mb-2">InBody Scan Results</h1>
          <div className="flex items-center gap-2 text-sage-600">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Weight */}
          <div>
            <div className="text-sm text-sage-600 mb-2">Weight</div>
            <div className="text-4xl font-display font-bold mb-2">
              {scan.weight.toFixed(1)}
              <span className="text-xl ml-1">{scan.weight_unit}</span>
            </div>
            {weightChange !== null && (
              <div className={`flex items-center gap-1 text-sm ${
                weightChange > 0 ? 'text-amber-600' : weightChange < 0 ? 'text-sage-600' : 'text-sage-500'
              }`}>
                {weightChange > 0 ? <TrendingUp className="w-4 h-4" /> : weightChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {scan.weight_unit}
              </div>
            )}
          </div>

          {/* Body Fat % */}
          <div>
            <div className="text-sm text-sage-600 mb-2">Body Fat</div>
            <div className="text-4xl font-display font-bold mb-2">
              {scan.body_fat_percentage?.toFixed(1) || 'N/A'}
              <span className="text-xl ml-1">%</span>
            </div>
            {bodyFatChange !== null && (
              <div className={`flex items-center gap-1 text-sm ${
                bodyFatChange < 0 ? 'text-sage-600' : bodyFatChange > 0 ? 'text-amber-600' : 'text-sage-500'
              }`}>
                {bodyFatChange < 0 ? <TrendingDown className="w-4 h-4" /> : bodyFatChange > 0 ? <TrendingUp className="w-4 h-4" /> : null}
                {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Muscle Mass */}
          <div>
            <div className="text-sm text-sage-600 mb-2">Muscle Mass</div>
            <div className="text-4xl font-display font-bold mb-2">
              {scan.skeletal_muscle_mass?.toFixed(1) || 'N/A'}
              <span className="text-xl ml-1">{scan.weight_unit}</span>
            </div>
            {muscleChange !== null && (
              <div className={`flex items-center gap-1 text-sm ${
                muscleChange > 0 ? 'text-sage-600' : muscleChange < 0 ? 'text-amber-600' : 'text-sage-500'
              }`}>
                {muscleChange > 0 ? <TrendingUp className="w-4 h-4" /> : muscleChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                {muscleChange > 0 ? '+' : ''}{muscleChange.toFixed(1)} {scan.weight_unit}
              </div>
            )}
          </div>

          {/* InBody Score */}
          <div>
            <div className="text-sm text-sage-600 mb-2">InBody Score</div>
            <div className="text-4xl font-display font-bold mb-2">
              {scan.inbody_score || 'N/A'}
            </div>
            {scan.inbody_score && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  scan.inbody_score >= 80 ? 'bg-sage-500' :
                  scan.inbody_score >= 60 ? 'bg-amber-500' :
                  'bg-terracotta-500'
                }`} />
                <span className="text-sm text-sage-600">
                  {scan.inbody_score >= 80 ? 'Excellent' :
                   scan.inbody_score >= 60 ? 'Good' :
                   'Needs Improvement'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-sage-200">
          <div className="text-center text-sm text-sage-600">
            InBody Scan Analyzer
          </div>
        </div>
      </div>
    </div>
  );
}



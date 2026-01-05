"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, TrendingUp, ArrowRight, Upload, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { getUserScans, deleteScan } from "@/lib/db/queries";
import { Scan } from "@/types/scan";
import ScanCard from "@/components/history/ScanCard";
import TrendChart from "@/components/charts/TrendChart";
import CompositionChart from "@/components/charts/CompositionChart";
import { getSession } from "@/lib/auth";
import { pageVariants, fadeInUp, staggerContainer, scrollFadeIn } from "@/lib/motion";

type DateRange = '1month' | '3months' | '6months' | '1year' | 'all';

export default function HistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [filteredScans, setFilteredScans] = useState<Scan[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { session } = await getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    loadScans();
  };

  useEffect(() => {
    filterScansByDateRange();
  }, [scans, dateRange]);

  const loadScans = async () => {
    setIsLoading(true);
    try {
      const userScans = await getUserScans();
      setScans(userScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterScansByDateRange = () => {
    if (dateRange === 'all') {
      setFilteredScans(scans);
      return;
    }

    const now = new Date();
    const cutoffDate = new Date();

    switch (dateRange) {
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filtered = scans.filter(scan => {
      const scanDate = new Date(scan.scan_date || scan.created_at);
      return scanDate >= cutoffDate;
    });

    setFilteredScans(filtered);
  };

  const handleCompare = (scanId: string) => {
    // Store selected scan for comparison
    sessionStorage.setItem('compareScan1', scanId);
    router.push('/compare');
  };

  const handleDelete = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteScan(scanId);
      if (success) {
        // Reload scans after deletion
        await loadScans();
      } else {
        alert('Failed to delete scan. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      alert('An error occurred while deleting the scan.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-sage-600">Loading your scan history...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen blob-bg">
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <h1 className="text-3xl md:text-5xl font-display font-bold gradient-text mb-2">
            Scan History
          </h1>
          <p className="text-lg text-sage-600">
            Track your body composition progress over time
          </p>
        </motion.div>

        {/* Filters and Stats */}
        <div className="card-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-sage-600" />
              <span className="text-sm font-medium text-sage-700">Filter by date:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="px-4 py-2 rounded-full border-2 border-sage-200 bg-white text-sage-700 focus:border-sage-400 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-sage-900">
                  {filteredScans.length}
                </div>
                <div className="text-sm text-sage-600">Total Scans</div>
              </div>
              <button
                onClick={() => router.push('/')}
                className="btn-organic flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload New Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        {filteredScans.length > 0 && (
          <div className="card-soft p-6 mb-8">
            <h2 className="text-xl font-display font-semibold text-sage-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-sage-600 mb-1">Weight Change</div>
                <div className="text-2xl font-display font-bold text-sage-900">
                  {(() => {
                    if (filteredScans.length < 2) {
                      return filteredScans[0]?.weight ? `${filteredScans[0].weight.toFixed(1)}` : 'N/A';
                    }
                    const first = filteredScans[filteredScans.length - 1];
                    const latest = filteredScans[0];
                    if (!first.weight || !latest.weight) return 'N/A';
                    const change = latest.weight - first.weight;
                    return change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
                  })()}
                  {filteredScans.length >= 2 && (
                    <span className="text-sm text-sage-600 ml-1">
                      {filteredScans[0]?.weight_unit || 'lbs'}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-sage-600 mb-1">Body Fat Change</div>
                <div className="text-2xl font-display font-bold text-sage-900">
                  {(() => {
                    if (filteredScans.length < 2) {
                      return filteredScans[0]?.body_fat_percentage ? `${filteredScans[0].body_fat_percentage.toFixed(1)}%` : 'N/A';
                    }
                    const first = filteredScans[filteredScans.length - 1];
                    const latest = filteredScans[0];
                    if (!first.body_fat_percentage || !latest.body_fat_percentage) return 'N/A';
                    const change = latest.body_fat_percentage - first.body_fat_percentage;
                    return change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
                  })()}
                  {filteredScans.length >= 2 && (
                    <span className="text-sm text-sage-600 ml-1">%</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-sage-600 mb-1">InBody Score</div>
                <div className="text-2xl font-display font-bold text-sage-900">
                  {filteredScans[0]?.inbody_score || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-sage-600 mb-1">Time Span</div>
                <div className="text-2xl font-display font-bold text-sage-900">
                  {(() => {
                    if (filteredScans.length < 2) return 'N/A';
                    const first = new Date(filteredScans[filteredScans.length - 1].scan_date || filteredScans[filteredScans.length - 1].created_at);
                    const latest = new Date(filteredScans[0].scan_date || filteredScans[0].created_at);
                    const days = Math.floor((latest.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
                    return `${days} days`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredScans.length === 0 && (
          <div className="card-soft p-12 text-center">
            <Calendar className="w-16 h-16 text-sage-300 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold text-sage-900 mb-2">
              {scans.length === 0 ? 'No Scans Yet' : 'No Scans in This Range'}
            </h2>
            <p className="text-sage-600 mb-6">
              {scans.length === 0
                ? 'Upload your first InBody scan to start tracking your progress'
                : 'Try selecting a different date range'}
            </p>
            {scans.length === 0 && (
              <button
                onClick={() => router.push('/')}
                className="btn-organic inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Your First Scan</span>
              </button>
            )}
          </div>
        )}

        {/* Scan Timeline */}
        {filteredScans.length > 0 && (
          <div className="space-y-4">
            {filteredScans.map((scan, index) => (
              <ScanCard
                key={scan.id}
                scan={scan}
                onView={() => router.push(`/dashboard/${scan.id}`)}
                onCompare={() => handleCompare(scan.id)}
                onDelete={() => handleDelete(scan.id)}
                showTrend={index > 0}
                previousScan={index > 0 ? filteredScans[index - 1] : null}
              />
            ))}
          </div>
        )}

        {/* Charts Section */}
        {filteredScans.length > 1 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-display font-bold text-sage-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Progress Trends
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                scans={filteredScans}
                dataKey="weight"
                label="Weight"
                unit={filteredScans[0]?.weight_unit || 'lbs'}
                color="#10B981"
              />
              <TrendChart
                scans={filteredScans}
                dataKey="body_fat_percentage"
                label="Body Fat Percentage"
                unit="%"
                color="#F59E0B"
              />
              <TrendChart
                scans={filteredScans}
                dataKey="skeletal_muscle_mass"
                label="Skeletal Muscle Mass"
                unit={filteredScans[0]?.weight_unit || 'lbs'}
                color="#3B82F6"
              />
              <TrendChart
                scans={filteredScans}
                dataKey="inbody_score"
                label="InBody Score"
                unit="points"
                color="#8B5CF6"
              />
            </div>

            <CompositionChart scans={filteredScans} />
          </div>
        )}
      </motion.div>
    </main>
  );
}


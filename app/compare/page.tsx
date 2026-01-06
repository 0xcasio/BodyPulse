"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { getScanById, getUserScans } from "@/lib/db/queries";
import { Scan } from "@/types/scan";
import ComparisonCard from "@/components/compare/ComparisonCard";
import ChangeIndicator from "@/components/compare/ChangeIndicator";
import { getSession } from "@/lib/auth";
import { pageVariants, fadeInUp } from "@/lib/motion";

export default function ComparePage() {
  const router = useRouter();
  const [scan1, setScan1] = useState<Scan | null>(null);
  const [scan2, setScan2] = useState<Scan | null>(null);
  const [availableScans, setAvailableScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScan1Id, setSelectedScan1Id] = useState<string | null>(null);
  const [selectedScan2Id, setSelectedScan2Id] = useState<string | null>(null);

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
    if (selectedScan1Id) {
      loadScan(selectedScan1Id, setScan1);
    }
  }, [selectedScan1Id]);

  useEffect(() => {
    if (selectedScan2Id) {
      loadScan(selectedScan2Id, setScan2);
    }
  }, [selectedScan2Id]);

  const loadScans = async () => {
    setIsLoading(true);
    try {
      const scans = await getUserScans();
      setAvailableScans(scans);

      // Check if scans were preselected from history page
      const compareScan1 = sessionStorage.getItem('compareScan1');
      if (compareScan1) {
        setSelectedScan1Id(compareScan1);
        sessionStorage.removeItem('compareScan1');
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScan = async (scanId: string, setter: (scan: Scan | null) => void) => {
    try {
      const scan = await getScanById(scanId);
      setter(scan);
    } catch (error) {
      console.error('Error loading scan:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;
    return current - previous;
  };

  const calculatePercentChange = (current: number | null, previous: number | null) => {
    if (current === null || previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-sage-600">Loading comparison...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen blob-bg">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to History</span>
          </button>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-sage-900 mb-2">
            Compare Scans
          </h1>
          <p className="text-lg text-sage-600">
            Side-by-side comparison of your body composition changes
          </p>
        </div>

        {/* Scan Selection */}
        {(!scan1 || !scan2) && (
          <div className="card-soft p-6 mb-8">
            <h2 className="text-xl font-display font-semibold text-sage-900 mb-4">
              Select Two Scans to Compare
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  First Scan
                </label>
                <select
                  value={selectedScan1Id || ''}
                  onChange={(e) => setSelectedScan1Id(e.target.value || null)}
                  className="w-full px-4 py-2 rounded-full border-2 border-sage-200 bg-white text-sage-700 focus:border-sage-400 focus:outline-none"
                >
                  <option value="">Select a scan...</option>
                  {availableScans.map((scan) => (
                    <option key={scan.id} value={scan.id}>
                      {formatDate(scan.scan_date || scan.created_at)} - {scan.weight.toFixed(1)} {scan.weight_unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Second Scan
                </label>
                <select
                  value={selectedScan2Id || ''}
                  onChange={(e) => setSelectedScan2Id(e.target.value || null)}
                  className="w-full px-4 py-2 rounded-full border-2 border-sage-200 bg-white text-sage-700 focus:border-sage-400 focus:outline-none"
                >
                  <option value="">Select a scan...</option>
                  {availableScans
                    .filter((scan) => scan.id !== selectedScan1Id)
                    .map((scan) => (
                      <option key={scan.id} value={scan.id}>
                        {formatDate(scan.scan_date || scan.created_at)} - {scan.weight.toFixed(1)} {scan.weight_unit}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {scan1 && scan2 && (() => {
          // Determine which scan is older and which is newer based on dates
          const date1 = new Date(scan1.scan_date || scan1.created_at);
          const date2 = new Date(scan2.scan_date || scan2.created_at);
          const isScan1Older = date1.getTime() < date2.getTime();
          
          // Always use older scan as baseline (previous) and newer scan for comparison (latest)
          const previousScan = isScan1Older ? scan1 : scan2;
          const latestScan = isScan1Older ? scan2 : scan1;
          
          // Calculate time difference (always positive, from older to newer)
          const days = Math.abs(Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)));
          
          return (
            <div className="space-y-6">
              {/* Header with Dates */}
              <div className="card-soft p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="text-center md:text-left">
                    <div className="text-sm text-sage-600 mb-1">Previous Scan</div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Calendar className="w-4 h-4 text-sage-600" />
                      <span className="font-display font-semibold text-sage-900">
                        {formatDate(previousScan.scan_date || previousScan.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-sage-600 mb-1">Time Difference</div>
                    <div className="font-display font-semibold text-sage-900">
                      {days} days
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-sm text-sage-600 mb-1">Latest Scan</div>
                    <div className="flex items-center gap-2 justify-center md:justify-end">
                      <Calendar className="w-4 h-4 text-sage-600" />
                      <span className="font-display font-semibold text-sage-900">
                        {formatDate(latestScan.scan_date || latestScan.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ComparisonCard
                  label="Weight"
                  value1={previousScan.weight}
                  value2={latestScan.weight}
                  unit={previousScan.weight_unit}
                  change={calculateChange(latestScan.weight, previousScan.weight)}
                  percentChange={calculatePercentChange(latestScan.weight, previousScan.weight)}
                  improvementDirection="down" // Lower weight is better (generally)
                  scan1Label="Previous Scan"
                  scan2Label="Latest Scan"
                />
                <ComparisonCard
                  label="Body Fat Percentage"
                  value1={previousScan.body_fat_percentage}
                  value2={latestScan.body_fat_percentage}
                  unit="%"
                  change={calculateChange(latestScan.body_fat_percentage, previousScan.body_fat_percentage)}
                  percentChange={calculatePercentChange(latestScan.body_fat_percentage, previousScan.body_fat_percentage)}
                  improvementDirection="down" // Lower is better
                  scan1Label="Previous Scan"
                  scan2Label="Latest Scan"
                />
                <ComparisonCard
                  label="Skeletal Muscle Mass"
                  value1={previousScan.skeletal_muscle_mass}
                  value2={latestScan.skeletal_muscle_mass}
                  unit={previousScan.weight_unit}
                  change={calculateChange(latestScan.skeletal_muscle_mass, previousScan.skeletal_muscle_mass)}
                  percentChange={calculatePercentChange(latestScan.skeletal_muscle_mass, previousScan.skeletal_muscle_mass)}
                  improvementDirection="up" // Higher is better
                  scan1Label="Previous Scan"
                  scan2Label="Latest Scan"
                />
                <ComparisonCard
                  label="InBody Score"
                  value1={previousScan.inbody_score}
                  value2={latestScan.inbody_score}
                  unit="points"
                  change={calculateChange(latestScan.inbody_score, previousScan.inbody_score)}
                  percentChange={calculatePercentChange(latestScan.inbody_score, previousScan.inbody_score)}
                  improvementDirection="up" // Higher is better
                  scan1Label="Previous Scan"
                  scan2Label="Latest Scan"
                />
                <ComparisonCard
                  label="BMI"
                  value1={previousScan.bmi}
                  value2={latestScan.bmi}
                  unit="kg/m²"
                  change={calculateChange(latestScan.bmi, previousScan.bmi)}
                  percentChange={calculatePercentChange(latestScan.bmi, previousScan.bmi)}
                  improvementDirection="down" // Lower is generally better
                  scan1Label="Previous Scan"
                  scan2Label="Latest Scan"
                />
                <ComparisonCard
                  label="Visceral Fat Level"
                  value1={previousScan.visceral_fat_level}
                  value2={latestScan.visceral_fat_level}
                  unit="level"
                  change={calculateChange(latestScan.visceral_fat_level, previousScan.visceral_fat_level)}
                  percentChange={calculatePercentChange(latestScan.visceral_fat_level, previousScan.visceral_fat_level)}
                  improvementDirection="down" // Lower is better
                  scan1Label="Previous Scan"
                  scan2Label="Latest Scan"
                />
              </div>

              {/* Metabolic Health */}
              {(previousScan.basal_metabolic_rate || latestScan.basal_metabolic_rate) && (
                <div className="card-soft p-6">
                  <h3 className="text-xl font-display font-semibold text-sage-900 mb-4">
                    Metabolic Health
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComparisonCard
                      label="Basal Metabolic Rate"
                      value1={previousScan.basal_metabolic_rate}
                      value2={latestScan.basal_metabolic_rate}
                      unit="kcal/day"
                      change={calculateChange(latestScan.basal_metabolic_rate, previousScan.basal_metabolic_rate)}
                      percentChange={calculatePercentChange(latestScan.basal_metabolic_rate, previousScan.basal_metabolic_rate)}
                      improvementDirection="up" // Higher is better
                      scan1Label="Previous Scan"
                      scan2Label="Latest Scan"
                    />
                    <ComparisonCard
                      label="ECW Ratio"
                      value1={previousScan.ecw_ratio}
                      value2={latestScan.ecw_ratio}
                      unit="ratio"
                      change={calculateChange(latestScan.ecw_ratio, previousScan.ecw_ratio)}
                      percentChange={calculatePercentChange(latestScan.ecw_ratio, previousScan.ecw_ratio)}
                      improvementDirection="down" // Lower is better (closer to 0.36-0.39)
                      scan1Label="Previous Scan"
                      scan2Label="Latest Scan"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push(`/dashboard/${previousScan.id}`)}
                  className="px-6 py-3 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50"
                >
                  View Previous Scan Details
                </button>
                <button
                  onClick={() => router.push(`/dashboard/${latestScan.id}`)}
                  className="btn-organic"
                >
                  View Latest Scan Details
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}


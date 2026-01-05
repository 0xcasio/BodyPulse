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

          <h1 className="text-3xl md:text-5xl font-display font-bold gradient-text mb-2">
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
                  First Scan (Older)
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
                  Second Scan (Newer)
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
        {scan1 && scan2 && (
          <div className="space-y-6">
            {/* Header with Dates */}
            <div className="card-soft p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:text-left">
                  <div className="text-sm text-sage-600 mb-1">First Scan</div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Calendar className="w-4 h-4 text-sage-600" />
                    <span className="font-display font-semibold text-sage-900">
                      {formatDate(scan1.scan_date || scan1.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-sage-600 mb-1">Time Difference</div>
                  <div className="font-display font-semibold text-sage-900">
                    {(() => {
                      const date1 = new Date(scan1.scan_date || scan1.created_at);
                      const date2 = new Date(scan2.scan_date || scan2.created_at);
                      const days = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
                      return `${days} days`;
                    })()}
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-sm text-sage-600 mb-1">Second Scan</div>
                  <div className="flex items-center gap-2 justify-center md:justify-end">
                    <Calendar className="w-4 h-4 text-sage-600" />
                    <span className="font-display font-semibold text-sage-900">
                      {formatDate(scan2.scan_date || scan2.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComparisonCard
                label="Weight"
                value1={scan1.weight}
                value2={scan2.weight}
                unit={scan1.weight_unit}
                change={calculateChange(scan2.weight, scan1.weight)}
                percentChange={calculatePercentChange(scan2.weight, scan1.weight)}
                improvementDirection="down" // Lower weight is better (generally)
              />
              <ComparisonCard
                label="Body Fat Percentage"
                value1={scan1.body_fat_percentage}
                value2={scan2.body_fat_percentage}
                unit="%"
                change={calculateChange(scan2.body_fat_percentage, scan1.body_fat_percentage)}
                percentChange={calculatePercentChange(scan2.body_fat_percentage, scan1.body_fat_percentage)}
                improvementDirection="down" // Lower is better
              />
              <ComparisonCard
                label="Skeletal Muscle Mass"
                value1={scan1.skeletal_muscle_mass}
                value2={scan2.skeletal_muscle_mass}
                unit={scan1.weight_unit}
                change={calculateChange(scan2.skeletal_muscle_mass, scan1.skeletal_muscle_mass)}
                percentChange={calculatePercentChange(scan2.skeletal_muscle_mass, scan1.skeletal_muscle_mass)}
                improvementDirection="up" // Higher is better
              />
              <ComparisonCard
                label="InBody Score"
                value1={scan1.inbody_score}
                value2={scan2.inbody_score}
                unit="points"
                change={calculateChange(scan2.inbody_score, scan1.inbody_score)}
                percentChange={calculatePercentChange(scan2.inbody_score, scan1.inbody_score)}
                improvementDirection="up" // Higher is better
              />
              <ComparisonCard
                label="BMI"
                value1={scan1.bmi}
                value2={scan2.bmi}
                unit="kg/m²"
                change={calculateChange(scan2.bmi, scan1.bmi)}
                percentChange={calculatePercentChange(scan2.bmi, scan1.bmi)}
                improvementDirection="down" // Lower is generally better
              />
              <ComparisonCard
                label="Visceral Fat Level"
                value1={scan1.visceral_fat_level}
                value2={scan2.visceral_fat_level}
                unit="level"
                change={calculateChange(scan2.visceral_fat_level, scan1.visceral_fat_level)}
                percentChange={calculatePercentChange(scan2.visceral_fat_level, scan1.visceral_fat_level)}
                improvementDirection="down" // Lower is better
              />
            </div>

            {/* Metabolic Health */}
            {(scan1.basal_metabolic_rate || scan2.basal_metabolic_rate) && (
              <div className="card-soft p-6">
                <h3 className="text-xl font-display font-semibold text-sage-900 mb-4">
                  Metabolic Health
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComparisonCard
                    label="Basal Metabolic Rate"
                    value1={scan1.basal_metabolic_rate}
                    value2={scan2.basal_metabolic_rate}
                    unit="kcal/day"
                    change={calculateChange(scan2.basal_metabolic_rate, scan1.basal_metabolic_rate)}
                    percentChange={calculatePercentChange(scan2.basal_metabolic_rate, scan1.basal_metabolic_rate)}
                    improvementDirection="up" // Higher is better
                  />
                  <ComparisonCard
                    label="ECW Ratio"
                    value1={scan1.ecw_ratio}
                    value2={scan2.ecw_ratio}
                    unit="ratio"
                    change={calculateChange(scan2.ecw_ratio, scan1.ecw_ratio)}
                    percentChange={calculatePercentChange(scan2.ecw_ratio, scan1.ecw_ratio)}
                    improvementDirection="down" // Lower is better (closer to 0.36-0.39)
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/dashboard/${scan1.id}`)}
                className="px-6 py-3 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50"
              >
                View First Scan Details
              </button>
              <button
                onClick={() => router.push(`/dashboard/${scan2.id}`)}
                className="btn-organic"
              >
                View Second Scan Details
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


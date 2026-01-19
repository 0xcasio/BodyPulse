"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2, User, Activity, TrendingUp, Target, Heart, Scale, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import MetricCard from "@/components/dashboard/MetricCard";
import CategorySection from "@/components/dashboard/CategorySection";
import DataCard from "@/components/dashboard/DataCard";
import BodyDiagram from "@/components/dashboard/BodyDiagram";
import { ExtractedScanData, Scan } from "@/types/scan";
import CardGenerator from "@/components/share/CardGenerator";
import { getUserScans, getScanById } from "@/lib/db/queries";
import { getSession } from "@/lib/auth";
import { pageVariants, staggerContainer, fadeInUp, scaleIn, scrollFadeIn } from "@/lib/motion";

interface ScanData extends ExtractedScanData {
  fileName?: string;
  confidence: number;
  id?: string;
  source_image_url?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [fullScan, setFullScan] = useState<Scan | null>(null);
  const [previousScan, setPreviousScan] = useState<Scan | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, [router]);

  const checkAuthAndLoad = async () => {
    const { session } = await getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const storedData = sessionStorage.getItem('currentScan');
    if (!storedData) {
      router.push('/');
      return;
    }

    const data = JSON.parse(storedData);
    setScanData(data);
    
    // Try to load full scan from database if we have an ID
    if (data.id) {
      loadFullScan(data.id);
    }
  };

  const loadFullScan = async (scanId: string) => {
    try {
      const scan = await getScanById(scanId);
      if (scan) {
        setFullScan(scan);
        // Load previous scan for comparison
        const scans = await getUserScans();
        const currentIndex = scans.findIndex(s => s.id === scanId);
        if (currentIndex > 0) {
          setPreviousScan(scans[currentIndex - 1]);
        }
      }
    } catch (error) {
      console.error('Error loading full scan:', error);
    }
  };

  const handleExport = () => {
    setShowExport(true);
  };

  if (!scanData) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-sage-600">Loading your analysis...</div>
      </div>
    );
  }

  const hasInBodyScore = scanData.inbody_score !== null && scanData.inbody_score !== undefined;

  return (
    <main className="min-h-screen blob-bg overflow-x-hidden">
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 w-full"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <motion.button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-700 mb-4 transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Upload New Scan</span>
          </motion.button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-sage-900 mb-2">
                Your Body Composition Analysis
              </h1>
              <p className="text-lg text-sage-600">
                {scanData.scan_date
                  ? new Date(scanData.scan_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Latest Scan'}
                {scanData.test_time && ` at ${scanData.test_time}`}
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleExport}
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Export Card</span>
              </motion.button>
              <motion.button
                onClick={() => router.push('/history')}
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
                <span>View History</span>
              </motion.button>
            </div>
          </div>
        </motion.div>


        {/* Body Diagram Visualization */}
        {scanData.segmental_lean && scanData.segmental_lean.right_arm && scanData.segmental_lean.left_arm && scanData.segmental_lean.trunk && scanData.segmental_lean.right_leg && scanData.segmental_lean.left_leg && (
          <motion.div
            className="mb-8"
            variants={scrollFadeIn}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl font-display font-bold text-sage-900 mb-4 text-center">
              Visual Body Analysis
            </h2>
            <p className="text-sage-600 text-center mb-6 max-w-2xl mx-auto">
              See how muscle and fat are distributed across your body
            </p>
            <BodyDiagram
              segmentalLean={scanData.segmental_lean as any}
              segmentalFat={(scanData.segmental_fat as any) || undefined}
              weightUnit={scanData.weight?.unit || 'lb'}
            />
          </motion.div>
        )}

        {/* Personal Information + InBody Score (Combined) */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6"
          variants={fadeInUp}
        >
          {/* Personal Information - Left side */}
          {(scanData.user_age || scanData.user_height || scanData.user_gender || scanData.weight) && (
            <div className={`${hasInBodyScore ? 'lg:col-span-7' : 'lg:col-span-12'} card-soft p-6`}>
              <h2 className="text-lg font-display font-semibold text-sage-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scanData.user_age && (
                  <DataCard label="Age" value={scanData.user_age} unit="years" />
                )}
                {scanData.user_height && (
                  <DataCard
                    label="Height"
                    value={scanData.user_height}
                    unit={scanData.user_height_unit || 'ft'}
                  />
                )}
                {scanData.user_gender && (
                  <DataCard label="Gender" value={scanData.user_gender} />
                )}
                {scanData.weight && (
                  <DataCard
                    label="Total Weight"
                    value={scanData.weight.value.toFixed(1)}
                    unit={scanData.weight.unit}
                  />
                )}
              </div>
            </div>
          )}

          {/* InBody Score - Right side */}
          {hasInBodyScore && (
            <div className="lg:col-span-5 card-soft p-6">
              <h2 className="text-lg font-display font-semibold text-sage-900 mb-4 text-center">
                InBody Score
              </h2>
              <div className="flex justify-center">
                <div className="scale-75 origin-center">
                  <ScoreGauge score={scanData.inbody_score!} />
                </div>
              </div>
              <p className="text-xs text-sage-600 mt-2 text-center">
                Overall body composition evaluation
              </p>
            </div>
          )}
        </motion.div>

        {/* Body Composition */}
        <CategorySection
          title="Body Composition Analysis"
          description="Complete breakdown of what your body is made of"
          icon={<Activity className="w-5 h-5" />}
          delay="0.15s"
        >
          {/* Summary Card */}
          {scanData.weight && (
            <div className="mb-6">
              <DataCard
                label="Total Weight"
                value={scanData.weight.value.toFixed(1)}
                unit={scanData.weight.unit}
                status="neutral"
              />
            </div>
          )}

          {/* All Metrics with Full Explanations - Click to Expand */}
          <div className="mb-4">
            <p className="text-sm text-sage-600 italic">
              Click any metric below to see detailed explanation and tips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {scanData.body_fat_percentage !== null && scanData.body_fat_percentage !== undefined && (
              <MetricCard
                metricKey="body_fat_percentage"
                value={scanData.body_fat_percentage}
                gender={scanData.user_gender}
              />
            )}
            {scanData.body_fat_mass && (
              <MetricCard
                metricKey="body_fat_mass"
                value={scanData.body_fat_mass.value}
                unit={scanData.body_fat_mass.unit}
              />
            )}
            {scanData.bmi && (
              <MetricCard metricKey="bmi" value={scanData.bmi} />
            )}
            {scanData.total_body_water && (
              <MetricCard
                metricKey="total_body_water"
                value={scanData.total_body_water.value}
                unit="L"
              />
            )}
            {scanData.protein && (
              <MetricCard
                metricKey="protein"
                value={scanData.protein.value}
                unit={scanData.protein.unit}
              />
            )}
            {scanData.mineral && (
              <MetricCard
                metricKey="mineral"
                value={scanData.mineral.value}
                unit={scanData.mineral.unit}
              />
            )}
          </div>
        </CategorySection>

        {/* Muscle & Fat Analysis */}
        <CategorySection
          title="Muscle & Fat Distribution"
          description="Skeletal muscle mass and fat breakdown"
          icon={<TrendingUp className="w-5 h-5" />}
          delay="0.2s"
        >
          {/* Fat-Free Mass + Skeletal Muscle Mass (Combined Row) */}
          {(scanData.fat_free_mass || scanData.skeletal_muscle_mass) && (
            <>
              <div className="mb-4">
                <p className="text-sm text-sage-600 italic">
                  Click Skeletal Muscle Mass to see detailed explanation and tips
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-start">
                {scanData.fat_free_mass && (
                  <div className="h-full">
                    <DataCard
                      label="Fat-Free Mass"
                      value={scanData.fat_free_mass.toFixed(1)}
                      unit={scanData.weight?.unit || 'lbs'}
                      subtitle="Everything except fat"
                    />
                  </div>
                )}
                {scanData.skeletal_muscle_mass && (
                  <MetricCard
                    metricKey="skeletal_muscle_mass"
                    value={scanData.skeletal_muscle_mass.value}
                    unit={scanData.skeletal_muscle_mass.unit}
                  />
                )}
              </div>
            </>
          )}

          {/* Segmental Analysis */}
          {scanData.segmental_lean && (
            <div className="mt-6">
              <h3 className="text-lg font-display font-semibold text-sage-900 mb-3">
                Muscle Development by Body Part
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scanData.segmental_lean?.right_arm && scanData.segmental_lean.right_arm.mass !== null && scanData.segmental_lean.right_arm.mass !== undefined && (
                  <DataCard
                    label="Right Arm"
                    value={scanData.segmental_lean.right_arm.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_lean.right_arm.percentage ?? 'N/A'}% - ${scanData.segmental_lean.right_arm.evaluation || 'Normal'}`}
                    status={(scanData.segmental_lean.right_arm.percentage ?? 0) >= 100 ? 'good' : 'neutral'}
                  />
                )}
                {scanData.segmental_lean?.left_arm && scanData.segmental_lean.left_arm.mass !== null && scanData.segmental_lean.left_arm.mass !== undefined && (
                  <DataCard
                    label="Left Arm"
                    value={scanData.segmental_lean.left_arm.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_lean.left_arm.percentage ?? 'N/A'}% - ${scanData.segmental_lean.left_arm.evaluation || 'Normal'}`}
                    status={(scanData.segmental_lean.left_arm.percentage ?? 0) >= 100 ? 'good' : 'neutral'}
                  />
                )}
                {scanData.segmental_lean?.trunk && scanData.segmental_lean.trunk.mass !== null && scanData.segmental_lean.trunk.mass !== undefined && (
                  <DataCard
                    label="Trunk"
                    value={scanData.segmental_lean.trunk.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_lean.trunk.percentage ?? 'N/A'}% - ${scanData.segmental_lean.trunk.evaluation || 'Normal'}`}
                    status={(scanData.segmental_lean.trunk.percentage ?? 0) >= 100 ? 'good' : 'neutral'}
                  />
                )}
                {scanData.segmental_lean?.right_leg && scanData.segmental_lean.right_leg.mass !== null && scanData.segmental_lean.right_leg.mass !== undefined && (
                  <DataCard
                    label="Right Leg"
                    value={scanData.segmental_lean.right_leg.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_lean.right_leg.percentage ?? 'N/A'}% - ${scanData.segmental_lean.right_leg.evaluation || 'Normal'}`}
                    status={(scanData.segmental_lean.right_leg.percentage ?? 0) >= 100 ? 'good' : 'neutral'}
                  />
                )}
                {scanData.segmental_lean?.left_leg && scanData.segmental_lean.left_leg.mass !== null && scanData.segmental_lean.left_leg.mass !== undefined && (
                  <DataCard
                    label="Left Leg"
                    value={scanData.segmental_lean.left_leg.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_lean.left_leg.percentage ?? 'N/A'}% - ${scanData.segmental_lean.left_leg.evaluation || 'Normal'}`}
                    status={(scanData.segmental_lean.left_leg.percentage ?? 0) >= 100 ? 'good' : 'neutral'}
                  />
                )}
              </div>
            </div>
          )}

          {/* Segmental Fat */}
          {scanData.segmental_fat && (
            <div className="mt-6">
              <h3 className="text-lg font-display font-semibold text-sage-900 mb-3">
                Fat Distribution by Body Part
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scanData.segmental_fat?.right_arm && scanData.segmental_fat.right_arm.mass !== null && scanData.segmental_fat.right_arm.mass !== undefined && (
                  <DataCard
                    label="Right Arm"
                    value={scanData.segmental_fat.right_arm.mass.toFixed(2)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.right_arm.percentage ?? 'N/A'}%`}
                    status={(scanData.segmental_fat.right_arm.percentage ?? 0) < 90 ? 'excellent' : 'neutral'}
                  />
                )}
                {scanData.segmental_fat?.left_arm && scanData.segmental_fat.left_arm.mass !== null && scanData.segmental_fat.left_arm.mass !== undefined && (
                  <DataCard
                    label="Left Arm"
                    value={scanData.segmental_fat.left_arm.mass.toFixed(2)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.left_arm.percentage ?? 'N/A'}%`}
                    status={(scanData.segmental_fat.left_arm.percentage ?? 0) < 90 ? 'excellent' : 'neutral'}
                  />
                )}
                {scanData.segmental_fat?.trunk && scanData.segmental_fat.trunk.mass !== null && scanData.segmental_fat.trunk.mass !== undefined && (
                  <DataCard
                    label="Trunk"
                    value={scanData.segmental_fat.trunk.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.trunk.percentage ?? 'N/A'}%`}
                    status={(scanData.segmental_fat.trunk.percentage ?? 0) > 130 ? 'moderate' : 'good'}
                  />
                )}
                {scanData.segmental_fat?.right_leg && scanData.segmental_fat.right_leg.mass !== null && scanData.segmental_fat.right_leg.mass !== undefined && (
                  <DataCard
                    label="Right Leg"
                    value={scanData.segmental_fat.right_leg.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.right_leg.percentage ?? 'N/A'}%`}
                  />
                )}
                {scanData.segmental_fat?.left_leg && scanData.segmental_fat.left_leg.mass !== null && scanData.segmental_fat.left_leg.mass !== undefined && (
                  <DataCard
                    label="Left Leg"
                    value={scanData.segmental_fat.left_leg.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.left_leg.percentage ?? 'N/A'}%`}
                  />
                )}
              </div>
            </div>
          )}
        </CategorySection>

        {/* Weight Control Goals */}
        {(scanData.target_weight || scanData.weight_control) && (
          <CategorySection
            title="Weight Control Targets"
            description="Your personalized goals based on InBody analysis"
            icon={<Target className="w-5 h-5" />}
            delay="0.25s"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {scanData.target_weight && (
                <DataCard
                  label="Target Weight"
                  value={scanData.target_weight.toFixed(1)}
                  unit={scanData.weight?.unit || 'lbs'}
                  status="neutral"
                />
              )}
              {scanData.weight_control !== null && scanData.weight_control !== undefined && (
                <DataCard
                  label="Weight Control"
                  value={scanData.weight_control.toFixed(1)}
                  unit={scanData.weight?.unit || 'lbs'}
                  subtitle={scanData.weight_control < 0 ? 'To lose' : 'To gain'}
                  status="neutral"
                />
              )}
              {scanData.fat_control !== null && scanData.fat_control !== undefined && (
                <DataCard
                  label="Fat Control"
                  value={scanData.fat_control.toFixed(1)}
                  unit={scanData.weight?.unit || 'lbs'}
                  subtitle={scanData.fat_control < 0 ? 'To lose' : 'To maintain'}
                  status="neutral"
                />
              )}
              {scanData.muscle_control !== null && scanData.muscle_control !== undefined && (
                <DataCard
                  label="Muscle Control"
                  value={scanData.muscle_control.toFixed(1)}
                  unit={scanData.weight?.unit || 'lbs'}
                  subtitle={scanData.muscle_control > 0 ? 'To gain' : 'To maintain'}
                  status="neutral"
                />
              )}
            </div>
          </CategorySection>
        )}

        {/* Metabolic Health */}
        <CategorySection
          title="Metabolic Health"
          description="Energy expenditure and fat distribution"
          icon={<Heart className="w-5 h-5" />}
          delay="0.3s"
        >
          {/* Clickable Metrics with Full Explanations */}
          <div className="mb-4">
            <p className="text-sm text-sage-600 italic">
              Click BMR or Visceral Fat to see detailed explanation and tips
            </p>
          </div>

          {/* Recommended Calories + BMR + Visceral Fat (Combined Row) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {scanData.recommended_calorie_intake && (
              <div className="h-full">
                <DataCard
                  label="Recommended Calories"
                  value={scanData.recommended_calorie_intake}
                  unit="kcal/day"
                  subtitle="For maintenance"
                  status="neutral"
                />
              </div>
            )}
            {scanData.basal_metabolic_rate && (
              <MetricCard
                metricKey="basal_metabolic_rate"
                value={scanData.basal_metabolic_rate}
              />
            )}
            {scanData.visceral_fat_level !== null && scanData.visceral_fat_level !== undefined && (
              <MetricCard
                metricKey="visceral_fat_level"
                value={scanData.visceral_fat_level}
              />
            )}
          </div>
        </CategorySection>

        {/* Body Balance & Evaluations */}
        {(scanData.waist_hip_ratio || scanData.bmc_evaluation || scanData.pgc_evaluation) && (
          <CategorySection
            title="Body Balance & Evaluations"
            description="Proportions and health assessments"
            icon={<Scale className="w-5 h-5" />}
            delay="0.35s"
          >
            {/* Clickable Metrics with Full Explanations */}
            {(scanData.waist_hip_ratio || scanData.obesity_degree) && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-sage-600 italic">
                    Click any metric below to see detailed explanation and tips
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {scanData.waist_hip_ratio && (
                    <MetricCard
                      metricKey="waist_hip_ratio"
                      value={scanData.waist_hip_ratio}
                      gender={scanData.user_gender}
                    />
                  )}
                  {scanData.obesity_degree && (
                    <MetricCard
                      metricKey="obesity_degree"
                      value={scanData.obesity_degree}
                    />
                  )}
                </div>
              </>
            )}

            {/* Evaluation Cards with Explanations */}
            {(scanData.bmc_evaluation || scanData.pgc_evaluation) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {scanData.bmc_evaluation && (
                  <div className="card-soft p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-sage-600 mb-1">
                          BMC Evaluation
                        </h3>
                        <div className="text-3xl font-display font-semibold text-sage-900 mb-2">
                          {scanData.bmc_evaluation}
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full border ${
                        scanData.bmc_evaluation === 'Normal'
                          ? 'bg-sage-100 text-sage-700 border-sage-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        <span className="text-xs font-medium">
                          {scanData.bmc_evaluation === 'Normal' ? 'Good' : 'Monitor'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-sage-600">
                        <strong>What this means:</strong> BMC (Body Mass Composition) evaluation assesses whether your muscle mass is proportional to your body weight. "Normal" means you have a healthy muscle-to-weight ratio.
                      </p>
                      <p className="text-sm text-sage-600">
                        <strong>Why it matters:</strong> Low muscle mass relative to body weight may indicate you need more resistance training. High muscle mass is generally positive for metabolism and functional strength.
                      </p>
                    </div>
                  </div>
                )}
                {scanData.pgc_evaluation && (
                  <div className="card-soft p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-sage-600 mb-1">
                          PGC Evaluation
                        </h3>
                        <div className="text-3xl font-display font-semibold text-sage-900 mb-2">
                          {scanData.pgc_evaluation}
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full border ${
                        scanData.pgc_evaluation === 'Normal'
                          ? 'bg-sage-100 text-sage-700 border-sage-200'
                          : scanData.pgc_evaluation?.includes('Slightly')
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-terracotta-100 text-terracotta-700 border-terracotta-200'
                      }`}>
                        <span className="text-xs font-medium">
                          {scanData.pgc_evaluation === 'Normal' ? 'Good' : 'Monitor'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-sage-600">
                        <strong>What this means:</strong> PGC (Percent of Goal Calories) evaluation assesses your body fat percentage against the standard for your age and gender. "Normal" means you're in the healthy range.
                      </p>
                      <p className="text-sm text-sage-600">
                        <strong>Why it matters:</strong> This helps contextualize your body fat percentage. "Slightly High" or "High" suggests focusing on reducing body fat through diet and exercise, while maintaining muscle mass.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CategorySection>
        )}

        {/* Advanced Metrics */}
        {(scanData.ecw_ratio || scanData.phase_angle) && (
          <CategorySection
            title="Advanced Metrics"
            description="Detailed health and cellular indicators"
            icon={<BarChart3 className="w-5 h-5" />}
            delay="0.4s"
            defaultExpanded={false}
          >
            {/* Clickable Metrics with Full Explanations */}
            <div className="mb-4">
              <p className="text-sm text-sage-600 italic">
                Click any metric below to see detailed explanation and tips
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanData.ecw_ratio && (
                <MetricCard
                  metricKey="ecw_ratio"
                  value={scanData.ecw_ratio}
                />
              )}
              {scanData.phase_angle && (
                <MetricCard
                  metricKey="phase_angle"
                  value={scanData.phase_angle}
                />
              )}
            </div>

            {/* Water Breakdown */}
            {(scanData.intracellular_water || scanData.extracellular_water) && (
              <div className="mt-4">
                <h3 className="text-lg font-display font-semibold text-sage-900 mb-3">
                  Body Water Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {scanData.total_body_water && (
                    <DataCard
                      label="Total Body Water"
                      value={scanData.total_body_water.value.toFixed(1)}
                      unit="L"
                    />
                  )}
                  {scanData.intracellular_water && (
                    <DataCard
                      label="Intracellular Water"
                      value={scanData.intracellular_water.value.toFixed(1)}
                      unit="L"
                      subtitle="Water inside cells"
                    />
                  )}
                  {scanData.extracellular_water && (
                    <DataCard
                      label="Extracellular Water"
                      value={scanData.extracellular_water.value.toFixed(1)}
                      unit="L"
                      subtitle="Water outside cells"
                    />
                  )}
                </div>
              </div>
            )}
          </CategorySection>
        )}

        {/* Export Card Modal */}
        <AnimatePresence>
          {showExport && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExport(false)}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-display font-bold text-sage-900">
                    Export Summary Card
                  </h2>
                  <motion.button
                    onClick={() => setShowExport(false)}
                    className="text-sage-600 hover:text-sage-700"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
                {fullScan ? (
                  <CardGenerator scan={fullScan} previousScan={previousScan} theme="light" />
                ) : scanData ? (
                  <div className="text-sage-600">
                    <p>Loading scan data...</p>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card */}
        <motion.div
          className="card-soft p-8 bg-gradient-to-br from-sage-50 to-terracotta-50 border-sage-200"
          variants={scrollFadeIn}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-2xl font-display font-bold text-sage-900 mb-4">
            What's Next?
          </h2>
          <motion.ul
            className="space-y-3 text-sage-700"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { num: 1, text: <><strong>Track your progress</strong> - Upload your next scan in 2-4 weeks to see changes</> },
              { num: 2, text: <><strong>Focus on your goals</strong> - Use the weight control targets to guide your nutrition and training</> },
              { num: 3, text: <><strong>Share your wins</strong> - Export a summary card to celebrate your progress</> },
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                variants={fadeInUp}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-200 text-sage-700 flex items-center justify-center text-sm font-semibold">
                  {item.num}
                </span>
                <span>{item.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </main>
  );
}

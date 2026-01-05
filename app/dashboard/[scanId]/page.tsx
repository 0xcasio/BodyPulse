"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Share2, User, Activity, TrendingUp, Target, Heart, Scale, BarChart3, Trash2 } from "lucide-react";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import MetricCard from "@/components/dashboard/MetricCard";
import CategorySection from "@/components/dashboard/CategorySection";
import DataCard from "@/components/dashboard/DataCard";
import BodyDiagram from "@/components/dashboard/BodyDiagram";
import { Scan } from "@/types/scan";
import { getUserScans, getScanById, deleteScan, updateScan } from "@/lib/db/queries";
import { getUserProfile } from "@/lib/db/users";
import { getAgeForScan } from "@/lib/utils/age";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import ExportButton from "@/components/export/ExportButton";

export default function DashboardScanPage() {
  const router = useRouter();
  const params = useParams();
  const scanId = params.scanId as string;
  const [scan, setScan] = useState<Scan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (scanId) {
      loadScan();
    }
  }, [scanId]);

  const loadScan = async () => {
    setIsLoading(true);
    try {
      const loadedScan = await getScanById(scanId);
      if (!loadedScan) {
        router.push('/history');
        return;
      }
      setScan(loadedScan);

      // Load user profile to get birthday for age calculation
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading scan:', error);
      router.push('/history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!scan) return;
    
    if (!confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteScan(scan.id);
      if (success) {
        router.push('/history');
      } else {
        alert('Failed to delete scan. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      alert('An error occurred while deleting the scan.');
    }
  };

  const handleFieldEdit = (field: string, currentValue: number | null | undefined, unit?: string) => {
    setEditingField(field);
    setEditValues({
      ...editValues,
      [field]: currentValue?.toString() || '',
      [`${field}_unit`]: unit || '',
    });
  };

  const handleFieldSave = async (field: string) => {
    if (!scan) return;

    setIsSaving(true);
    try {
      const valueStr = editValues[field]?.trim() || '';
      const unit = editValues[`${field}_unit`] || '';

      let updates: Partial<Scan> = {};
      let newValue: number | null = null;

      if (valueStr) {
        const parsed = parseFloat(valueStr);
        if (!isNaN(parsed)) {
          newValue = field === 'user_age' ? Math.round(parsed) : parsed;
        }
      }

      if (field === 'user_age') {
        updates.user_age = newValue;
      } else if (field === 'user_height') {
        updates.user_height = newValue;
        updates.user_height_unit = (unit || scan.user_height_unit || 'ft') as 'in' | 'cm' | 'ft';
      } else if (field === 'weight') {
        updates.weight = newValue || scan.weight;
        updates.weight_unit = (unit || scan.weight_unit || 'lbs') as 'kg' | 'lbs';
      }

      // Mark as manually edited
      updates.manually_edited = true;
      const editedFields = [...(scan.edited_fields || [])];
      if (!editedFields.includes(field)) {
        editedFields.push(field);
      }
      updates.edited_fields = editedFields;

      const updatedScan = await updateScan(scan.id, updates);
      if (updatedScan) {
        setScan(updatedScan);
        setEditingField(null);
        setEditValues({});
      } else {
        alert('Failed to update scan. Please try again.');
      }
    } catch (error) {
      console.error('Error updating scan:', error);
      alert('An error occurred while updating the scan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-sage-600">Loading scan...</div>
      </div>
    );
  }

  if (!scan) {
    return null;
  }

  // Calculate age from birthday if available, otherwise use stored age
  const calculatedAge = getAgeForScan(
    userProfile?.birthday,
    scan.scan_date,
    scan.user_age
  );

  // Convert Scan to ExtractedScanData format for dashboard components
  const scanData = {
    scan_date: scan.scan_date,
    test_time: scan.test_time,
    user_height: scan.user_height,
    user_height_unit: scan.user_height_unit,
    user_age: calculatedAge, // Use calculated age
    user_gender: scan.user_gender, // Keep for internal use but don't display
    weight: { value: scan.weight, unit: scan.weight_unit },
    total_body_water: scan.total_body_water ? { value: scan.total_body_water, unit: 'L' as const } : undefined,
    protein: scan.protein ? { value: scan.protein, unit: scan.protein_unit || 'lbs' as const } : undefined,
    mineral: scan.mineral ? { value: scan.mineral, unit: scan.mineral_unit || 'lbs' as const } : undefined,
    body_fat_mass: scan.body_fat_mass ? { value: scan.body_fat_mass, unit: scan.weight_unit } : undefined,
    skeletal_muscle_mass: scan.skeletal_muscle_mass ? { value: scan.skeletal_muscle_mass, unit: scan.weight_unit } : undefined,
    body_fat_percentage: scan.body_fat_percentage,
    bmi: scan.bmi,
    intracellular_water: scan.intracellular_water ? { value: scan.intracellular_water, unit: 'L' as const } : undefined,
    extracellular_water: scan.extracellular_water ? { value: scan.extracellular_water, unit: 'L' as const } : undefined,
    ecw_ratio: scan.ecw_ratio,
    segmental_lean: scan.segmental_lean,
    segmental_fat: scan.segmental_fat,
    target_weight: scan.target_weight,
    weight_control: scan.weight_control,
    fat_control: scan.fat_control,
    muscle_control: scan.muscle_control,
    waist_hip_ratio: scan.waist_hip_ratio,
    upper_lower_balance: scan.upper_lower_balance,
    left_right_balance: scan.left_right_balance,
    basal_metabolic_rate: scan.basal_metabolic_rate,
    recommended_calorie_intake: scan.recommended_calorie_intake,
    visceral_fat_level: scan.visceral_fat_level,
    obesity_degree: scan.obesity_degree,
    inbody_score: scan.inbody_score,
    phase_angle: scan.phase_angle,
    bmc_evaluation: scan.bmc_evaluation,
    pgc_evaluation: scan.pgc_evaluation,
    fat_free_mass: scan.fat_free_mass,
  };

  const hasInBodyScore = scan.inbody_score !== null && scan.inbody_score !== undefined;

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

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-sage-900 mb-2">
                Your Body Composition Analysis
              </h1>
              <p className="text-lg text-sage-600">
                {scan.scan_date
                  ? new Date(scan.scan_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Latest Scan'}
                {scan.test_time && ` at ${scan.test_time}`}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <ExportButton scan={scan} />
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-terracotta-600 border-2 border-terracotta-200 hover:border-terracotta-300 hover:bg-terracotta-50 flex items-center gap-2"
                title="Delete scan"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => router.push('/history')}
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>View History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information + InBody Score (Combined) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Personal Information - Left side */}
          {(scanData.user_age || scanData.user_height || scanData.weight) && (
            <div className={`${hasInBodyScore ? 'lg:col-span-7' : 'lg:col-span-12'} card-soft p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-sage-900">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {scanData.user_age !== null && scanData.user_age !== undefined && (
                  <EditableDataCard
                    label="Age"
                    value={scanData.user_age}
                    unit="years"
                    field="user_age"
                    isEditing={editingField === 'user_age'}
                    editValue={editValues.user_age || ''}
                    onEdit={() => handleFieldEdit('user_age', scanData.user_age)}
                    onSave={() => handleFieldSave('user_age')}
                    onCancel={handleFieldCancel}
                    onValueChange={(val) => setEditValues({ ...editValues, user_age: val })}
                    isSaving={isSaving}
                    helpText={userProfile?.birthday ? "Calculated from your birthday" : undefined}
                    disabled={!!userProfile?.birthday}
                  />
                )}
                {scanData.user_height !== null && scanData.user_height !== undefined && (
                  <EditableDataCard
                    label="Height"
                    value={scanData.user_height}
                    unit={scanData.user_height_unit || 'ft'}
                    field="user_height"
                    isEditing={editingField === 'user_height'}
                    editValue={editValues.user_height || ''}
                    editUnit={editValues.user_height_unit || ''}
                    onEdit={() => handleFieldEdit('user_height', scanData.user_height, scanData.user_height_unit)}
                    onSave={() => handleFieldSave('user_height')}
                    onCancel={handleFieldCancel}
                    onValueChange={(val) => setEditValues({ ...editValues, user_height: val })}
                    onUnitChange={(unit) => setEditValues({ ...editValues, user_height_unit: unit })}
                    unitOptions={['ft', 'in', 'cm']}
                    isSaving={isSaving}
                  />
                )}
                {scanData.weight && (
                  <EditableDataCard
                    label="Total Weight"
                    value={scanData.weight.value}
                    unit={scanData.weight.unit}
                    field="weight"
                    isEditing={editingField === 'weight'}
                    editValue={editValues.weight || ''}
                    editUnit={editValues.weight_unit || ''}
                    onEdit={() => handleFieldEdit('weight', scanData.weight?.value, scanData.weight?.unit)}
                    onSave={() => handleFieldSave('weight')}
                    onCancel={handleFieldCancel}
                    onValueChange={(val) => setEditValues({ ...editValues, weight: val })}
                    onUnitChange={(unit) => setEditValues({ ...editValues, weight_unit: unit })}
                    unitOptions={['lbs', 'kg']}
                    isSaving={isSaving}
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
                  <ScoreGauge score={scan.inbody_score!} />
                </div>
              </div>
              <p className="text-xs text-sage-600 mt-2 text-center">
                Overall body composition evaluation
              </p>
            </div>
          )}
        </div>

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

          {/* Body Diagram - Visual representation of segmental data */}
          {scanData.segmental_lean && (
            <div className="mt-6 mb-6">
              <BodyDiagram
                segmentalLean={scanData.segmental_lean as any}
                segmentalFat={scanData.segmental_fat as any}
                weightUnit={scanData.weight?.unit === 'kg' ? 'kg' : 'lb'}
              />
            </div>
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
                    subtitle={`${scanData.segmental_fat.right_arm.percentage ?? 'N/A'}% - ${scanData.segmental_fat.right_arm.evaluation || 'Normal'}`}
                    status={(scanData.segmental_fat.right_arm.percentage ?? 0) < 90 ? 'excellent' : 'neutral'}
                  />
                )}
                {scanData.segmental_fat?.left_arm && scanData.segmental_fat.left_arm.mass !== null && scanData.segmental_fat.left_arm.mass !== undefined && (
                  <DataCard
                    label="Left Arm"
                    value={scanData.segmental_fat.left_arm.mass.toFixed(2)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.left_arm.percentage ?? 'N/A'}% - ${scanData.segmental_fat.left_arm.evaluation || 'Normal'}`}
                    status={(scanData.segmental_fat.left_arm.percentage ?? 0) < 90 ? 'excellent' : 'neutral'}
                  />
                )}
                {scanData.segmental_fat?.trunk && scanData.segmental_fat.trunk.mass !== null && scanData.segmental_fat.trunk.mass !== undefined && (
                  <DataCard
                    label="Trunk"
                    value={scanData.segmental_fat.trunk.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.trunk.percentage ?? 'N/A'}% - ${scanData.segmental_fat.trunk.evaluation || 'Normal'}`}
                    status={(scanData.segmental_fat.trunk.percentage ?? 0) > 130 ? 'moderate' : 'good'}
                  />
                )}
                {scanData.segmental_fat?.right_leg && scanData.segmental_fat.right_leg.mass !== null && scanData.segmental_fat.right_leg.mass !== undefined && (
                  <DataCard
                    label="Right Leg"
                    value={scanData.segmental_fat.right_leg.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.right_leg.percentage ?? 'N/A'}% - ${scanData.segmental_fat.right_leg.evaluation || 'Normal'}`}
                  />
                )}
                {scanData.segmental_fat?.left_leg && scanData.segmental_fat.left_leg.mass !== null && scanData.segmental_fat.left_leg.mass !== undefined && (
                  <DataCard
                    label="Left Leg"
                    value={scanData.segmental_fat.left_leg.mass.toFixed(1)}
                    unit="lb"
                    subtitle={`${scanData.segmental_fat.left_leg.percentage ?? 'N/A'}% - ${scanData.segmental_fat.left_leg.evaluation || 'Normal'}`}
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
        {(scanData.waist_hip_ratio || scanData.bmc_evaluation || scanData.pgc_evaluation || scanData.obesity_degree) && (
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

        {/* Summary Card */}
        <div className="card-soft p-8 bg-gradient-to-br from-sage-50 to-terracotta-50 border-sage-200">
          <h2 className="text-2xl font-display font-bold text-sage-900 mb-4">
            What's Next?
          </h2>
          <ul className="space-y-3 text-sage-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-200 text-sage-700 flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <span>
                <strong>Track your progress</strong> - Upload your next scan in 2-4 weeks to see changes
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-200 text-sage-700 flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <span>
                <strong>Focus on your goals</strong> - Use the weight control targets to guide your nutrition and training
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-200 text-sage-700 flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <span>
                <strong>Share your wins</strong> - Export a summary card to celebrate your progress
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

// Editable Data Card Component
function EditableDataCard({
  label,
  value,
  unit,
  field,
  isEditing,
  editValue,
  editUnit,
  onEdit,
  onSave,
  onCancel,
  onValueChange,
  onUnitChange,
  unitOptions,
  isSaving,
  helpText,
  disabled,
}: {
  label: string;
  value: number;
  unit?: string;
  field: string;
  isEditing: boolean;
  editValue: string;
  editUnit?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onValueChange: (val: string) => void;
  onUnitChange?: (unit: string) => void;
  unitOptions?: string[];
  isSaving: boolean;
  helpText?: string;
  disabled?: boolean;
}) {
  if (isEditing) {
    return (
      <div className="p-4 rounded-xl border-2 border-sage-400 bg-white">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xs font-medium text-sage-600">{label}</h3>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="text-sage-600 hover:text-sage-700 transition-colors disabled:opacity-50"
              title="Save"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="text-sage-400 hover:text-sage-600 transition-colors disabled:opacity-50"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <input
            type="number"
            step={field === 'user_age' ? '1' : '0.1'}
            value={editValue}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 px-2 py-1 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-lg font-semibold text-sage-900"
            placeholder="Enter value"
            autoFocus
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSaving) {
                onSave();
              } else if (e.key === 'Escape' && !isSaving) {
                onCancel();
              }
            }}
          />
          {onUnitChange && unitOptions && (
            <select
              value={editUnit || unitOptions[0]}
              onChange={(e) => onUnitChange(e.target.value)}
              className="px-2 py-1 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sm text-sage-700"
              disabled={isSaving}
            >
              {unitOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
          {!onUnitChange && unit && (
            <span className="text-sm text-sage-500">{unit}</span>
          )}
        </div>
      </div>
    );
  }

  // Ensure value is a valid number
  const displayValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  return (
    <div className={`p-4 rounded-xl border border-sage-100 bg-white relative group ${disabled ? 'opacity-75' : ''}`}>
      <div className="text-xs font-medium text-sage-600 mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-display font-bold text-sage-900">
          {field === 'user_age' ? displayValue : displayValue.toFixed(1)}
        </span>
        {unit && (
          <span className="text-sm text-sage-500">{unit}</span>
        )}
      </div>
      {helpText && (
        <div className="text-xs text-sage-500 mt-1 italic">{helpText}</div>
      )}
      {!disabled && (
        <button
          onClick={onEdit}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-sage-500 hover:text-sage-700"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      {disabled && (
        <div className="absolute top-2 right-2 text-sage-400" title="Age is calculated from your birthday">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Edit2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ExtractedScanData } from "@/types/scan";
import { getSession } from "@/lib/auth";
import { pageVariants, fadeInUp, staggerContainer, scrollFadeIn } from "@/lib/motion";

interface ExtractionResult {
  data: ExtractedScanData;
  confidence: number;
  fileName: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [editedData, setEditedData] = useState<ExtractedScanData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAuthAndLoad();
  }, [router]);

  const checkAuthAndLoad = async () => {
    const { session } = await getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const storedData = sessionStorage.getItem('extractedScanData');
    if (!storedData) {
      console.warn('No extraction data found in sessionStorage, redirecting to upload');
      router.push('/');
      return;
    }

    try {
      const result = JSON.parse(storedData) as ExtractionResult;
      
      // Log what we're displaying for debugging
      console.log('📋 Reviewing extracted data:', {
        fileName: result.fileName,
        confidence: result.confidence,
        scanDate: result.data?.scan_date,
        weight: result.data?.weight?.value,
        inbodyScore: result.data?.inbody_score,
      });
      
      setExtractionResult(result);
      setEditedData(result.data);
    } catch (error) {
      console.error('Error parsing extraction data:', error);
      sessionStorage.removeItem('extractedScanData');
      router.push('/');
    }
  };

  if (!extractionResult || !editedData) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-sage-600">Loading...</div>
      </div>
    );
  }

  const handleFieldEdit = (field: string, currentValue: number | null | undefined, unit?: string) => {
    setEditingField(field);
    setEditValues({
      ...editValues,
      [field]: currentValue?.toString() || '',
      [`${field}_unit`]: unit || '',
    });
  };

  const handleFieldSave = (field: string, fieldType: 'number' | 'weight' | 'percentage' | 'integer') => {
    if (!editedData) return;

    const valueStr = editValues[field]?.trim() || '';
    const unit = editValues[`${field}_unit`] || '';

    let newValue: number | null = null;
    if (valueStr) {
      const parsed = parseFloat(valueStr);
      if (!isNaN(parsed)) {
        newValue = fieldType === 'integer' ? Math.round(parsed) : parsed;
      }
    }

    const updatedData = { ...editedData };

    // Handle different field types
    if (field === 'weight') {
      updatedData.weight = {
        value: newValue || 0,
        unit: (unit || editedData.weight?.unit || 'lbs') as 'kg' | 'lbs',
      };
    } else if (field === 'skeletal_muscle_mass' || field === 'body_fat_mass') {
      updatedData[field] = {
        value: newValue || 0,
        unit: (unit || updatedData[field]?.unit || 'lbs') as 'kg' | 'lbs',
      };
    } else if (fieldType === 'percentage' || fieldType === 'number') {
      (updatedData as any)[field] = newValue;
    } else if (fieldType === 'integer') {
      (updatedData as any)[field] = newValue ? Math.round(newValue) : null;
    }

    setEditedData(updatedData);
    setEditingField(null);
    setEditValues({});
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save scan data to database (without image for now)
      const { saveScan } = await import('@/lib/db/queries');
      const scan = await saveScan(
        editedData!,
        '', // No image URL for now
        extractionResult!.confidence
      );

      // Store in sessionStorage for dashboard (fallback if DB not available)
      const scanData = {
        ...editedData,
        id: scan?.id || null,
        fileName: extractionResult!.fileName,
        confidence: extractionResult!.confidence,
        source_image_url: null,
      };

      sessionStorage.setItem('currentScan', JSON.stringify(scanData));
      
      // Navigate to dashboard
      router.push(scan?.id ? `/dashboard/${scan.id}` : '/dashboard');
    } catch (error) {
      console.error('Error saving scan:', error);
      // Still navigate to dashboard with sessionStorage data
      sessionStorage.setItem('currentScan', JSON.stringify({
        ...editedData,
        fileName: extractionResult!.fileName,
        confidence: extractionResult!.confidence,
      }));
      router.push('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-sage-600';
    if (confidence >= 60) return 'text-amber-600';
    return 'text-terracotta-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-sage-100';
    if (confidence >= 60) return 'bg-amber-100';
    return 'bg-terracotta-100';
  };

  return (
    <main className="min-h-screen blob-bg">
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12"
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
            <span>Back to Upload</span>
          </motion.button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-sage-900 mb-2">
                Review Extracted Data
              </h1>
              <p className="text-sage-600">
                Verify the extracted metrics and make any necessary corrections
              </p>
            </div>

            <div className={`px-4 py-2 rounded-full ${getConfidenceBg(extractionResult.confidence)}`}>
              <span className={`text-sm font-medium ${getConfidenceColor(extractionResult.confidence)}`}>
                {extractionResult.confidence}% confident
              </span>
            </div>
          </div>
        </motion.div>

        {/* Confidence Warning */}
        {extractionResult.confidence < 70 && (
          <div className="card-soft p-4 mb-6 border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Low Confidence Detection</h3>
                <p className="text-sm text-amber-700">
                  Some metrics couldn't be detected. Please review and fill in missing values manually.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Weight */}
          <MetricCard
            label="Weight"
            value={editedData.weight?.value}
            unit={editedData.weight?.unit}
            field="weight"
            fieldType="weight"
            isEditing={editingField === 'weight'}
            editValue={editValues.weight || ''}
            editUnit={editValues.weight_unit || ''}
            onEdit={() => handleFieldEdit('weight', editedData.weight?.value, editedData.weight?.unit)}
            onSave={() => handleFieldSave('weight', 'weight')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, weight: val })}
            onUnitChange={(unit) => setEditValues({ ...editValues, weight_unit: unit })}
          />

          {/* Body Fat Percentage */}
          <MetricCard
            label="Body Fat Percentage"
            value={editedData.body_fat_percentage}
            unit="%"
            field="body_fat_percentage"
            fieldType="percentage"
            isEditing={editingField === 'body_fat_percentage'}
            editValue={editValues.body_fat_percentage || ''}
            onEdit={() => handleFieldEdit('body_fat_percentage', editedData.body_fat_percentage)}
            onSave={() => handleFieldSave('body_fat_percentage', 'percentage')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, body_fat_percentage: val })}
          />

          {/* Skeletal Muscle Mass */}
          <MetricCard
            label="Skeletal Muscle Mass"
            value={editedData.skeletal_muscle_mass?.value}
            unit={editedData.skeletal_muscle_mass?.unit}
            field="skeletal_muscle_mass"
            fieldType="weight"
            isEditing={editingField === 'skeletal_muscle_mass'}
            editValue={editValues.skeletal_muscle_mass || ''}
            editUnit={editValues.skeletal_muscle_mass_unit || ''}
            onEdit={() => handleFieldEdit('skeletal_muscle_mass', editedData.skeletal_muscle_mass?.value, editedData.skeletal_muscle_mass?.unit)}
            onSave={() => handleFieldSave('skeletal_muscle_mass', 'weight')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, skeletal_muscle_mass: val })}
            onUnitChange={(unit) => setEditValues({ ...editValues, skeletal_muscle_mass_unit: unit })}
          />

          {/* Body Fat Mass */}
          <MetricCard
            label="Body Fat Mass"
            value={editedData.body_fat_mass?.value}
            unit={editedData.body_fat_mass?.unit}
            field="body_fat_mass"
            fieldType="weight"
            isEditing={editingField === 'body_fat_mass'}
            editValue={editValues.body_fat_mass || ''}
            editUnit={editValues.body_fat_mass_unit || ''}
            onEdit={() => handleFieldEdit('body_fat_mass', editedData.body_fat_mass?.value, editedData.body_fat_mass?.unit)}
            onSave={() => handleFieldSave('body_fat_mass', 'weight')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, body_fat_mass: val })}
            onUnitChange={(unit) => setEditValues({ ...editValues, body_fat_mass_unit: unit })}
          />

          {/* BMI */}
          <MetricCard
            label="BMI"
            value={editedData.bmi}
            unit="kg/m²"
            field="bmi"
            fieldType="number"
            isEditing={editingField === 'bmi'}
            editValue={editValues.bmi || ''}
            onEdit={() => handleFieldEdit('bmi', editedData.bmi)}
            onSave={() => handleFieldSave('bmi', 'number')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, bmi: val })}
          />

          {/* Visceral Fat Level */}
          <MetricCard
            label="Visceral Fat Level"
            value={editedData.visceral_fat_level}
            unit="level"
            field="visceral_fat_level"
            fieldType="integer"
            isEditing={editingField === 'visceral_fat_level'}
            editValue={editValues.visceral_fat_level || ''}
            onEdit={() => handleFieldEdit('visceral_fat_level', editedData.visceral_fat_level)}
            onSave={() => handleFieldSave('visceral_fat_level', 'integer')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, visceral_fat_level: val })}
          />

          {/* ECW Ratio */}
          <MetricCard
            label="ECW Ratio"
            value={editedData.ecw_ratio}
            unit="ratio"
            field="ecw_ratio"
            fieldType="number"
            isEditing={editingField === 'ecw_ratio'}
            editValue={editValues.ecw_ratio || ''}
            onEdit={() => handleFieldEdit('ecw_ratio', editedData.ecw_ratio)}
            onSave={() => handleFieldSave('ecw_ratio', 'number')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, ecw_ratio: val })}
          />

          {/* BMR */}
          <MetricCard
            label="Basal Metabolic Rate"
            value={editedData.basal_metabolic_rate}
            unit="kcal"
            field="basal_metabolic_rate"
            fieldType="integer"
            isEditing={editingField === 'basal_metabolic_rate'}
            editValue={editValues.basal_metabolic_rate || ''}
            onEdit={() => handleFieldEdit('basal_metabolic_rate', editedData.basal_metabolic_rate)}
            onSave={() => handleFieldSave('basal_metabolic_rate', 'integer')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, basal_metabolic_rate: val })}
          />

          {/* InBody Score */}
          <MetricCard
            label="InBody Score"
            value={editedData.inbody_score}
            unit="points"
            field="inbody_score"
            fieldType="integer"
            isEditing={editingField === 'inbody_score'}
            editValue={editValues.inbody_score || ''}
            onEdit={() => handleFieldEdit('inbody_score', editedData.inbody_score)}
            onSave={() => handleFieldSave('inbody_score', 'integer')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, inbody_score: val })}
          />

          {/* Phase Angle */}
          <MetricCard
            label="Phase Angle"
            value={editedData.phase_angle}
            unit="°"
            field="phase_angle"
            fieldType="number"
            isEditing={editingField === 'phase_angle'}
            editValue={editValues.phase_angle || ''}
            onEdit={() => handleFieldEdit('phase_angle', editedData.phase_angle)}
            onSave={() => handleFieldSave('phase_angle', 'number')}
            onCancel={handleFieldCancel}
            onValueChange={(val) => setEditValues({ ...editValues, phase_angle: val })}
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-end"
          variants={fadeInUp}
        >
          <motion.button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-organic flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isSaving ? { scale: 1.05 } : {}}
            whileTap={!isSaving ? { scale: 0.95 } : {}}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Confirm & View Dashboard</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  unit,
  field,
  fieldType,
  isEditing,
  editValue,
  editUnit,
  onEdit,
  onSave,
  onCancel,
  onValueChange,
  onUnitChange,
}: {
  label: string;
  value?: number | null;
  unit?: string;
  field: string;
  fieldType: 'number' | 'weight' | 'percentage' | 'integer';
  isEditing: boolean;
  editValue: string;
  editUnit?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onValueChange: (val: string) => void;
  onUnitChange?: (unit: string) => void;
}) {
  const hasValue = value !== null && value !== undefined;
  const needsUnit = fieldType === 'weight';

  if (isEditing) {
    return (
      <div className="card-soft p-4 border-2 border-sage-400">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium text-sage-700">{label}</h3>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="text-sage-600 hover:text-sage-700 transition-colors"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="text-sage-400 hover:text-sage-600 transition-colors"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <input
            type="number"
            step={fieldType === 'integer' ? '1' : '0.1'}
            value={editValue}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-lg font-semibold text-sage-900"
            placeholder="Enter value"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave();
              } else if (e.key === 'Escape') {
                onCancel();
              }
            }}
          />
          {needsUnit && onUnitChange && (
            <select
              value={editUnit || 'lbs'}
              onChange={(e) => onUnitChange(e.target.value)}
              className="px-3 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sm text-sage-700"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          )}
          {!needsUnit && unit && (
            <span className="text-sm text-sage-500">{unit}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-soft p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-sage-700">{label}</h3>
        <button
          onClick={onEdit}
          className="text-sage-500 hover:text-sage-700 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {hasValue ? (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-semibold text-sage-900">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {unit && (
            <span className="text-sm text-sage-500">{unit}</span>
          )}
        </div>
      ) : (
        <div className="text-sage-400 italic text-sm">Not detected</div>
      )}
    </div>
  );
}

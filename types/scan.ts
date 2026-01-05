export interface Scan {
  id: string;
  user_id: string;
  scan_date: string; // ISO date string
  created_at: string;
  source_image_url: string;
  extraction_confidence: number;

  // Personal info
  user_height?: number; // in inches or cm
  user_height_unit?: 'in' | 'cm' | 'ft';
  user_age?: number;
  user_gender?: 'male' | 'female';
  test_time?: string; // HH:MM

  // Core metrics
  weight: number;
  weight_unit: 'kg' | 'lbs';
  skeletal_muscle_mass: number | null;
  body_fat_mass: number | null;
  body_fat_percentage: number | null;
  bmi: number | null;

  // Body composition
  protein?: number | null;
  protein_unit?: 'kg' | 'lbs';
  mineral?: number | null;
  mineral_unit?: 'kg' | 'lbs';
  fat_free_mass?: number | null;

  // Body water
  total_body_water: number | null;
  intracellular_water: number | null;
  extracellular_water: number | null;
  ecw_ratio: number | null;

  // Segmental lean analysis
  segmental_lean: SegmentalLean | null;

  // Segmental fat analysis (NEW!)
  segmental_fat: SegmentalFat | null;

  // Weight control targets (NEW!)
  target_weight?: number | null;
  weight_control?: number | null; // pounds/kg to lose/gain
  fat_control?: number | null;
  muscle_control?: number | null;

  // Body balance (NEW!)
  waist_hip_ratio?: number | null;
  upper_lower_balance?: string | null;
  left_right_balance?: string | null;

  // Metabolic
  basal_metabolic_rate: number | null;
  recommended_calorie_intake?: number | null;
  visceral_fat_level: number | null;
  obesity_degree?: number | null; // percentage

  // Scores & evaluations
  inbody_score: number | null;
  phase_angle: number | null;
  bmc_evaluation?: 'Low' | 'Normal' | 'High' | null;
  pgc_evaluation?: 'Normal' | 'Slightly High' | 'High' | null;

  // Impedance data (NEW! - raw measurements)
  impedance_data?: ImpedanceData | null;

  // Edit tracking
  manually_edited: boolean;
  edited_fields: string[];
}

export interface SegmentalLean {
  right_arm: SegmentData;
  left_arm: SegmentData;
  trunk: SegmentData;
  right_leg: SegmentData;
  left_leg: SegmentData;
}

export interface SegmentData {
  mass: number;
  percentage: number;
  evaluation?: 'Low' | 'Normal' | 'High' | null; // e.g., "Normal", "Bajo"
}

export interface SegmentalFat {
  right_arm: SegmentData;
  left_arm: SegmentData;
  trunk: SegmentData;
  right_leg: SegmentData;
  left_leg: SegmentData;
}

export interface ImpedanceData {
  // Impedance measurements at different frequencies
  // Format: { bodyPart: { frequency: value } }
  measurements?: {
    [key: string]: number; // e.g., "20Hz_RA": 257.3
  };
  // Raw impedance table if we want to store it structured
  z_20hz?: { dd?: number; bi?: number; tr?: number; pd?: number; pi?: number };
  z_100hz?: { dd?: number; bi?: number; tr?: number; pd?: number; pi?: number };
}

// For API extraction response
export interface ExtractedScanData {
  scan_date?: string;
  test_time?: string;
  
  // Personal Information
  user_height?: number;
  user_height_unit?: 'in' | 'cm' | 'ft';
  user_age?: number;
  user_gender?: 'male' | 'female';
  
  // Body Composition
  weight?: { value: number; unit: 'kg' | 'lbs' };
  total_body_water?: { value: number; unit: 'L' };
  protein?: { value: number; unit: 'kg' | 'lbs' };
  mineral?: { value: number; unit: 'kg' | 'lbs' };
  body_fat_mass?: { value: number; unit: 'kg' | 'lbs' };
  skeletal_muscle_mass?: { value: number; unit: 'kg' | 'lbs' };
  fat_free_mass?: number;
  
  // Obesity Analysis
  bmi?: number;
  body_fat_percentage?: number;
  
  // Segmental Analysis
  segmental_lean?: {
    right_arm?: { mass: number; percentage: number; evaluation?: string };
    left_arm?: { mass: number; percentage: number; evaluation?: string };
    trunk?: { mass: number; percentage: number; evaluation?: string };
    right_leg?: { mass: number; percentage: number; evaluation?: string };
    left_leg?: { mass: number; percentage: number; evaluation?: string };
  };
  segmental_fat?: {
    right_arm?: { mass: number; percentage: number; evaluation?: string };
    left_arm?: { mass: number; percentage: number; evaluation?: string };
    trunk?: { mass: number; percentage: number; evaluation?: string };
    right_leg?: { mass: number; percentage: number; evaluation?: string };
    left_leg?: { mass: number; percentage: number; evaluation?: string };
  };
  
  // InBody Score & Weight Control
  inbody_score?: number;
  target_weight?: number;
  weight_control?: number;
  fat_control?: number;
  muscle_control?: number;
  
  // Obesity Evaluation
  bmc_evaluation?: 'Low' | 'Normal' | 'High';
  pgc_evaluation?: 'Normal' | 'Slightly High' | 'High';
  
  // Body Balance
  upper_lower_balance?: string;
  left_right_balance?: string;
  waist_hip_ratio?: number;
  
  // Advanced Metrics
  intracellular_water?: { value: number; unit: 'L' };
  extracellular_water?: { value: number; unit: 'L' };
  ecw_ratio?: number;
  phase_angle?: number | null;
  
  // Metabolic
  basal_metabolic_rate?: number;
  recommended_calorie_intake?: number;
  visceral_fat_level?: number;
  obesity_degree?: number;
  
  // Impedance Data
  impedance_data?: {
    z_20hz?: { dd?: number; bi?: number; tr?: number; pd?: number; pi?: number };
    z_100hz?: { dd?: number; bi?: number; tr?: number; pd?: number; pi?: number };
  };
}

// Metric explanation interface
export interface MetricInfo {
  label: string;
  description: string;
  healthyRange?: string;
  unit?: string;
  getStatus?: (value: number, gender?: 'male' | 'female') => 'excellent' | 'good' | 'moderate' | 'attention';
  getTip?: (value: number, gender?: 'male' | 'female') => string;
}

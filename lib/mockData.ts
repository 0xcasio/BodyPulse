import { ExtractedScanData } from '@/types/scan';

// Mock data for testing without API credits
export const MOCK_SCAN_DATA: ExtractedScanData = {
  scan_date: '2023-10-19',
  weight: { value: 75.2, unit: 'kg' },
  skeletal_muscle_mass: { value: 35.8, unit: 'kg' },
  body_fat_mass: { value: 12.4, unit: 'kg' },
  body_fat_percentage: 16.5,
  bmi: 23.2,
  total_body_water: { value: 45.6, unit: 'L' },
  intracellular_water: { value: 28.4, unit: 'L' },
  extracellular_water: { value: 17.2, unit: 'L' },
  ecw_ratio: 0.377,
  segmental_lean: {
    right_arm: { mass: 3.2, percentage: 102 },
    left_arm: { mass: 3.1, percentage: 100 },
    trunk: { mass: 24.5, percentage: 101 },
    right_leg: { mass: 9.8, percentage: 98 },
    left_leg: { mass: 9.7, percentage: 97 },
  },
  basal_metabolic_rate: 1687,
  visceral_fat_level: 7,
  inbody_score: 82,
  phase_angle: 6.2,
};

import { Scan } from '@/types/scan';
import { getMetricStatus, METRIC_EXPLANATIONS } from '@/lib/metrics';
import { FocusArea } from '@/types/insights';

// Define health impact weights for each metric
const HEALTH_IMPACT_WEIGHTS: Record<string, number> = {
  // Critical metrics (30 points)
  visceral_fat_level: 30,
  body_fat_percentage: 30,
  phase_angle: 30,

  // High impact (20 points)
  skeletal_muscle_mass: 20,
  ecw_ratio: 20,
  bmi: 20,

  // Medium impact (15 points)
  inbody_score: 15,
  waist_hip_ratio: 15,
  obesity_degree: 15,

  // Lower impact (10 points)
  basal_metabolic_rate: 10,
};

// Status to score mapping
const STATUS_SCORES: Record<string, number> = {
  attention: 40,
  moderate: 25,
  good: 10,
  excellent: 5,
};

export function identifyFocusAreas(
  scan: Scan,
  gender?: 'male' | 'female'
): FocusArea[] {
  const focusAreas: FocusArea[] = [];

  // Evaluate each available metric
  const metricsToEvaluate = [
    'body_fat_percentage',
    'skeletal_muscle_mass',
    'visceral_fat_level',
    'bmi',
    'ecw_ratio',
    'phase_angle',
    'inbody_score',
    'waist_hip_ratio',
    'obesity_degree',
    'basal_metabolic_rate',
  ];

  for (const metricKey of metricsToEvaluate) {
    const value = getMetricValue(scan, metricKey);
    if (value === null || value === undefined) continue;

    const status = getMetricStatus(metricKey, value, gender);
    const metric = METRIC_EXPLANATIONS[metricKey];
    if (!metric) continue;

    const priorityScore = calculatePriorityScore(
      metricKey,
      value,
      status,
      gender
    );

    focusAreas.push({
      metricKey,
      metricLabel: metric.label,
      value,
      unit: metric.unit || '',
      status,
      priorityScore,
      healthyRange: metric.healthyRange,
      category: categorizeFocusArea(metricKey),
    });
  }

  // Sort by priority score (descending)
  focusAreas.sort((a, b) => b.priorityScore - a.priorityScore);

  // Return top 3-5 with score >= 30, or at least top 3
  const threshold = 30;
  const highPriority = focusAreas.filter(f => f.priorityScore >= threshold);

  if (highPriority.length >= 3) {
    return highPriority.slice(0, 5);
  } else {
    return focusAreas.slice(0, 3);
  }
}

function calculatePriorityScore(
  metricKey: string,
  value: number,
  status: 'excellent' | 'good' | 'moderate' | 'attention',
  gender?: 'male' | 'female'
): number {
  // Base score from status
  let score = STATUS_SCORES[status] || 0;

  // Add health impact weight
  const impactWeight = HEALTH_IMPACT_WEIGHTS[metricKey] || 10;
  score += impactWeight;

  // Add distance from optimal (calculated based on metric-specific logic)
  const distanceScore = calculateDistanceFromOptimal(metricKey, value, gender);
  score += distanceScore;

  return score;
}

function calculateDistanceFromOptimal(
  metricKey: string,
  value: number,
  gender?: 'male' | 'female'
): number {
  // Metric-specific distance calculations (0-30 points)
  // Higher deviation = higher score = higher priority

  switch (metricKey) {
    case 'body_fat_percentage':
      const optimal = gender === 'male' ? 15 : 22;
      const maxDeviation = 15; // 15% above optimal
      const deviation = Math.abs(value - optimal);
      return Math.min(30, (deviation / maxDeviation) * 30);

    case 'visceral_fat_level':
      // Optimal: 1-9, Concerning: 10+
      if (value <= 9) return 0;
      const vfDeviation = value - 9;
      return Math.min(30, (vfDeviation / 6) * 30); // Scale to 15

    case 'ecw_ratio':
      // Optimal: 0.360-0.380
      const ecwOptimal = 0.370;
      const ecwDeviation = Math.abs(value - ecwOptimal);
      return Math.min(30, (ecwDeviation / 0.05) * 30);

    case 'phase_angle':
      // Optimal: 7+ (excellent), concerning: <5
      if (value >= 7) return 0;
      const paDeviation = 7 - value;
      return Math.min(30, (paDeviation / 3) * 30);

    case 'bmi':
      // Optimal: 18.5-24.9
      const bmiOptimal = 21.7; // Middle of healthy range
      const bmiDeviation = Math.abs(value - bmiOptimal);
      return Math.min(30, (bmiDeviation / 10) * 30);

    case 'inbody_score':
      // Optimal: 90-100
      if (value >= 90) return 0;
      const scoreDeviation = 90 - value;
      return Math.min(30, (scoreDeviation / 30) * 30);

    default:
      return 10; // Default moderate distance
  }
}

function getMetricValue(scan: Scan, metricKey: string): number | null {
  // Map metric keys to scan properties
  const valueMap: Record<string, any> = {
    body_fat_percentage: scan.body_fat_percentage,
    skeletal_muscle_mass: scan.skeletal_muscle_mass,
    visceral_fat_level: scan.visceral_fat_level,
    bmi: scan.bmi,
    ecw_ratio: scan.ecw_ratio,
    phase_angle: scan.phase_angle,
    inbody_score: scan.inbody_score,
    waist_hip_ratio: scan.waist_hip_ratio,
    obesity_degree: scan.obesity_degree,
    basal_metabolic_rate: scan.basal_metabolic_rate,
  };

  return valueMap[metricKey] ?? null;
}

function categorizeFocusArea(metricKey: string): FocusArea['category'] {
  const categoryMap: Record<string, FocusArea['category']> = {
    body_fat_percentage: 'body_composition',
    skeletal_muscle_mass: 'body_composition',
    visceral_fat_level: 'metabolic_health',
    bmi: 'metabolic_health',
    basal_metabolic_rate: 'metabolic_health',
    ecw_ratio: 'cellular_health',
    phase_angle: 'cellular_health',
    waist_hip_ratio: 'balance',
    obesity_degree: 'body_composition',
    inbody_score: 'body_composition',
  };

  return categoryMap[metricKey] || 'body_composition';
}

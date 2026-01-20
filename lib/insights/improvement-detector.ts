import { Scan } from '@/types/scan';
import { MetricImprovement } from '@/types/insights';

export function detectImprovements(
  latestScan: Scan,
  previousScan: Scan | null
): MetricImprovement[] {
  if (!previousScan) return [];

  const improvements: MetricImprovement[] = [];

  // Define metrics to compare and their improvement direction
  const metricsToCompare = [
    { key: 'body_fat_percentage', improveDirection: 'down', label: 'Body Fat %', unit: '%' },
    { key: 'skeletal_muscle_mass', improveDirection: 'up', label: 'Muscle Mass', unit: latestScan.weight_unit || 'lbs' },
    { key: 'visceral_fat_level', improveDirection: 'down', label: 'Visceral Fat', unit: 'level' },
    { key: 'inbody_score', improveDirection: 'up', label: 'InBody Score', unit: 'pts' },
    { key: 'phase_angle', improveDirection: 'up', label: 'Phase Angle', unit: '°' },
    { key: 'ecw_ratio', improveDirection: 'down', label: 'ECW Ratio', unit: '' },
  ] as const;

  for (const metric of metricsToCompare) {
    const prevValue = (previousScan as any)[metric.key];
    const currValue = (latestScan as any)[metric.key];

    if (prevValue === null || currValue === null ||
      prevValue === undefined || currValue === undefined) continue;

    const change = currValue - prevValue;
    const percentChange = (change / prevValue) * 100;

    // Only include if change is meaningful (>= 2%)
    if (Math.abs(percentChange) >= 2) {
      const isImprovement = metric.improveDirection === 'down'
        ? change < 0
        : change > 0;

      improvements.push({
        metricKey: metric.key,
        metricLabel: metric.label,
        previousValue: prevValue,
        currentValue: currValue,
        change,
        percentChange,
        isImprovement,
        unit: metric.unit,
      });
    }
  }

  // Sort by improvement first, then by magnitude of change
  improvements.sort((a, b) => {
    if (a.isImprovement !== b.isImprovement) {
      return a.isImprovement ? -1 : 1;
    }
    return Math.abs(b.percentChange) - Math.abs(a.percentChange);
  });

  return improvements;
}

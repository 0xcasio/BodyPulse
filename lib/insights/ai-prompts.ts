import { Scan } from '@/types/scan';
import { FocusArea } from '@/types/insights';

export function buildInsightsPrompt(
  latestScan: Scan,
  previousScan: Scan | null,
  focusAreas: FocusArea[],
  userProfile: { age?: number; gender?: 'male' | 'female' }
): string {
  const contextSection = buildContextSection(latestScan, userProfile);
  const comparisonSection = previousScan
    ? buildComparisonSection(latestScan, previousScan)
    : '';
  const focusAreasSection = buildFocusAreasSection(focusAreas);
  const responseFormat = buildResponseFormat();

  return `${contextSection}

${comparisonSection}

${focusAreasSection}

${responseFormat}`;
}

function buildContextSection(scan: Scan, userProfile: any): string {
  return `You are a certified body composition analyst providing personalized health insights based on InBody scan data.

User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Scan Date: ${scan.scan_date}

Current Full Scan Metrics:
- Weight: ${scan.weight} ${scan.weight_unit}
- Body Fat: ${scan.body_fat_percentage ?? 'N/A'}%
- Muscle Mass: ${scan.skeletal_muscle_mass ?? 'N/A'} ${scan.weight_unit}
- InBody Score: ${scan.inbody_score || 'N/A'}
- Visceral Fat: ${scan.visceral_fat_level || 'N/A'}
- BMI: ${scan.bmi ?? 'N/A'}
- Phase Angle: ${scan.phase_angle ?? 'N/A'}°
- ECW Ratio: ${scan.ecw_ratio ?? 'N/A'}
- BMR: ${scan.basal_metabolic_rate || 'N/A'} kcal`;
}

function buildComparisonSection(latest: Scan, previous: Scan): string {
  return `Previous Scan (${previous.scan_date}) for Comparison:
- Weight: ${previous.weight} ${previous.weight_unit}
- Body Fat: ${previous.body_fat_percentage ?? 'N/A'}%
- Muscle Mass: ${previous.skeletal_muscle_mass ?? 'N/A'} ${previous.weight_unit}
- InBody Score: ${previous.inbody_score || 'N/A'}`;
}

function buildFocusAreasSection(focusAreas: FocusArea[]): string {
  const areas = focusAreas.map((area, index) => `
Focus Area ${index + 1}: ${area.metricLabel}
- Current Value: ${area.value} ${area.unit}
- Status: ${area.status}
- Healthy Range: ${area.healthyRange || 'Varies by individual'}
- Priority Score: ${area.priorityScore}`).join('\n');

  return `Our system has identified these priority areas for improvement:\n${areas}`;
}

function buildResponseFormat(): string {
  return `Provide personalized insights for EACH focus area in the following JSON format:

{
  "overall_summary": "2-3 sentence summary connecting all focus areas and overall direction",
  "celebration": "If there are improvements, 1-2 sentences of specific praise. If no previous scan or no improvements, omit this field.",
  "focus_areas": [
    {
      "metric": "body_fat_percentage",
      "why_it_matters": "2-3 sentences explaining health significance in simple terms, connecting to user's wellness",
      "current_assessment": "1-2 sentences honest evaluation of where they are, specific to their numbers",
      "action_plan": {
        "exercise": [
          "Specific exercise 1 with sets/reps/frequency (e.g., '3x per week: Squats 3x8-10 reps')",
          "Specific exercise 2...",
          "Specific exercise 3..."
        ],
        "nutrition": [
          "Specific dietary change 1 with examples (e.g., 'Aim for 1.6g protein per kg (120g daily): 4oz chicken at lunch, 4oz fish at dinner')",
          "Specific dietary change 2...",
          "Specific dietary change 3..."
        ],
        "lifestyle": [
          "Specific habit 1 with timeline (e.g., 'Sleep 7-8 hours by setting 10pm bedtime')",
          "Specific habit 2...",
          "Specific habit 3..."
        ],
        "tracking": [
          "How to monitor progress (e.g., 'Weekly progress photos, monthly InBody scan')"
        ]
      },
      "expected_timeline": "Realistic timeframe (e.g., '6-8 weeks for noticeable changes')"
    }
  ]
}

IMPORTANT GUIDELINES:
- Be specific with numbers (not "eat more protein" but "1.6g per kg = 120g daily")
- Reference their actual values in assessments
- Provide actionable, concrete steps
- Be encouraging but realistic
- Use evidence-based recommendations
- Keep tone professional but warm
- Return ONLY valid JSON, no markdown or other text`;
}

export interface FocusArea {
  metricKey: string;
  metricLabel: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'moderate' | 'attention';
  priorityScore: number;
  healthyRange?: string;
  category: 'body_composition' | 'metabolic_health' | 'cellular_health' | 'balance';
}

export interface ActionPlan {
  exercise: string[];
  nutrition: string[];
  lifestyle: string[];
  tracking: string[];
}

export interface FocusAreaInsight {
  metric: string;
  why_it_matters: string;
  current_assessment: string;
  action_plan: ActionPlan;
  expected_timeline: string;
}

export interface MetricImprovement {
  metricKey: string;
  metricLabel: string;
  previousValue: number;
  currentValue: number;
  change: number;
  percentChange: number;
  isImprovement: boolean;
  unit: string;
}

export interface InsightsResponse {
  success: boolean;
  data?: {
    overall_summary: string;
    celebration?: string;
    focus_areas: FocusAreaInsight[];
    improvements?: MetricImprovement[];
  };
  error?: string;
}

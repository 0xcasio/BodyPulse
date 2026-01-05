import { MetricInfo } from '@/types/scan';

export const METRIC_EXPLANATIONS: Record<string, MetricInfo> = {
  body_fat_percentage: {
    label: 'Body Fat Percentage',
    description: 'The percentage of your total weight that is fat tissue. This includes essential fat needed for bodily functions and storage fat.',
    healthyRange: 'Men: 10-20%, Women: 18-28%',
    unit: '%',
    getStatus: (value: number, gender: 'male' | 'female' = 'male') => {
      const ranges = gender === 'male'
        ? { excellent: [6, 13], good: [14, 17], moderate: [18, 24] }
        : { excellent: [14, 20], good: [21, 24], moderate: [25, 31] };

      if (value >= ranges.excellent[0] && value <= ranges.excellent[1]) return 'excellent';
      if (value >= ranges.good[0] && value <= ranges.good[1]) return 'good';
      if (value >= ranges.moderate[0] && value <= ranges.moderate[1]) return 'moderate';
      return 'attention';
    },
    getTip: (value: number, gender: 'male' | 'female' = 'male') => {
      const target = gender === 'male' ? 15 : 22;
      if (value > target + 8) return 'Focus on creating a caloric deficit through diet and add resistance training to preserve muscle mass.';
      if (value > target + 3) return 'Small adjustments to nutrition and consistent exercise can help you reach an optimal range.';
      return 'You\'re in a healthy range! Maintain your current lifestyle to stay here.';
    },
  },

  skeletal_muscle_mass: {
    label: 'Skeletal Muscle Mass',
    description: 'The weight of your voluntary muscles that you can control and strengthen through exercise. This excludes smooth muscle (organs) and cardiac muscle (heart).',
    healthyRange: 'Varies by height and weight',
    unit: 'kg',
    getStatus: (value: number) => {
      // This is simplified - real calculation would factor in height/weight
      return 'good';
    },
    getTip: () => {
      return 'Build muscle through progressive resistance training and ensure adequate protein intake (1.6-2.2g per kg of body weight).';
    },
  },

  visceral_fat_level: {
    label: 'Visceral Fat Level',
    description: 'Fat stored deep in your abdomen, surrounding your vital organs like liver, pancreas, and intestines. High levels increase risk of metabolic diseases.',
    healthyRange: '1-9 (healthy), 10-14 (high), 15+ (very high)',
    unit: 'level',
    getStatus: (value: number) => {
      if (value <= 9) return 'excellent';
      if (value <= 12) return 'good';
      if (value <= 14) return 'moderate';
      return 'attention';
    },
    getTip: (value: number) => {
      if (value > 14) return 'Visceral fat responds well to caloric restriction and aerobic exercise. Prioritize whole foods and reduce refined carbohydrates.';
      if (value > 9) return 'Increase daily movement and focus on cardiovascular exercise to reduce visceral fat accumulation.';
      return 'Excellent! Keep up your current healthy habits.';
    },
  },

  ecw_ratio: {
    label: 'ECW Ratio',
    description: 'The ratio of extracellular water (water outside cells) to total body water. Higher values may indicate inflammation, fluid retention, or overtraining.',
    healthyRange: '0.360 - 0.390',
    unit: 'ratio',
    getStatus: (value: number) => {
      if (value >= 0.360 && value <= 0.380) return 'excellent';
      if (value >= 0.350 && value <= 0.390) return 'good';
      if (value >= 0.340 && value <= 0.400) return 'moderate';
      return 'attention';
    },
    getTip: (value: number) => {
      if (value > 0.400) return 'Elevated ECW ratio may indicate inflammation or inadequate recovery. Consider reducing training volume and ensuring adequate sleep.';
      if (value > 0.390) return 'Monitor your hydration, recovery, and inflammation levels. Consider anti-inflammatory foods.';
      return 'Your ECW ratio is in the optimal range, indicating good cellular health and hydration balance.';
    },
  },

  phase_angle: {
    label: 'Phase Angle',
    description: 'A measure of cellular health and integrity. Higher values generally indicate better cell membrane function, which correlates with overall health and fitness.',
    healthyRange: '5-7° (healthy adult), 7-9° (athletic)',
    unit: '°',
    getStatus: (value: number) => {
      if (value >= 7) return 'excellent';
      if (value >= 5.5) return 'good';
      if (value >= 4.5) return 'moderate';
      return 'attention';
    },
    getTip: (value: number) => {
      if (value < 5) return 'Low phase angle may indicate poor nutrition or cellular health. Focus on nutrient-dense foods and consider consulting a healthcare provider.';
      if (value < 6) return 'Adequate protein, healthy fats, and antioxidants can support cellular health and improve phase angle.';
      return 'Excellent cellular health! Your training and nutrition are supporting optimal cell function.';
    },
  },

  basal_metabolic_rate: {
    label: 'Basal Metabolic Rate (BMR)',
    description: 'The number of calories your body burns at complete rest to maintain vital functions like breathing, circulation, and cell production.',
    healthyRange: 'Varies by body composition',
    unit: 'kcal',
    getStatus: () => 'good',
    getTip: (value: number) => {
      return `Your BMR is ${value} calories. Use this as a baseline for nutrition planning. To maintain weight, eat your BMR + activity calories. To lose fat, create a modest deficit (200-500 cal below total daily expenditure).`;
    },
  },

  bmi: {
    label: 'Body Mass Index (BMI)',
    description: 'A ratio of weight to height. Note: BMI doesn\'t account for muscle mass, so athletes may have "high" BMI despite being lean.',
    healthyRange: '18.5-24.9',
    unit: 'kg/m²',
    getStatus: (value: number) => {
      if (value >= 18.5 && value <= 22) return 'excellent';
      if (value >= 22.1 && value <= 24.9) return 'good';
      if (value >= 25 && value <= 29.9) return 'moderate';
      return 'attention';
    },
    getTip: (value: number) => {
      if (value < 18.5) return 'Your BMI is below the healthy range. Consider focusing on building muscle mass through strength training and adequate nutrition.';
      if (value > 25) return 'BMI is above the standard range, but remember this doesn\'t account for muscle. Look at body fat % for a more complete picture.';
      return 'Your BMI is in the healthy range.';
    },
  },

  inbody_score: {
    label: 'InBody Score',
    description: 'A comprehensive score (out of 100) that evaluates your overall body composition, combining muscle mass, body fat, and body water balance.',
    healthyRange: '80-100',
    unit: 'points',
    getStatus: (value: number) => {
      if (value >= 90) return 'excellent';
      if (value >= 80) return 'good';
      if (value >= 70) return 'moderate';
      return 'attention';
    },
    getTip: (value: number) => {
      if (value < 70) return 'Focus on building muscle through resistance training and optimizing body composition through nutrition.';
      if (value < 80) return 'You\'re making progress! Continue with consistent training and nutrition to improve your score.';
      return 'Outstanding body composition! Keep up your healthy lifestyle.';
    },
  },

  total_body_water: {
    label: 'Total Body Water',
    description: 'The total amount of water in your body, including water inside cells (intracellular) and outside cells (extracellular). Water makes up about 50-70% of your body weight and is essential for all bodily functions.',
    healthyRange: '45-65% of body weight',
    unit: 'L',
    getStatus: () => 'good',
    getTip: () => {
      return 'Total body water naturally varies based on muscle mass (muscle contains more water than fat). Higher muscle mass typically means higher total body water. Stay well-hydrated to support optimal cellular function.';
    },
  },

  protein: {
    label: 'Protein Mass',
    description: 'The total weight of protein in your body. Protein is found in muscles, organs, bones, skin, and nearly every tissue. It\'s essential for building and repairing tissues, making enzymes and hormones.',
    healthyRange: 'Proportional to muscle mass',
    unit: 'kg',
    getStatus: () => 'good',
    getTip: () => {
      return 'Protein mass increases with muscle growth. To support protein synthesis, consume 1.6-2.2g of protein per kg of body weight daily, especially if you\'re training. This metric reflects your structural protein, not dietary protein intake.';
    },
  },

  mineral: {
    label: 'Bone Mineral Content',
    description: 'The total weight of minerals in your body, primarily found in bones. Includes calcium, phosphorus, and other minerals that give bones their strength and rigidity. Higher values indicate stronger, denser bones.',
    healthyRange: 'Proportional to body size',
    unit: 'kg',
    getStatus: () => 'good',
    getTip: () => {
      return 'Bone mineral content increases with weight-bearing exercise and adequate calcium/vitamin D intake. Resistance training helps maintain and build bone density, especially important as you age.';
    },
  },

  body_fat_mass: {
    label: 'Body Fat Mass',
    description: 'The total weight of fat in your body. This includes essential fat (needed for vital functions like hormone production and vitamin absorption) and storage fat. Unlike body fat percentage, this shows the absolute amount.',
    healthyRange: 'Varies by individual',
    unit: 'kg',
    getStatus: (value: number) => {
      // This is simplified - would need body weight to give proper assessment
      return 'good';
    },
    getTip: (value: number) => {
      return 'Track changes in fat mass over time rather than the absolute number. Losing 0.5-1% of body weight per week in fat while preserving muscle is a sustainable approach. Focus on body fat percentage alongside this metric.';
    },
  },

  waist_hip_ratio: {
    label: 'Waist-to-Hip Ratio',
    description: 'The ratio of your waist circumference to your hip circumference. This indicates where your body stores fat. Higher values (more "apple-shaped") are associated with higher health risks than lower values ("pear-shaped").',
    healthyRange: 'Men: <0.90, Women: <0.85',
    unit: 'ratio',
    getStatus: (value: number, gender: 'male' | 'female' = 'male') => {
      const threshold = gender === 'male' ? 0.90 : 0.85;
      if (value < threshold - 0.05) return 'excellent';
      if (value < threshold) return 'good';
      if (value < threshold + 0.05) return 'moderate';
      return 'attention';
    },
    getTip: (value: number, gender: 'male' | 'female' = 'male') => {
      const threshold = gender === 'male' ? 0.90 : 0.85;
      if (value > threshold + 0.05) return 'Higher waist-to-hip ratio indicates abdominal fat accumulation, which increases cardiovascular disease risk. Focus on reducing visceral fat through diet and cardio exercise.';
      if (value > threshold) return 'Your ratio is slightly elevated. Aerobic exercise and core training can help reduce waist circumference.';
      return 'Excellent waist-to-hip ratio! This indicates healthy fat distribution and lower cardiovascular risk.';
    },
  },

  obesity_degree: {
    label: 'Obesity Degree',
    description: 'A percentage showing how your body fat compares to the standard for your height and gender. 100% means you\'re at the standard level. Values above 120% indicate excess body fat, while below 90% may indicate insufficient fat.',
    healthyRange: '90-110%',
    unit: '%',
    getStatus: (value: number) => {
      if (value >= 90 && value <= 100) return 'excellent';
      if (value >= 85 && value <= 110) return 'good';
      if (value >= 80 && value <= 120) return 'moderate';
      return 'attention';
    },
    getTip: (value: number) => {
      if (value > 120) return 'Your body fat is above the standard range. Focus on creating a caloric deficit through nutrition and regular exercise to reduce body fat percentage.';
      if (value > 110) return 'Slightly above standard. Small dietary adjustments and consistent activity can bring you into the optimal range.';
      if (value < 90) return 'You\'re below the standard. Ensure you\'re consuming adequate calories and consider that very low body fat can affect hormone function.';
      return 'Your obesity degree is in the healthy range, indicating appropriate body fat levels for your height and gender.';
    },
  },
};

// Helper to get metric status
export function getMetricStatus(
  metricKey: string,
  value: number,
  gender?: 'male' | 'female'
): 'excellent' | 'good' | 'moderate' | 'attention' {
  const metric = METRIC_EXPLANATIONS[metricKey];
  if (metric?.getStatus) {
    return metric.getStatus(value, gender);
  }
  return 'good';
}

// Helper to get metric tip
export function getMetricTip(
  metricKey: string,
  value: number,
  gender?: 'male' | 'female'
): string {
  const metric = METRIC_EXPLANATIONS[metricKey];
  if (metric?.getTip) {
    return metric.getTip(value, gender);
  }
  return '';
}

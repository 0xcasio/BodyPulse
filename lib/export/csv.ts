import { Scan } from '@/types/scan';

/**
 * Format a value for CSV export
 * Handles null/undefined, numbers, dates, and text
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (typeof value === 'number') {
    // Format numbers with appropriate decimal places
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(2);
  }
  if (typeof value === 'string') {
    // Escape quotes and wrap in quotes if contains comma, newline, or quote
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
  return String(value);
}

/**
 * Add a section header to CSV
 */
function addSectionHeader(csv: string[], title: string): void {
  csv.push(`[${title}]`);
}

/**
 * Add an empty row to CSV
 */
function addEmptyRow(csv: string[]): void {
  csv.push('');
}

/**
 * Add a row of data to CSV
 */
function addRow(csv: string[], values: (string | number | null | undefined)[]): void {
  csv.push(values.map(formatValue).join(','));
}

/**
 * Export scan data to well-formatted CSV
 */
export function exportScanToCSV(scan: Scan): string {
  const csv: string[] = [];
  
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  
  // Scan Information
  addSectionHeader(csv, 'Scan Information');
  addRow(csv, ['Scan Date', 'Test Time', 'Scan ID']);
  addRow(csv, [
    scan.scan_date || 'N/A',
    scan.test_time || 'N/A',
    scan.id
  ]);
  addEmptyRow(csv);
  
  // Personal Information
  addSectionHeader(csv, 'Personal Information');
  addRow(csv, ['Age (years)', 'Height', 'Height Unit', 'Weight', 'Weight Unit']);
  addRow(csv, [
    scan.user_age ?? 'N/A',
    scan.user_height ?? 'N/A',
    scan.user_height_unit ?? 'N/A',
    scan.weight ?? 'N/A',
    scan.weight_unit ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Body Composition
  addSectionHeader(csv, 'Body Composition');
  addRow(csv, [
    'Body Fat Percentage (%)',
    'Body Fat Mass',
    'Body Fat Mass Unit',
    'Skeletal Muscle Mass',
    'Skeletal Muscle Mass Unit',
    'Fat-Free Mass',
    'Fat-Free Mass Unit',
    'BMI'
  ]);
  addRow(csv, [
    scan.body_fat_percentage ?? 'N/A',
    scan.body_fat_mass ?? 'N/A',
    scan.weight_unit ?? 'N/A',
    scan.skeletal_muscle_mass ?? 'N/A',
    scan.weight_unit ?? 'N/A',
    scan.fat_free_mass ?? 'N/A',
    scan.weight_unit ?? 'N/A',
    scan.bmi ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Body Water
  addSectionHeader(csv, 'Body Water');
  addRow(csv, [
    'Total Body Water (L)',
    'Intracellular Water (L)',
    'Extracellular Water (L)',
    'ECW Ratio'
  ]);
  addRow(csv, [
    scan.total_body_water ?? 'N/A',
    scan.intracellular_water ?? 'N/A',
    scan.extracellular_water ?? 'N/A',
    scan.ecw_ratio ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Protein and Mineral
  addSectionHeader(csv, 'Protein & Mineral');
  addRow(csv, [
    'Protein',
    'Protein Unit',
    'Mineral',
    'Mineral Unit'
  ]);
  addRow(csv, [
    scan.protein ?? 'N/A',
    scan.protein_unit ?? 'N/A',
    scan.mineral ?? 'N/A',
    scan.mineral_unit ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Segmental Lean Mass
  if (scan.segmental_lean) {
    addSectionHeader(csv, 'Segmental Lean Mass');
    addRow(csv, [
      'Body Part',
      'Mass',
      'Unit',
      'Percentage (%)',
      'Evaluation'
    ]);
    
    const segments = [
      { name: 'Right Arm', data: scan.segmental_lean.right_arm },
      { name: 'Left Arm', data: scan.segmental_lean.left_arm },
      { name: 'Trunk', data: scan.segmental_lean.trunk },
      { name: 'Right Leg', data: scan.segmental_lean.right_leg },
      { name: 'Left Leg', data: scan.segmental_lean.left_leg },
    ];
    
    segments.forEach(segment => {
      if (segment.data) {
        addRow(csv, [
          segment.name,
          segment.data.mass ?? 'N/A',
          scan.weight_unit ?? 'N/A',
          segment.data.percentage ?? 'N/A',
          segment.data.evaluation ?? 'N/A'
        ]);
      }
    });
    addEmptyRow(csv);
  }
  
  // Segmental Fat Mass
  if (scan.segmental_fat) {
    addSectionHeader(csv, 'Segmental Fat Mass');
    addRow(csv, [
      'Body Part',
      'Mass',
      'Unit',
      'Percentage (%)',
      'Evaluation'
    ]);
    
    const segments = [
      { name: 'Right Arm', data: scan.segmental_fat.right_arm },
      { name: 'Left Arm', data: scan.segmental_fat.left_arm },
      { name: 'Trunk', data: scan.segmental_fat.trunk },
      { name: 'Right Leg', data: scan.segmental_fat.right_leg },
      { name: 'Left Leg', data: scan.segmental_fat.left_leg },
    ];
    
    segments.forEach(segment => {
      if (segment.data) {
        addRow(csv, [
          segment.name,
          segment.data.mass ?? 'N/A',
          scan.weight_unit ?? 'N/A',
          segment.data.percentage ?? 'N/A',
          segment.data.evaluation ?? 'N/A'
        ]);
      }
    });
    addEmptyRow(csv);
  }
  
  // Metabolic
  addSectionHeader(csv, 'Metabolic');
  addRow(csv, [
    'Basal Metabolic Rate (kcal)',
    'Recommended Calorie Intake (kcal/day)',
    'Visceral Fat Level',
    'Obesity Degree (%)'
  ]);
  addRow(csv, [
    scan.basal_metabolic_rate ?? 'N/A',
    scan.recommended_calorie_intake ?? 'N/A',
    scan.visceral_fat_level ?? 'N/A',
    scan.obesity_degree ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Scores & Evaluations
  addSectionHeader(csv, 'Scores & Evaluations');
  addRow(csv, [
    'InBody Score',
    'Phase Angle (°)',
    'BMC Evaluation',
    'PGC Evaluation'
  ]);
  addRow(csv, [
    scan.inbody_score ?? 'N/A',
    scan.phase_angle ?? 'N/A',
    scan.bmc_evaluation ?? 'N/A',
    scan.pgc_evaluation ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Weight Control
  addSectionHeader(csv, 'Weight Control Targets');
  addRow(csv, [
    'Target Weight',
    'Target Weight Unit',
    'Weight Control',
    'Weight Control Unit',
    'Fat Control',
    'Fat Control Unit',
    'Muscle Control',
    'Muscle Control Unit'
  ]);
  addRow(csv, [
    scan.target_weight ?? 'N/A',
    scan.weight_unit ?? 'N/A',
    scan.weight_control ?? 'N/A',
    scan.weight_unit ?? 'N/A',
    scan.fat_control ?? 'N/A',
    scan.weight_unit ?? 'N/A',
    scan.muscle_control ?? 'N/A',
    scan.weight_unit ?? 'N/A'
  ]);
  addEmptyRow(csv);
  
  // Body Balance
  addSectionHeader(csv, 'Body Balance');
  addRow(csv, [
    'Waist-Hip Ratio',
    'Upper-Lower Balance',
    'Left-Right Balance'
  ]);
  addRow(csv, [
    scan.waist_hip_ratio ?? 'N/A',
    scan.upper_lower_balance ?? 'N/A',
    scan.left_right_balance ?? 'N/A'
  ]);
  
  // Join all rows and add BOM
  return BOM + csv.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}


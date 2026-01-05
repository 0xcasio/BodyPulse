import * as XLSX from 'xlsx';
import { Scan } from '@/types/scan';

/**
 * Format a value for Excel export
 */
function formatValue(value: any): any {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return value;
}

/**
 * Create Summary Sheet
 */
function createSummarySheet(scan: Scan): XLSX.WorkSheet {
  const data: any[][] = [];
  
  // Title
  data.push(['Body Pulse - Scan Summary']);
  data.push([]);
  
  // Scan Information
  data.push(['Scan Information']);
  data.push(['Scan Date', scan.scan_date ? new Date(scan.scan_date).toLocaleDateString('en-US') : 'N/A']);
  data.push(['Test Time', scan.test_time || 'N/A']);
  data.push(['Scan ID', scan.id]);
  data.push([]);
  
  // Key Metrics
  data.push(['Key Metrics']);
  data.push(['Age (years)', formatValue(scan.user_age)]);
  data.push(['Height', formatValue(scan.user_height), scan.user_height_unit || '']);
  data.push(['Weight', formatValue(scan.weight), scan.weight_unit || '']);
  data.push(['BMI', formatValue(scan.bmi)]);
  data.push(['Body Fat Percentage (%)', formatValue(scan.body_fat_percentage)]);
  data.push(['Skeletal Muscle Mass', formatValue(scan.skeletal_muscle_mass), scan.weight_unit || '']);
  data.push(['InBody Score', formatValue(scan.inbody_score)]);
  data.push(['Basal Metabolic Rate (kcal)', formatValue(scan.basal_metabolic_rate)]);
  data.push(['Visceral Fat Level', formatValue(scan.visceral_fat_level)]);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Column A
    { wch: 15 }, // Column B
    { wch: 10 }  // Column C
  ];
  
  return ws;
}

/**
 * Create Detailed Metrics Sheet
 */
function createDetailedMetricsSheet(scan: Scan): XLSX.WorkSheet {
  const data: any[][] = [];
  
  // Header
  data.push(['Body Pulse - Detailed Metrics']);
  data.push([]);
  
  // Personal Information
  data.push(['Personal Information']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Age', formatValue(scan.user_age), 'years']);
  data.push(['Height', formatValue(scan.user_height), scan.user_height_unit || '']);
  data.push(['Weight', formatValue(scan.weight), scan.weight_unit || '']);
  data.push([]);
  
  // Body Composition
  data.push(['Body Composition']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Body Fat Percentage', formatValue(scan.body_fat_percentage), '%']);
  data.push(['Body Fat Mass', formatValue(scan.body_fat_mass), scan.weight_unit || '']);
  data.push(['Skeletal Muscle Mass', formatValue(scan.skeletal_muscle_mass), scan.weight_unit || '']);
  data.push(['Fat-Free Mass', formatValue(scan.fat_free_mass), scan.weight_unit || '']);
  data.push(['BMI', formatValue(scan.bmi), 'kg/m²']);
  data.push([]);
  
  // Body Water
  data.push(['Body Water']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Total Body Water', formatValue(scan.total_body_water), 'L']);
  data.push(['Intracellular Water', formatValue(scan.intracellular_water), 'L']);
  data.push(['Extracellular Water', formatValue(scan.extracellular_water), 'L']);
  data.push(['ECW Ratio', formatValue(scan.ecw_ratio), '']);
  data.push([]);
  
  // Protein & Mineral
  data.push(['Protein & Mineral']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Protein', formatValue(scan.protein), scan.protein_unit || '']);
  data.push(['Mineral', formatValue(scan.mineral), scan.mineral_unit || '']);
  data.push([]);
  
  // Metabolic
  data.push(['Metabolic']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Basal Metabolic Rate', formatValue(scan.basal_metabolic_rate), 'kcal']);
  data.push(['Recommended Calorie Intake', formatValue(scan.recommended_calorie_intake), 'kcal/day']);
  data.push(['Visceral Fat Level', formatValue(scan.visceral_fat_level), '']);
  data.push(['Obesity Degree', formatValue(scan.obesity_degree), '%']);
  data.push([]);
  
  // Scores & Evaluations
  data.push(['Scores & Evaluations']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['InBody Score', formatValue(scan.inbody_score), '']);
  data.push(['Phase Angle', formatValue(scan.phase_angle), '°']);
  data.push(['BMC Evaluation', formatValue(scan.bmc_evaluation), '']);
  data.push(['PGC Evaluation', formatValue(scan.pgc_evaluation), '']);
  data.push([]);
  
  // Weight Control
  data.push(['Weight Control Targets']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Target Weight', formatValue(scan.target_weight), scan.weight_unit || '']);
  data.push(['Weight Control', formatValue(scan.weight_control), scan.weight_unit || '']);
  data.push(['Fat Control', formatValue(scan.fat_control), scan.weight_unit || '']);
  data.push(['Muscle Control', formatValue(scan.muscle_control), scan.weight_unit || '']);
  data.push([]);
  
  // Body Balance
  data.push(['Body Balance']);
  data.push(['Metric', 'Value', 'Unit']);
  data.push(['Waist-Hip Ratio', formatValue(scan.waist_hip_ratio), '']);
  data.push(['Upper-Lower Balance', formatValue(scan.upper_lower_balance), '']);
  data.push(['Left-Right Balance', formatValue(scan.left_right_balance), '']);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Column A
    { wch: 15 }, // Column B
    { wch: 10 }  // Column C
  ];
  
  return ws;
}

/**
 * Create Segmental Analysis Sheet
 */
function createSegmentalAnalysisSheet(scan: Scan): XLSX.WorkSheet {
  const data: any[][] = [];
  
  // Header
  data.push(['Body Pulse - Segmental Analysis']);
  data.push([]);
  
  // Segmental Lean Mass
  if (scan.segmental_lean) {
    data.push(['Segmental Lean Mass']);
    data.push(['Body Part', 'Mass', 'Unit', 'Percentage (%)', 'Evaluation']);
    
    const segments = [
      { name: 'Right Arm', data: scan.segmental_lean.right_arm },
      { name: 'Left Arm', data: scan.segmental_lean.left_arm },
      { name: 'Trunk', data: scan.segmental_lean.trunk },
      { name: 'Right Leg', data: scan.segmental_lean.right_leg },
      { name: 'Left Leg', data: scan.segmental_lean.left_leg },
    ];
    
    segments.forEach(segment => {
      if (segment.data) {
        data.push([
          segment.name,
          formatValue(segment.data.mass),
          scan.weight_unit || '',
          formatValue(segment.data.percentage),
          formatValue(segment.data.evaluation)
        ]);
      }
    });
    data.push([]);
  }
  
  // Segmental Fat Mass
  if (scan.segmental_fat) {
    data.push(['Segmental Fat Mass']);
    data.push(['Body Part', 'Mass', 'Unit', 'Percentage (%)', 'Evaluation']);
    
    const segments = [
      { name: 'Right Arm', data: scan.segmental_fat.right_arm },
      { name: 'Left Arm', data: scan.segmental_fat.left_arm },
      { name: 'Trunk', data: scan.segmental_fat.trunk },
      { name: 'Right Leg', data: scan.segmental_fat.right_leg },
      { name: 'Left Leg', data: scan.segmental_fat.left_leg },
    ];
    
    segments.forEach(segment => {
      if (segment.data) {
        data.push([
          segment.name,
          formatValue(segment.data.mass),
          scan.weight_unit || '',
          formatValue(segment.data.percentage),
          formatValue(segment.data.evaluation)
        ]);
      }
    });
  }
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Column A
    { wch: 12 }, // Column B
    { wch: 8 },  // Column C
    { wch: 15 }, // Column D
    { wch: 12 }  // Column E
  ];
  
  return ws;
}

/**
 * Export scan data to well-formatted Excel file
 */
export function exportScanToExcel(scan: Scan): Blob {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create sheets
  const summarySheet = createSummarySheet(scan);
  const detailedSheet = createDetailedMetricsSheet(scan);
  const segmentalSheet = createSegmentalAnalysisSheet(scan);
  
  // Add sheets to workbook
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(wb, detailedSheet, 'Detailed Metrics');
  XLSX.utils.book_append_sheet(wb, segmentalSheet, 'Segmental Analysis');
  
  // Generate Excel file as buffer
  const excelBuffer = XLSX.write(wb, { 
    type: 'array', 
    bookType: 'xlsx',
    cellStyles: true
  });
  
  // Convert to Blob
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * Download Excel file
 */
export function downloadExcel(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}


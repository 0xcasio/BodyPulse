import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Scan, ExtractedScanData } from '@/types/scan';
import { getAgeForScan } from '@/lib/utils/age';
import { getUserProfile } from './users';

/**
 * Get the current authenticated user ID (auth.uid())
 * This is the UUID from Supabase Auth, not from our users table
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Get the session to access auth.uid()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session?.user) {
      return null;
    }
    
    // Return the user ID from auth (this is what auth.uid() returns)
    return session.user.id;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Convert ExtractedScanData to database format
 */
function convertExtractedToScan(
  extracted: ExtractedScanData,
  userId: string,
  imageUrl: string,
  confidence: number
): Partial<Scan> {
  // Normalize gender: handle Spanish and English
  const normalizeGender = (gender?: string): 'male' | 'female' | undefined => {
    if (!gender) return undefined;
    const lower = gender.toLowerCase();
    if (lower.includes('male') || lower.includes('masculino') || lower.includes('hombre')) {
      return 'male';
    }
    if (lower.includes('female') || lower.includes('femenino') || lower.includes('mujer')) {
      return 'female';
    }
    return undefined;
  };

  // Normalize weight unit: convert "lb" to "lbs"
  const normalizeWeightUnit = (unit?: string): 'kg' | 'lbs' => {
    if (!unit) return 'lbs';
    const lower = unit.toLowerCase();
    if (lower === 'kg' || lower === 'kilogram' || lower === 'kilogramo') return 'kg';
    return 'lbs'; // Default to lbs for lb, lbs, pound, etc.
  };

  // Normalize height unit
  const normalizeHeightUnit = (unit?: string): 'in' | 'cm' | 'ft' | undefined => {
    if (!unit) return undefined;
    const lower = unit.toLowerCase();
    if (lower === 'ft' || lower === 'feet' || lower === 'pie') return 'ft';
    if (lower === 'cm' || lower === 'centimeter' || lower === 'centimetro') return 'cm';
    if (lower === 'in' || lower === 'inch' || lower === 'pulgada') return 'in';
    return undefined;
  };

  // Parse height string to number (handles formats like "5ft 08.0in", "5.8", "68in", etc.)
  const parseHeight = (height?: string | number, unit?: string): number | null => {
    if (height === null || height === undefined) return null;
    
    // If already a number, return it
    if (typeof height === 'number') return height;
    
    // If it's a string, try to parse it
    const heightStr = String(height).trim();
    
    // Try to parse formats like "5ft 08.0in" or "5ft 8in"
    const feetInchesMatch = heightStr.match(/(\d+)\s*ft\s*(\d+(?:\.\d+)?)\s*in/i);
    if (feetInchesMatch) {
      const feet = parseFloat(feetInchesMatch[1]);
      const inches = parseFloat(feetInchesMatch[2]);
      const totalInches = feet * 12 + inches;
      
      // Convert to the unit specified, or default to feet
      const targetUnit = normalizeHeightUnit(unit) || 'ft';
      if (targetUnit === 'ft') {
        return totalInches / 12; // Convert to feet
      } else if (targetUnit === 'in') {
        return totalInches; // Keep in inches
      } else if (targetUnit === 'cm') {
        return totalInches * 2.54; // Convert to cm
      }
    }
    
    // Try to parse formats like "68in" or "5.8ft" or "175cm"
    const unitMatch = heightStr.match(/(\d+(?:\.\d+)?)\s*(ft|in|cm|feet|inch|centimeter)/i);
    if (unitMatch) {
      const value = parseFloat(unitMatch[1]);
      const detectedUnit = unitMatch[2].toLowerCase();
      const targetUnit = normalizeHeightUnit(unit) || normalizeHeightUnit(detectedUnit) || 'ft';
      
      // Convert to target unit
      if (detectedUnit === 'ft' || detectedUnit === 'feet') {
        if (targetUnit === 'ft') return value;
        if (targetUnit === 'in') return value * 12;
        if (targetUnit === 'cm') return value * 30.48;
      } else if (detectedUnit === 'in' || detectedUnit === 'inch') {
        if (targetUnit === 'in') return value;
        if (targetUnit === 'ft') return value / 12;
        if (targetUnit === 'cm') return value * 2.54;
      } else if (detectedUnit === 'cm' || detectedUnit === 'centimeter') {
        if (targetUnit === 'cm') return value;
        if (targetUnit === 'in') return value / 2.54;
        if (targetUnit === 'ft') return value / 30.48;
      }
    }
    
    // Try to parse as plain number
    const numericValue = parseFloat(heightStr.replace(/[^\d.]/g, ''));
    if (!isNaN(numericValue)) {
      // Assume the unit from the unit parameter, or default to feet
      const targetUnit = normalizeHeightUnit(unit) || 'ft';
      return numericValue; // Return as-is, assuming it's already in the correct unit
    }
    
    return null;
  };

  // Normalize BMC evaluation
  const normalizeBmcEvaluation = (evaluation?: string): 'Low' | 'Normal' | 'High' | undefined => {
    if (!evaluation) return undefined;
    const lower = evaluation.toLowerCase();
    if (lower.includes('low') || lower.includes('bajo')) return 'Low';
    if (lower.includes('high') || lower.includes('alto')) return 'High';
    if (lower.includes('normal')) return 'Normal';
    return undefined;
  };

  // Normalize PGC evaluation
  const normalizePgcEvaluation = (evaluation?: string): 'Normal' | 'Slightly High' | 'High' | undefined => {
    if (!evaluation) return undefined;
    const lower = evaluation.toLowerCase();
    if (lower.includes('slightly') || lower.includes('ligeramente')) return 'Slightly High';
    if (lower.includes('high') && !lower.includes('slightly') || lower.includes('alto')) return 'High';
    if (lower.includes('normal')) return 'Normal';
    return undefined;
  };

  // Normalize segmental evaluation (Low, Normal, High, Over, Under, etc.)
  const normalizeSegmentalEvaluation = (evaluation?: string): 'Low' | 'Normal' | 'High' | undefined => {
    if (!evaluation) return undefined;
    const lower = evaluation.toLowerCase();
    if (lower.includes('low') || lower.includes('bajo') || lower.includes('under')) return 'Low';
    if (lower.includes('high') || lower.includes('alto') || lower.includes('over')) return 'High';
    if (lower.includes('normal')) return 'Normal';
    return undefined;
  };

  // Parse any numeric value (handles strings, numbers, null, undefined)
  const parseNumeric = (value: string | number | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }
    if (typeof value === 'string') {
      // Remove common non-numeric characters but keep decimal point and minus sign
      const cleaned = value.trim().replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  // Parse integer (rounds decimals)
  const parseInteger = (value: string | number | null | undefined): number | null => {
    const num = parseNumeric(value);
    return num === null ? null : Math.round(num);
  };

  // Parse date string to YYYY-MM-DD format
  const parseDate = (dateStr?: string | null): string | null => {
    if (!dateStr) return null;
    try {
      // Try ISO format first
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      // Try parsing as Date object
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      // Try DD/MM/YYYY or MM/DD/YYYY formats
      const parts = dateStr.split(/[\/\-\.]/);
      if (parts.length === 3) {
        // Assume YYYY-MM-DD or try to detect format
        const year = parts.find(p => p.length === 4) || parts[2];
        const month = parts.find(p => p !== year && parseInt(p) <= 12) || parts[0];
        const day = parts.find(p => p !== year && p !== month) || parts[1];
        if (year && month && day) {
          const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
          }
        }
      }
    } catch (e) {
      console.warn('Date parsing error:', e);
    }
    return null;
  };

  // Parse time string to HH:MM format
  const parseTime = (timeStr?: string | null): string | null => {
    if (!timeStr) return null;
    const cleaned = timeStr.trim();
    // Try HH:MM format
    if (cleaned.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = cleaned.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    // Try HHMM format
    if (cleaned.match(/^\d{3,4}$/)) {
      const padded = cleaned.padStart(4, '0');
      return `${padded.substring(0, 2)}:${padded.substring(2)}`;
    }
    return cleaned; // Return as-is if can't parse
  };

  // Normalize segmental data structure
  const normalizeSegmentalData = (segmental?: any): any | null => {
    if (!segmental) return null;
    try {
      const normalized: any = {};
      const segments = ['right_arm', 'left_arm', 'trunk', 'right_leg', 'left_leg'];
      
      for (const segment of segments) {
        if (segmental[segment]) {
          normalized[segment] = {
            mass: parseNumeric(segmental[segment].mass),
            percentage: parseNumeric(segmental[segment].percentage),
            evaluation: normalizeSegmentalEvaluation(segmental[segment].evaluation),
          };
        }
      }
      
      return Object.keys(normalized).length > 0 ? normalized : null;
    } catch (e) {
      console.warn('Segmental data normalization error:', e);
      return null;
    }
  };

  // Normalize impedance data structure
  const normalizeImpedanceData = (impedance?: any): any | null => {
    if (!impedance) return null;
    try {
      const normalized: any = {};
      
      // Handle z_20hz and z_100hz structures
      if (impedance.z_20hz) {
        normalized.z_20hz = {};
        const keys = ['dd', 'bi', 'tr', 'pd', 'pi', 'ra', 'la', 'rl', 'll']; // Support both formats
        for (const key of keys) {
          if (impedance.z_20hz[key] !== undefined) {
            normalized.z_20hz[key] = parseNumeric(impedance.z_20hz[key]);
          }
        }
      }
      
      if (impedance.z_100hz) {
        normalized.z_100hz = {};
        const keys = ['dd', 'bi', 'tr', 'pd', 'pi', 'ra', 'la', 'rl', 'll']; // Support both formats
        for (const key of keys) {
          if (impedance.z_100hz[key] !== undefined) {
            normalized.z_100hz[key] = parseNumeric(impedance.z_100hz[key]);
          }
        }
      }
      
      return Object.keys(normalized).length > 0 ? normalized : null;
    } catch (e) {
      console.warn('Impedance data normalization error:', e);
      return null;
    }
  };

  return {
    user_id: userId, // This will be auth.uid() from Supabase Auth
    scan_date: parseDate(extracted.scan_date) || new Date().toISOString().split('T')[0],
    source_image_url: imageUrl || undefined, // Can be undefined if not storing images
    extraction_confidence: parseNumeric(confidence) || 0,
    
    // Personal info - all parsed and normalized
    user_height: parseHeight(extracted.user_height, extracted.user_height_unit) ?? undefined,
    user_height_unit: normalizeHeightUnit(extracted.user_height_unit),
    user_age: parseInteger(extracted.user_age) ?? undefined,
    user_gender: normalizeGender(extracted.user_gender),
    test_time: parseTime(extracted.test_time) ?? undefined,
    
    // Core metrics - all parsed as numeric
    weight: parseNumeric(extracted.weight?.value) || (typeof extracted.weight === 'number' ? parseNumeric(extracted.weight) : 0) || 0,
    weight_unit: normalizeWeightUnit(extracted.weight?.unit),
    skeletal_muscle_mass: parseNumeric(extracted.skeletal_muscle_mass?.value) ?? (typeof extracted.skeletal_muscle_mass === 'number' ? parseNumeric(extracted.skeletal_muscle_mass) : undefined) ?? undefined,
    body_fat_mass: parseNumeric(extracted.body_fat_mass?.value) ?? (typeof extracted.body_fat_mass === 'number' ? parseNumeric(extracted.body_fat_mass) : undefined) ?? undefined,
    body_fat_percentage: parseNumeric(extracted.body_fat_percentage) ?? undefined,
    bmi: parseNumeric(extracted.bmi) ?? undefined,

    // Body composition - all parsed as numeric
    protein: parseNumeric(extracted.protein?.value) ?? (typeof extracted.protein === 'number' ? parseNumeric(extracted.protein) : undefined) ?? undefined,
    protein_unit: extracted.protein?.unit ? normalizeWeightUnit(extracted.protein.unit) : undefined,
    mineral: parseNumeric(extracted.mineral?.value) ?? (typeof extracted.mineral === 'number' ? parseNumeric(extracted.mineral) : undefined) ?? undefined,
    mineral_unit: extracted.mineral?.unit ? normalizeWeightUnit(extracted.mineral.unit) : undefined,
    fat_free_mass: parseNumeric(extracted.fat_free_mass) ?? undefined,

    // Body water - all parsed as numeric
    total_body_water: parseNumeric(extracted.total_body_water?.value) ?? (typeof extracted.total_body_water === 'number' ? parseNumeric(extracted.total_body_water) : undefined) ?? undefined,
    intracellular_water: parseNumeric(extracted.intracellular_water?.value) ?? (typeof extracted.intracellular_water === 'number' ? parseNumeric(extracted.intracellular_water) : undefined) ?? undefined,
    extracellular_water: parseNumeric(extracted.extracellular_water?.value) ?? (typeof extracted.extracellular_water === 'number' ? parseNumeric(extracted.extracellular_water) : undefined) ?? undefined,
    ecw_ratio: parseNumeric(extracted.ecw_ratio) ?? undefined,

    // Segmental analysis - normalized structure with parsed values
    segmental_lean: normalizeSegmentalData(extracted.segmental_lean) ?? undefined,
    segmental_fat: normalizeSegmentalData(extracted.segmental_fat) ?? undefined,

    // Weight control targets - all parsed as numeric
    target_weight: parseNumeric(extracted.target_weight) ?? undefined,
    weight_control: parseNumeric(extracted.weight_control) ?? undefined,
    fat_control: parseNumeric(extracted.fat_control) ?? undefined,
    muscle_control: parseNumeric(extracted.muscle_control) ?? undefined,

    // Body balance
    waist_hip_ratio: parseNumeric(extracted.waist_hip_ratio) ?? undefined,
    upper_lower_balance: extracted.upper_lower_balance ? String(extracted.upper_lower_balance).trim() : undefined,
    left_right_balance: extracted.left_right_balance ? String(extracted.left_right_balance).trim() : undefined,
    
    // Metabolic - integers where specified
    basal_metabolic_rate: parseInteger(extracted.basal_metabolic_rate) ?? undefined,
    recommended_calorie_intake: parseInteger(extracted.recommended_calorie_intake) ?? undefined,
    visceral_fat_level: parseInteger(extracted.visceral_fat_level) ?? undefined,
    obesity_degree: parseNumeric(extracted.obesity_degree) ?? undefined,

    // Scores & evaluations
    inbody_score: parseInteger(extracted.inbody_score) ?? undefined,
    phase_angle: parseNumeric(extracted.phase_angle) ?? undefined,
    bmc_evaluation: normalizeBmcEvaluation(extracted.bmc_evaluation),
    pgc_evaluation: normalizePgcEvaluation(extracted.pgc_evaluation),

    // Impedance data - normalized structure
    impedance_data: normalizeImpedanceData(extracted.impedance_data) ?? undefined,
    
    // Edit tracking
    manually_edited: false,
    edited_fields: [],
  };
}

/**
 * Save a scan to the database
 */
export async function saveScan(
  extracted: ExtractedScanData,
  imageUrl: string,
  confidence: number,
  userId?: string
): Promise<Scan | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, scan not saved to database');
    return null;
  }

  try {
    const finalUserId = userId || await getCurrentUserId();
    if (!finalUserId) {
      throw new Error('User not authenticated');
    }

    const scanData = convertExtractedToScan(extracted, finalUserId, imageUrl, confidence);

    // Calculate age from birthday if available
    const userProfile = await getUserProfile(finalUserId);
    if (userProfile?.birthday && scanData.scan_date) {
      const calculatedAge = getAgeForScan(
        userProfile.birthday,
        scanData.scan_date,
        scanData.user_age
      );
      if (calculatedAge !== null) {
        scanData.user_age = calculatedAge;
      }
    }

    // Ensure user_id is set correctly (must match auth.uid() for RLS to work)
    const insertData = {
      ...scanData,
      user_id: finalUserId, // This must match auth.uid() for RLS policies
    };

    const { data, error } = await supabase
      .from('scans')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Better error logging
      const errorInfo = {
        message: error.message || 'No message',
        details: error.details || 'No details',
        hint: error.hint || 'No hint',
        code: error.code || 'No code',
      };
      
      console.error('❌ Supabase insert error:', JSON.stringify(errorInfo, null, 2));
      console.error('📊 Insert data sample (key fields):', {
        user_id: insertData.user_id,
        user_height: insertData.user_height,
        user_height_unit: insertData.user_height_unit,
        user_height_type: typeof insertData.user_height,
        weight: insertData.weight,
        weight_type: typeof insertData.weight,
        scan_date: insertData.scan_date,
      });
      
      // Log specific problematic fields
      if (error.message?.includes('user_height') || error.code === '22P02' || error.code === '42804') {
        console.error('⚠️ Height parsing issue detected!');
        console.error('   Original extracted value:', extracted.user_height, '(type:', typeof extracted.user_height, ')');
        console.error('   Parsed value:', insertData.user_height, '(type:', typeof insertData.user_height, ')');
        console.error('   Unit:', insertData.user_height_unit);
      }
      
      throw error;
    }
    return data as Scan;
  } catch (error) {
    console.error('Error saving scan:', error);
    return null;
  }
}

/**
 * Get all scans for a user
 */
export async function getUserScans(userId?: string, limit?: number): Promise<Scan[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const finalUserId = userId || await getCurrentUserId();
    if (!finalUserId) {
      return [];
    }

    let query = supabase
      .from('scans')
      .select('*')
      .eq('user_id', finalUserId)
      .order('scan_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Scan[];
  } catch (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
}

/**
 * Get a single scan by ID
 */
export async function getScanById(scanId: string): Promise<Scan | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) throw error;
    return data as Scan;
  } catch (error) {
    console.error('Error fetching scan:', error);
    return null;
  }
}

/**
 * Update a scan
 */
export async function updateScan(scanId: string, updates: Partial<Scan>): Promise<Scan | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('scans')
      .update(updates)
      .eq('id', scanId)
      .select()
      .single();

    if (error) throw error;
    return data as Scan;
  } catch (error) {
    console.error('Error updating scan:', error);
    return null;
  }
}

/**
 * Delete a scan
 */
export async function deleteScan(scanId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('scans')
      .delete()
      .eq('id', scanId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting scan:', error);
    return false;
  }
}


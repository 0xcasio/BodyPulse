/**
 * User Profile Type Definitions
 * 
 * These types define the structure of user profile data stored in the database.
 * The UserProfile interface matches the users table schema with profile fields.
 */

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  birthday?: string; // ISO date string (YYYY-MM-DD)
  default_age?: number;
  default_height?: number;
  default_height_unit?: 'in' | 'cm' | 'ft';
  default_weight?: number;
  default_weight_unit?: 'kg' | 'lbs';
  default_gender?: 'male' | 'female';
  preferred_units?: 'metric' | 'imperial';
  created_at: string;
  updated_at: string;
}

/**
 * User profile defaults for new scans
 * This is a subset of UserProfile containing only the default values
 */
export interface UserProfileDefaults {
  default_age?: number;
  default_height?: number;
  default_height_unit?: 'in' | 'cm' | 'ft';
  default_weight?: number;
  default_weight_unit?: 'kg' | 'lbs';
  default_gender?: 'male' | 'female';
  preferred_units?: 'metric' | 'imperial';
}


import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, UserProfileDefaults } from '@/types/user';
import { getCurrentUserId } from './queries';

/**
 * Get the current user's profile
 * Returns the full user profile including all profile fields
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot fetch user profile');
    return null;
  }

  try {
    const finalUserId = userId || await getCurrentUserId();
    if (!finalUserId) {
      return null;
    }

    // First, get the email from auth.users (Supabase Auth)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Error getting auth user:', authError);
      return null;
    }

    // Then, get the profile from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', finalUserId)
      .single();

    if (error) {
      // If user doesn't exist in users table, try to create one
      if (error.code === 'PGRST116') {
        // User not found in users table, try to create one
        // First try upsert (insert or update if exists)
        const { data: newUser, error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: finalUserId,
            email: user.email || '',
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (!upsertError && newUser) {
          return {
            ...newUser,
            email: user.email || '',
          } as UserProfile;
        }

        // If upsert fails, try a simple insert
        const { data: insertUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: finalUserId,
            email: user.email || '',
          })
          .select()
          .single();

        if (!insertError && insertUser) {
          return {
            ...insertUser,
            email: user.email || '',
          } as UserProfile;
        }

        // If both fail, log the error but return a minimal profile so the page doesn't crash
        // The user can still use the app, and we'll try to create the record again on next visit
        console.warn('Could not create user record in users table. Returning minimal profile.', {
          upsertError: upsertError ? {
            message: upsertError.message,
            code: upsertError.code,
          } : null,
          insertError: insertError ? {
            message: insertError.message,
            code: insertError.code,
          } : null,
        });

        // Return minimal profile - the page will still work
        return {
          id: finalUserId,
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile;
      }

      // For other errors, log and return null
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Combine auth email with profile data
    return {
      ...data,
      email: user.email || data.email || '',
    } as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Update user profile
 * Updates the profile fields in the users table
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot update user profile');
    return null;
  }

  try {
    // Remove fields that shouldn't be updated directly
    const { id, email, created_at, updated_at, ...updateableFields } = updates;

    const { data, error } = await supabase
      .from('users')
      .update(updateableFields)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    // Get email from auth
    const { data: { user } } = await supabase.auth.getUser();
    
    return {
      ...data,
      email: user?.email || data.email || '',
    } as UserProfile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

/**
 * Get user profile defaults for new scans
 * Returns only the default values that should be applied to new scans
 */
export async function getUserProfileDefaults(
  userId?: string
): Promise<UserProfileDefaults | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      return null;
    }

    return {
      default_age: profile.default_age,
      default_height: profile.default_height,
      default_height_unit: profile.default_height_unit,
      default_weight: profile.default_weight,
      default_weight_unit: profile.default_weight_unit,
      default_gender: profile.default_gender,
      preferred_units: profile.preferred_units,
    };
  } catch (error) {
    console.error('Error in getUserProfileDefaults:', error);
    return null;
  }
}


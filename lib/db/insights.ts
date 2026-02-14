import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { FocusAreaInsight } from '@/types/insights';

export interface StoredInsights {
  id: string;
  scan_id: string;
  user_id: string;
  overall_summary: string;
  celebration: string | null;
  focus_areas: FocusAreaInsight[];
  created_at: string;
}

/**
 * Get cached insights for a scan from the database.
 * Returns null if no insights exist for this scan.
 */
export async function getInsightsForScan(scanId: string): Promise<StoredInsights | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('scan_insights')
      .select('*')
      .eq('scan_id', scanId)
      .single();

    if (error) {
      // PGRST116 = no rows found, which is expected when insights don't exist yet
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as StoredInsights;
  } catch (error) {
    console.error('Error fetching insights for scan:', error);
    return null;
  }
}

/**
 * Save generated insights to the database for a scan.
 * Uses upsert so re-generating insights for the same scan replaces the old ones.
 */
export async function saveInsightsForScan(
  scanId: string,
  userId: string,
  insights: {
    overall_summary: string;
    celebration?: string;
    focus_areas: FocusAreaInsight[];
  }
): Promise<StoredInsights | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('scan_insights')
      .upsert(
        {
          scan_id: scanId,
          user_id: userId,
          overall_summary: insights.overall_summary,
          celebration: insights.celebration || null,
          focus_areas: insights.focus_areas,
        },
        { onConflict: 'scan_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as StoredInsights;
  } catch (error) {
    console.error('Error saving insights:', error);
    return null;
  }
}

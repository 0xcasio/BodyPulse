import { Scan } from '@/types/scan';
import { identifyFocusAreas } from './prioritization';
import { InsightsResponse } from '@/types/insights';

/**
 * Generates insights in the background after a scan is saved.
 * This is a fire-and-forget operation that doesn't block the UI.
 * Results are cached in sessionStorage for instant access later.
 */
export async function generateInsightsInBackground(
  latestScan: Scan,
  previousScan: Scan | null
): Promise<void> {
  try {
    console.log('🚀 Starting background insights generation for scan:', latestScan.id);

    // Get user gender from scan
    const gender = latestScan.user_gender as 'male' | 'female' | undefined;

    // Identify focus areas using prioritization algorithm
    const focusAreas = identifyFocusAreas(latestScan, gender);

    if (focusAreas.length === 0) {
      console.warn('⚠️ No focus areas identified for background generation');
      return;
    }

    console.log(`✅ Identified ${focusAreas.length} focus areas, calling AI API...`);

    // Call API to generate AI insights
    const response = await fetch('/api/insights/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latestScan,
        previousScan,
        focusAreas,
        userProfile: {
          age: latestScan.user_age,
          gender: gender,
        },
      }),
    });

    if (!response.ok) {
      console.error('❌ Background insights generation failed:', response.statusText);
      return;
    }

    const result: InsightsResponse = await response.json();

    if (!result.success || !result.data) {
      console.error('❌ Background insights generation failed:', result.error);
      return;
    }

    // Cache the result
    const cacheKey = `insights_${latestScan.id}`;
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: result.data,
        timestamp: Date.now(),
      })
    );

    console.log('✅ Background insights generated and cached successfully!');
    console.log('🎉 User will see instant results when they visit the Insights page');
  } catch (error) {
    // Fail silently - this is background generation
    // User can still generate insights on-demand if needed
    console.error('❌ Background insights generation error:', error);
  }
}

/**
 * Triggers background insights generation without blocking.
 * Returns immediately - doesn't wait for completion.
 */
export function triggerBackgroundInsightsGeneration(
  latestScan: Scan,
  previousScan: Scan | null
): void {
  // Fire and forget - don't await
  generateInsightsInBackground(latestScan, previousScan).catch((err) => {
    console.error('Background insights generation failed:', err);
  });
}

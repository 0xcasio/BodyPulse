import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Scan } from '@/types/scan';
import { FocusArea, InsightsResponse, FocusAreaInsight } from '@/types/insights';
import { buildInsightsPrompt } from '@/lib/insights/ai-prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Anthropic API key not configured',
        } as InsightsResponse,
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      latestScan,
      previousScan,
      focusAreas,
      userProfile,
    }: {
      latestScan: Scan;
      previousScan?: Scan;
      focusAreas: FocusArea[];
      userProfile: { age?: number; gender?: 'male' | 'female' };
    } = body;

    // Validate request body
    if (!latestScan || !focusAreas || focusAreas.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: latestScan and focusAreas are required',
        } as InsightsResponse,
        { status: 400 }
      );
    }

    // Build AI prompt
    const prompt = buildInsightsPrompt(
      latestScan,
      previousScan || null,
      focusAreas,
      userProfile
    );

    console.log('🤖 Generating insights with Claude AI...');

    // Call Claude API with fallback model support
    const modelsToTry = [
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
    ];

    let response: Anthropic.Messages.Message | null = null;
    let modelUsed: string | null = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`🔄 Trying ${model}...`);
        response = await anthropic.messages.create({
          model: model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });
        modelUsed = model;
        console.log(`✅ Successfully using ${model}`);
        break;
      } catch (modelError: any) {
        // If model not found (404), try next model
        if (
          modelError?.status === 404 &&
          modelError?.error?.error?.message?.includes('model')
        ) {
          console.warn(`⚠️ ${model} not available, trying next model...`);
          lastError = modelError;
          continue;
        }
        // For other errors (auth, rate limit, etc.), throw immediately
        throw modelError;
      }
    }

    // If no model worked, return error
    if (!response || !modelUsed) {
      throw new Error(
        `None of the available models worked. Last error: ${lastError?.message || 'Unknown error'}`
      );
    }

    console.log('✅ Claude API response received');

    // Extract JSON from response
    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unexpected response format from AI',
        } as InsightsResponse,
        { status: 500 }
      );
    }

    // Parse JSON - handle potential markdown code blocks
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const insightsData = JSON.parse(jsonText) as {
      overall_summary: string;
      celebration?: string;
      focus_areas: FocusAreaInsight[];
    };

    console.log('✅ Insights generated successfully');

    return NextResponse.json({
      success: true,
      data: insightsData,
    } as InsightsResponse);
  } catch (error) {
    console.error('❌ Error generating insights:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific API errors
      if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'API authentication failed - check your ANTHROPIC_API_KEY';
      } else if (error.message.includes('429') || error.message.includes('rate_limit')) {
        errorMessage = 'API rate limit exceeded - please try again later';
      } else if (error.message.includes('400') || error.message.includes('invalid')) {
        errorMessage = `API request invalid: ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as InsightsResponse,
      { status: 500 }
    );
  }
}

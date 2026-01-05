import Anthropic from '@anthropic-ai/sdk';
import { ExtractedScanData } from '@/types/scan';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const EXTRACTION_PROMPT = `Analyze this InBody body composition scan and extract ALL visible metrics and data fields. Return a comprehensive JSON object with the following structure:

{
  "scan_date": "YYYY-MM-DD",
  "test_time": "HH:MM",

  // Personal Information
  "user_height": number,
  "user_height_unit": "in" or "cm" or "ft",
  "user_age": number,
  "user_gender": "male" or "female",

  // Body Composition Analysis (Análisis de la Composición Corporal)
  "weight": { "value": number, "unit": "kg" or "lbs" },
  "total_body_water": { "value": number, "unit": "L" },
  "protein": { "value": number, "unit": "kg" or "lbs" },
  "mineral": { "value": number, "unit": "kg" or "lbs" },
  "body_fat_mass": { "value": number, "unit": "kg" or "lbs" },

  // Muscle-Fat Analysis (Análisis Músculo-Grasa)
  "skeletal_muscle_mass": { "value": number, "unit": "kg" or "lbs" },

  // Obesity Analysis (Análisis de Obesidad)
  "bmi": number,
  "body_fat_percentage": number,

  // Segmental Lean Analysis (Análisis de Magro por Segmentos)
  "segmental_lean": {
    "right_arm": { "mass": number, "percentage": number, "evaluation": "Normal" or "Low" or "High" },
    "left_arm": { "mass": number, "percentage": number, "evaluation": string },
    "trunk": { "mass": number, "percentage": number, "evaluation": string },
    "right_leg": { "mass": number, "percentage": number, "evaluation": string },
    "left_leg": { "mass": number, "percentage": number, "evaluation": string }
  },

  // Segmental Fat Analysis (Análisis de Grasa Segmental)
  "segmental_fat": {
    "right_arm": { "mass": number, "percentage": number, "evaluation": string },
    "left_arm": { "mass": number, "percentage": number, "evaluation": string },
    "trunk": { "mass": number, "percentage": number, "evaluation": string },
    "right_leg": { "mass": number, "percentage": number, "evaluation": string },
    "left_leg": { "mass": number, "percentage": number, "evaluation": string }
  },

  // InBody Score & Weight Control
  "inbody_score": number,
  "target_weight": number,
  "weight_control": number,
  "fat_control": number,
  "muscle_control": number,

  // Obesity Evaluation (Evaluación de Obesidad)
  "bmc_evaluation": "Normal" or "Low" or "High",
  "pgc_evaluation": "Normal" or "Slightly High" or "High",

  // Body Balance (Evaluación del Equilibrio Corporal)
  "upper_lower_balance": string,
  "left_right_balance": string,

  // Additional Metrics
  "waist_hip_ratio": number,
  "visceral_fat_level": number,

  // Research Parameters (Parámetros de Investigación)
  "fat_free_mass": number,
  "basal_metabolic_rate": number,
  "obesity_degree": number,
  "recommended_calorie_intake": number,

  // Advanced (if present)
  "intracellular_water": { "value": number, "unit": "L" },
  "extracellular_water": { "value": number, "unit": "L" },
  "ecw_ratio": number,
  "phase_angle": number or null,

  // Impedance data (if visible)
  "impedance_data": {
    "z_20hz": { "dd": number, "bi": number, "tr": number, "pd": number, "pi": number },
    "z_100hz": { "dd": number, "bi": number, "tr": number, "pd": number, "pi": number }
  }
}

CRITICAL EXTRACTION INSTRUCTIONS:
1. Extract EVERY visible data point from the scan - don't skip anything
2. Pay careful attention to Spanish labels (Análisis, Músculo, Grasa, etc.)
3. For segmental analysis, extract BOTH lean AND fat sections
4. Extract weight control targets (Control de peso section)
5. Extract research parameters (Parámetros de Investigación)
6. Extract impedance table values if present (bottom of scan)
7. Extract evaluations (Normal, Bajo, Alto, etc.) for each segment
8. Be precise with decimal values
9. Return ONLY valid JSON, no other text or explanation
10. If any field is not visible, set it to null - but try to find everything first
11. Units matter: carefully note if values are in kg/lbs, cm/in, etc.
12. For body balance, extract the text descriptions (e.g., "Ligeramente Desequilibrado")

Extract ALL data now:`;

export async function extractScanData(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<{
  data: ExtractedScanData | null;
  confidence: number;
  error?: string;
}> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        data: null,
        confidence: 0,
        error: 'Anthropic API key not configured',
      };
    }

    console.log(`🤖 Processing file: ${fileName}, type: ${mimeType}`);
    console.log(`🔑 API Key present: ${!!process.env.ANTHROPIC_API_KEY}`);

    // Convert buffer to base64
    const base64 = fileBuffer.toString('base64');
    
    let response;

    try {
      // Models that support both images and PDFs (in order of preference)
      // Based on Anthropic documentation, these models support multimodal (images + PDFs):
      const modelsToTry = [
        'claude-3-7-sonnet-20250219',      // Latest Sonnet 3.7 (best for PDFs + images)
        'claude-3-5-sonnet-20241022',      // Sonnet 3.5 (excellent for PDFs + images)
        'claude-3-5-sonnet-20240620',      // Earlier Sonnet 3.5 version
        'claude-3-opus-20240229',          // Claude 3 Opus (most capable)
        'claude-3-sonnet-20240229',        // Claude 3 Sonnet (original)
        'claude-3-haiku-20240307',         // Claude 3 Haiku (fast, supports images, limited PDF support)
      ];
      
      const imageMediaType = mimeType === 'image/png' ? 'image/png' :
                             mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'image/jpeg' :
                             mimeType === 'image/gif' ? 'image/gif' : 'image/jpeg';
      
      let lastError: any = null;
      let modelUsed: string | null = null;
      
      // Try each model until one works
      for (const model of modelsToTry) {
        try {
          if (mimeType === 'application/pdf') {
            // PDFs require beta Messages API with document type
            console.log(`📄 Trying ${model} for PDF analysis...`);
            response = await anthropic.beta.messages.create({
              model: model,
              max_tokens: 4000,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'document',
                      source: {
                        type: 'base64',
                        media_type: 'application/pdf',
                        data: base64,
                      },
                    },
                    {
                      type: 'text',
                      text: EXTRACTION_PROMPT,
                    },
                  ],
                },
              ],
            });
            modelUsed = model;
            console.log(`✅ Successfully using ${model} for PDF analysis`);
            break;
          } else {
            // Images use regular Messages API
            console.log(`🖼️ Trying ${model} for image analysis (${imageMediaType})...`);
            response = await anthropic.messages.create({
              model: model,
              max_tokens: 4000,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: imageMediaType,
                        data: base64,
                      },
                    },
                    {
                      type: 'text',
                      text: EXTRACTION_PROMPT,
                    },
                  ],
                },
              ],
            });
            modelUsed = model;
            console.log(`✅ Successfully using ${model} for image analysis`);
            break;
          }
        } catch (modelError: any) {
          // If model not found (404), try next model
          if (modelError?.status === 404 && modelError?.error?.error?.message?.includes('model')) {
            console.warn(`⚠️ ${model} not available, trying next model...`);
            lastError = modelError;
            continue; // Try next model
          }
          // For other errors (auth, rate limit, etc.), throw immediately
          throw modelError;
        }
      }
      
      // If no model worked, throw helpful error
      if (!response || !modelUsed) {
        const availableModels = modelsToTry.join(', ');
        throw new Error(
          `None of the available models support ${mimeType === 'application/pdf' ? 'PDF' : 'image'} processing on your account. ` +
          `Tried: ${availableModels}. ` +
          `Please check your Anthropic API access level or convert PDFs to images (JPG/PNG) for processing.`
        );
      }
    } catch (apiError: any) {
      console.error('❌ Claude API call failed:', {
        message: apiError?.message,
        status: apiError?.status,
        error: apiError?.error,
        type: apiError?.type,
        fullError: apiError,
      });
      throw apiError; // Re-throw to be caught by outer catch
    }

    console.log('✅ Claude API response received');

    // Extract JSON from response
    const content = response.content[0];
    if (content.type !== 'text') {
      return {
        data: null,
        confidence: 0,
        error: 'Unexpected response format from AI',
      };
    }

    // Parse JSON - handle potential markdown code blocks
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const extractedData = JSON.parse(jsonText) as ExtractedScanData;

    // Calculate confidence based on how many fields were extracted
    const totalFields = 14; // Number of core fields we're looking for
    let extractedFields = 0;

    if (extractedData.weight?.value) extractedFields++;
    if (extractedData.skeletal_muscle_mass?.value) extractedFields++;
    if (extractedData.body_fat_mass?.value) extractedFields++;
    if (extractedData.body_fat_percentage) extractedFields++;
    if (extractedData.bmi) extractedFields++;
    if (extractedData.total_body_water?.value) extractedFields++;
    if (extractedData.intracellular_water?.value) extractedFields++;
    if (extractedData.extracellular_water?.value) extractedFields++;
    if (extractedData.ecw_ratio) extractedFields++;
    if (extractedData.segmental_lean) extractedFields++;
    if (extractedData.basal_metabolic_rate) extractedFields++;
    if (extractedData.visceral_fat_level) extractedFields++;
    if (extractedData.inbody_score) extractedFields++;
    if (extractedData.phase_angle) extractedFields++;

    const confidence = Math.round((extractedFields / totalFields) * 100);

    return {
      data: extractedData,
      confidence,
    };
  } catch (error) {
    console.error('❌ Error extracting scan data:', error);
    
    // Provide more detailed error information
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
    
    return {
      data: null,
      confidence: 0,
      error: errorMessage,
    };
  }
}

// Helper to convert file to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

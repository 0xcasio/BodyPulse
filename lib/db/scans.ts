import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ExtractedScanData } from '@/types/scan';

/**
 * Upload scan image to Supabase Storage
 */
export async function uploadScanImage(file: File, userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, image not uploaded');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    // Store files in user_id folder: {user_id}/{timestamp}.{ext}
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('scan-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('scan-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

/**
 * Convert base64 image to File object (client-side)
 */
export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  if (typeof window === 'undefined') {
    throw new Error('base64ToFile can only be called on the client side');
  }
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], filename, { type: mimeType });
}

/**
 * Save scan with image upload
 */
export async function saveScanWithImage(
  extracted: ExtractedScanData,
  imageFile: File | string, // File object or base64 string
  confidence: number,
  userId?: string
): Promise<{ scanId: string | null; imageUrl: string | null }> {
  if (!isSupabaseConfigured()) {
    // Fallback: return null but don't error
    return { scanId: null, imageUrl: null };
  }

  try {
    // Get authenticated user ID
    const { getCurrentUserId } = await import('./queries');
    const finalUserId = userId || await getCurrentUserId();
    if (!finalUserId) {
      return { scanId: null, imageUrl: null };
    }
    
    // Handle image upload
    let imageUrl: string | null = null;
    if (typeof imageFile === 'string') {
      // Base64 string - convert to File first
      const file = base64ToFile(imageFile, 'scan.jpg', 'image/jpeg');
      imageUrl = await uploadScanImage(file, finalUserId);
    } else {
      // File object
      imageUrl = await uploadScanImage(imageFile, finalUserId);
    }

    // Import saveScan dynamically to avoid circular dependencies
    const { saveScan } = await import('./queries');
    const scan = await saveScan(extracted, imageUrl || '', confidence, finalUserId);

    return {
      scanId: scan?.id || null,
      imageUrl,
    };
  } catch (error) {
    console.error('Error saving scan with image:', error);
    return { scanId: null, imageUrl: null };
  }
}


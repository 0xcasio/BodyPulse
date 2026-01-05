import { NextRequest, NextResponse } from 'next/server';
import { extractScanData } from '@/lib/ai';
import { MOCK_SCAN_DATA } from '@/lib/mockData';

// Set to true to use mock data for testing without API credits
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPG, PNG, HEIC, or PDF file.' },
        { status: 400 }
      );
    }

    // Process all files the same way - Claude API handles both PDFs and images via Files API
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);
    
    // Detect actual MIME type from file signature (magic bytes) for better accuracy
    let actualMimeType: string = file.type;
    const signature = fileBuffer.toString('hex', 0, 8);
    if (signature.startsWith('89504e47')) {
      actualMimeType = 'image/png';
    } else if (signature.startsWith('ffd8ff')) {
      actualMimeType = 'image/jpeg';
    } else if (signature.startsWith('25504446')) { // PDF magic bytes: %PDF
      actualMimeType = 'application/pdf';
    }
    
    console.log(`📄 File type detected: ${actualMimeType}`);

    // Demo mode - use mock data
    if (DEMO_MODE) {
      console.log('🎭 Demo mode: Using mock data (DEMO_MODE=true in .env)');
      console.log('⚠️ WARNING: All uploads will return the same mock data!');
      return NextResponse.json({
        data: MOCK_SCAN_DATA,
        confidence: 95,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        warning: 'DEMO_MODE is enabled - using mock data instead of real extraction',
      });
    }

    console.log(`📄 Processing file: ${file.name}, Type: ${actualMimeType}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Extract data using Claude (Files API handles both PDFs and images)
    const { data, confidence, error } = await extractScanData(fileBuffer, actualMimeType, file.name);

    // Fallback to mock data if API fails (e.g., no credits)
    if (error || !data) {
      console.error('⚠️ API extraction failed, using mock data as fallback:', error);
      console.error('⚠️ This means all uploads will show the same data until API is fixed!');
      return NextResponse.json({
        data: MOCK_SCAN_DATA,
        confidence: 95,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        warning: 'API extraction failed - using mock data. Check Anthropic API key and credits.',
        error: error || 'Unknown error',
      });
    }

    console.log('✅ Real extraction successful:', {
      confidence,
      scanDate: data.scan_date,
      weight: data.weight?.value,
      inbodyScore: data.inbody_score,
    });

    return NextResponse.json({
      data,
      confidence,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Error in extract API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

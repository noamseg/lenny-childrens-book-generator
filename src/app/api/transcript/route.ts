import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateTranscript } from '@/lib/transcript';
import { ApiResponse, TranscriptUploadResponse } from '@/types';

// Request validation schema
const transcriptRequestSchema = z.object({
  type: z.enum(['file', 'url', 'text']),
  content: z.string().min(1, 'Content is required'),
  fileName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = transcriptRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: parseResult.error.flatten(),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { type, content } = parseResult.data;

    let transcriptContent = content;

    // Handle URL fetching (if enabled)
    if (type === 'url') {
      // For MVP, URL fetching is disabled
      // In production, you'd fetch the content from the URL
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'URL fetching is not yet supported',
        },
      };
      return NextResponse.json(response, { status: 501 });
    }

    // Validate the transcript content
    const validationResult = validateTranscript(transcriptContent);

    const response: ApiResponse<TranscriptUploadResponse> = {
      success: true,
      data: {
        validationResult,
        transcriptId: validationResult.isValid
          ? `transcript_${Date.now()}`
          : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transcript processing error:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process transcript',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

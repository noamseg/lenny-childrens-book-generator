import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateStory } from '@/lib/anthropic';
import { ApiResponse, GenerateStoryResponse } from '@/types';
import { generateId } from '@/lib/utils';

// Request validation schema
const generateStorySchema = z.object({
  childName: z.string().min(1, 'Child name is required').max(50),
  childAge: z.number().min(1).max(12).optional(),
  theme: z.string().max(100).optional(),
  transcriptContent: z.string().min(100, 'Transcript must be at least 100 characters'),
  additionalContext: z.string().optional(),
  pageCount: z.number().min(5).max(15).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = generateStorySchema.safeParse(body);
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

    const {
      childName,
      childAge,
      theme,
      transcriptContent,
      additionalContext,
      pageCount,
    } = parseResult.data;

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Anthropic API key not configured',
        },
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Generate the story
    const story = await generateStory({
      childName,
      childAge,
      theme,
      transcriptContent,
      additionalContext,
      pageCount,
    });

    const bookId = generateId();

    const response: ApiResponse<GenerateStoryResponse> = {
      success: true,
      data: {
        story,
        bookId,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Story generation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate story';

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: errorMessage,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

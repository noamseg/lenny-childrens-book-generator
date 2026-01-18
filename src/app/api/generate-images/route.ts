import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBookImages, configureFalClient } from '@/lib/fal';
import { ApiResponse, GenerateImagesResponse, IllustrationStyle } from '@/types';

// Request validation schema
const generateImagesSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  pages: z.array(
    z.object({
      pageNumber: z.number().min(1),
      imagePrompt: z.string().min(1),
    })
  ).min(1, 'At least one page is required'),
  style: z.enum(['watercolor', 'cartoon', 'storybook', 'whimsical', 'minimalist']),
  childName: z.string().min(1),
  characterDescriptions: z.object({
    mainCharacter: z.string(),
    sidekick: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = generateImagesSchema.safeParse(body);
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

    const { bookId, pages, style, characterDescriptions } = parseResult.data;

    // Check for API key
    if (!process.env.FAL_KEY) {
      // Return placeholder images if no API key (for development)
      const placeholderImages = pages.map((page) => ({
        pageNumber: page.pageNumber,
        imageUrl: `https://placehold.co/1920x1080/E8D5B7/333333?text=Page+${page.pageNumber}`,
      }));

      const response: ApiResponse<GenerateImagesResponse> = {
        success: true,
        data: {
          bookId,
          images: placeholderImages,
        },
      };

      return NextResponse.json(response);
    }

    // Configure fal.ai client
    configureFalClient();

    // Generate images with character consistency
    // The fal.ts module handles:
    // 1. Generating a character reference image from characterDescriptions
    // 2. Using that reference for consistent character appearance in each page
    const images = await generateBookImages(
      pages,
      style as IllustrationStyle,
      characterDescriptions
    );

    const response: ApiResponse<GenerateImagesResponse> = {
      success: true,
      data: {
        bookId,
        images,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Image generation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate images';

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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBookImages } from '@/lib/stability';
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

    const { bookId, pages, style, childName, characterDescriptions } = parseResult.data;

    // Check for API key
    if (!process.env.STABILITY_API_KEY) {
      // Return placeholder images if no API key (for development)
      const placeholderImages = pages.map((page) => ({
        pageNumber: page.pageNumber,
        imageUrl: `https://placehold.co/1024x1024/E8D5B7/333333?text=Page+${page.pageNumber}`,
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

    // Generate images
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

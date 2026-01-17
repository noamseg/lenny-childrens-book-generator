import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBookPdf } from '@/lib/pdf';
import { ApiResponse, Book } from '@/types';

// Request validation schema
const generatePdfSchema = z.object({
  book: z.object({
    id: z.string(),
    childName: z.string(),
    childAge: z.number().optional(),
    theme: z.string().optional(),
    illustrationStyle: z.enum(['watercolor', 'cartoon', 'storybook', 'whimsical', 'minimalist']),
    pages: z.array(
      z.object({
        pageNumber: z.number(),
        text: z.string(),
        imageUrl: z.string().optional(),
        imagePrompt: z.string(),
        isLoading: z.boolean().optional(),
      })
    ),
    coverImageUrl: z.string().optional(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = generatePdfSchema.safeParse(body);
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

    const { book: bookData } = parseResult.data;

    // Convert date strings to Date objects
    const book: Book = {
      ...bookData,
      createdAt: new Date(bookData.createdAt),
      updatedAt: new Date(bookData.updatedAt),
    };

    // Generate PDF
    const pdfBlob = await generateBookPdf(book);

    // Return as downloadable file
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'text/html', // For now, returning HTML (see pdf.ts)
        'Content-Disposition': `attachment; filename="${book.childName.replace(/[^a-zA-Z0-9]/g, '-')}-storybook.html"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate PDF';

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

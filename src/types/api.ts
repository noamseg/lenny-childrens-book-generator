import { Book, BookGenerationProgress, IllustrationStyle, StoryGenerationResult } from './book';
import { TranscriptValidationResult } from './transcript';

// Base API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Transcript API
export interface TranscriptUploadRequest {
  type: 'file' | 'url' | 'text';
  content: string;
  fileName?: string;
}

export interface TranscriptUploadResponse {
  validationResult: TranscriptValidationResult;
  transcriptId?: string;
}

// Story Generation API
export interface GenerateStoryRequest {
  childName: string;
  childAge?: number;
  theme?: string;
  transcriptContent: string;
  additionalContext?: string;
  pageCount?: number;
}

export interface GenerateStoryResponse {
  story: StoryGenerationResult;
  bookId: string;
}

// Image Generation API
export interface GenerateImagesRequest {
  bookId: string;
  pages: Array<{
    pageNumber: number;
    imagePrompt: string;
  }>;
  style: IllustrationStyle;
  childName: string;
}

export interface GenerateImagesResponse {
  bookId: string;
  images: Array<{
    pageNumber: number;
    imageUrl: string;
  }>;
}

// PDF Generation API
export interface GeneratePdfRequest {
  book: Book;
}

export interface GeneratePdfResponse {
  pdfUrl: string;
  downloadUrl: string;
}

// Streaming response types
export interface StreamingStoryChunk {
  type: 'progress' | 'page' | 'complete' | 'error';
  progress?: BookGenerationProgress;
  page?: {
    pageNumber: number;
    text: string;
    imagePrompt: string;
  };
  error?: string;
}

export interface StreamingImageChunk {
  type: 'progress' | 'image' | 'complete' | 'error';
  pageNumber?: number;
  imageUrl?: string;
  progress?: {
    completed: number;
    total: number;
  };
  error?: string;
}

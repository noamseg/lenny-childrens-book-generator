export interface Book {
  id: string;
  childName: string;
  childAge?: number;
  theme?: string;
  illustrationStyle: IllustrationStyle;
  pages: Page[];
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  imagePrompt: string;
  isLoading?: boolean;
}

export interface BookGenerationRequest {
  childName: string;
  childAge?: number;
  theme?: string;
  illustrationStyle: IllustrationStyle;
  transcriptContent: string;
  additionalContext?: string;
}

export interface BookGenerationProgress {
  status: GenerationStatus;
  currentStep: GenerationStep;
  totalSteps: number;
  currentPage?: number;
  totalPages?: number;
  message: string;
}

export type GenerationStatus = 'idle' | 'processing' | 'completed' | 'error';

export type GenerationStep =
  | 'validating'
  | 'generating-story'
  | 'generating-images'
  | 'compiling-pdf'
  | 'done';

export type IllustrationStyle =
  | 'watercolor'
  | 'cartoon'
  | 'storybook'
  | 'whimsical'
  | 'minimalist';

export interface StoryGenerationResult {
  title: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
}

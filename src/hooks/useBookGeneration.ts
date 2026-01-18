'use client';

import { useState, useCallback } from 'react';
import {
  Book,
  BookGenerationProgress,
  CharacterDescriptions,
  GenerationStatus,
  GenerationStep,
  IllustrationStyle,
  Page,
} from '@/types';
import { generateId } from '@/lib/utils';

interface UseBookGenerationOptions {
  onProgress?: (progress: BookGenerationProgress) => void;
  onComplete?: (book: Book) => void;
  onError?: (error: Error) => void;
}

interface GenerateBookParams {
  childName: string;
  childAge?: number;
  theme?: string;
  illustrationStyle: IllustrationStyle;
  transcriptContent: string;
  additionalContext?: string;
  // Episode content for richer story generation
  guestName?: string;
  coreLessons?: string[];
  memorableStories?: string[];
  quotableMoments?: string[];
}

export function useBookGeneration(options: UseBookGenerationOptions = {}) {
  const { onProgress, onComplete, onError } = options;

  const [book, setBook] = useState<Book | null>(null);
  const [progress, setProgress] = useState<BookGenerationProgress>({
    status: 'idle',
    currentStep: 'validating',
    totalSteps: 4,
    message: '',
  });
  const [error, setError] = useState<Error | null>(null);

  const updateProgress = useCallback(
    (
      status: GenerationStatus,
      step: GenerationStep,
      message: string,
      currentPage?: number,
      totalPages?: number
    ) => {
      const newProgress: BookGenerationProgress = {
        status,
        currentStep: step,
        totalSteps: 4,
        currentPage,
        totalPages,
        message,
      };
      setProgress(newProgress);
      onProgress?.(newProgress);
    },
    [onProgress]
  );

  const generateBook = useCallback(
    async (params: GenerateBookParams) => {
      const {
        childName,
        childAge,
        theme,
        illustrationStyle,
        transcriptContent,
        additionalContext,
        guestName,
        coreLessons,
        memorableStories,
        quotableMoments,
      } = params;

      setError(null);
      const bookId = generateId();

      try {
        // Step 1: Validate transcript
        updateProgress('processing', 'validating', 'Validating your transcript...');

        const validateResponse = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'text',
            content: transcriptContent,
          }),
        });

        if (!validateResponse.ok) {
          throw new Error('Failed to validate transcript');
        }

        // Step 2: Generate story
        updateProgress('processing', 'generating-story', 'Creating your magical story...');

        const storyResponse = await fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childName,
            childAge,
            theme,
            transcriptContent,
            additionalContext,
            pageCount: 10,
            guestName,
            coreLessons,
            memorableStories,
            quotableMoments,
          }),
        });

        if (!storyResponse.ok) {
          throw new Error('Failed to generate story');
        }

        const storyData = await storyResponse.json();
        const { story } = storyData.data;

        // Extract character descriptions for consistent illustration generation
        const characterDescriptions: CharacterDescriptions | undefined = story.characterDescriptions;

        // Create initial book structure
        const pages: Page[] = story.pages.map(
          (p: { pageNumber: number; text: string; imagePrompt: string }) => ({
            pageNumber: p.pageNumber,
            text: p.text,
            imageUrl: undefined,
            imagePrompt: p.imagePrompt,
            isLoading: true,
          })
        );

        const initialBook: Book = {
          id: bookId,
          childName,
          childAge,
          theme,
          illustrationStyle,
          pages,
          characterDescriptions,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setBook(initialBook);

        // Step 3: Generate images
        updateProgress(
          'processing',
          'generating-images',
          'Creating beautiful illustrations...',
          0,
          pages.length
        );

        const imagesResponse = await fetch('/api/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId,
            pages: pages.map((p) => ({
              pageNumber: p.pageNumber,
              imagePrompt: p.imagePrompt,
            })),
            style: illustrationStyle,
            childName,
            characterDescriptions,
          }),
        });

        if (!imagesResponse.ok) {
          throw new Error('Failed to generate images');
        }

        const imagesData = await imagesResponse.json();
        const { images } = imagesData.data;

        // Update book with generated images
        const updatedPages = pages.map((page) => {
          const imageData = images.find(
            (img: { pageNumber: number; imageUrl: string }) =>
              img.pageNumber === page.pageNumber
          );
          return {
            ...page,
            imageUrl: imageData?.imageUrl,
            isLoading: false,
          };
        });

        const completedBook: Book = {
          ...initialBook,
          pages: updatedPages,
          updatedAt: new Date(),
        };

        setBook(completedBook);

        // Step 4: Done
        updateProgress('completed', 'done', 'Your book is ready!');
        onComplete?.(completedBook);

        return completedBook;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        updateProgress('error', progress.currentStep, error.message);
        onError?.(error);
        throw error;
      }
    },
    [updateProgress, onComplete, onError, progress.currentStep]
  );

  const updatePage = useCallback((pageNumber: number, updates: Partial<Page>) => {
    setBook((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pages: prev.pages.map((page) =>
          page.pageNumber === pageNumber ? { ...page, ...updates } : page
        ),
        updatedAt: new Date(),
      };
    });
  }, []);

  const regenerateImage = useCallback(
    async (pageNumber: number) => {
      if (!book) return;

      const page = book.pages.find((p) => p.pageNumber === pageNumber);
      if (!page) return;

      // Set loading state
      updatePage(pageNumber, { isLoading: true });

      try {
        const response = await fetch('/api/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: book.id,
            pages: [{ pageNumber, imagePrompt: page.imagePrompt }],
            style: book.illustrationStyle,
            childName: book.childName,
            characterDescriptions: book.characterDescriptions,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to regenerate image');
        }

        const data = await response.json();
        const imageData = data.data.images[0];

        updatePage(pageNumber, {
          imageUrl: imageData.imageUrl,
          isLoading: false,
        });
      } catch (err) {
        updatePage(pageNumber, { isLoading: false });
        throw err;
      }
    },
    [book, updatePage]
  );

  const reset = useCallback(() => {
    setBook(null);
    setProgress({
      status: 'idle',
      currentStep: 'validating',
      totalSteps: 4,
      message: '',
    });
    setError(null);
  }, []);

  return {
    book,
    progress,
    error,
    isGenerating: progress.status === 'processing',
    isComplete: progress.status === 'completed',
    generateBook,
    updatePage,
    regenerateImage,
    reset,
  };
}

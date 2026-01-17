'use client';

import { useState, useCallback } from 'react';
import {
  TranscriptUploadState,
  TranscriptValidationResult,
  ParsedTranscript,
} from '@/types';
import {
  validateTranscript,
  parseTranscript,
  readTranscriptFile,
} from '@/lib/transcript';

export function useTranscript() {
  const [state, setState] = useState<TranscriptUploadState>({
    isUploading: false,
    isValidating: false,
  });

  const updateState = useCallback((updates: Partial<TranscriptUploadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      updateState({
        isUploading: true,
        file,
        error: undefined,
        validationResult: undefined,
        parsedTranscript: undefined,
      });

      try {
        // Read file content
        const content = await readTranscriptFile(file);

        // Validate content
        updateState({ isUploading: false, isValidating: true, rawText: content });

        const validationResult = validateTranscript(content);
        let parsedTranscript: ParsedTranscript | undefined;

        if (validationResult.isValid && validationResult.content) {
          parsedTranscript = parseTranscript(validationResult.content);
        }

        updateState({
          isValidating: false,
          validationResult,
          parsedTranscript,
        });

        return { validationResult, parsedTranscript };
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to upload file';
        updateState({
          isUploading: false,
          isValidating: false,
          error,
        });
        throw new Error(error);
      }
    },
    [updateState]
  );

  const submitText = useCallback(
    async (text: string) => {
      updateState({
        isValidating: true,
        rawText: text,
        error: undefined,
        validationResult: undefined,
        parsedTranscript: undefined,
      });

      try {
        const validationResult = validateTranscript(text);
        let parsedTranscript: ParsedTranscript | undefined;

        if (validationResult.isValid && validationResult.content) {
          parsedTranscript = parseTranscript(validationResult.content);
        }

        updateState({
          isValidating: false,
          validationResult,
          parsedTranscript,
        });

        return { validationResult, parsedTranscript };
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to validate text';
        updateState({
          isValidating: false,
          error,
        });
        throw new Error(error);
      }
    },
    [updateState]
  );

  const fetchFromUrl = useCallback(
    async (url: string) => {
      updateState({
        isUploading: true,
        url,
        error: undefined,
        validationResult: undefined,
        parsedTranscript: undefined,
      });

      try {
        // Call our API to fetch and process the URL
        const response = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'url', content: url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transcript from URL');
        }

        const data = await response.json();
        const validationResult: TranscriptValidationResult =
          data.data.validationResult;

        let parsedTranscript: ParsedTranscript | undefined;
        if (validationResult.isValid && validationResult.content) {
          parsedTranscript = parseTranscript(validationResult.content);
        }

        updateState({
          isUploading: false,
          isValidating: false,
          rawText: validationResult.content,
          validationResult,
          parsedTranscript,
        });

        return { validationResult, parsedTranscript };
      } catch (err) {
        const error =
          err instanceof Error ? err.message : 'Failed to fetch transcript from URL';
        updateState({
          isUploading: false,
          isValidating: false,
          error,
        });
        throw new Error(error);
      }
    },
    [updateState]
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      isValidating: false,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    submitText,
    fetchFromUrl,
    reset,
    isLoading: state.isUploading || state.isValidating,
    hasValidTranscript:
      state.validationResult?.isValid === true &&
      Boolean(state.validationResult.content),
    transcriptContent: state.validationResult?.content || state.rawText,
  };
}

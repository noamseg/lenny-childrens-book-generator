export interface TranscriptInput {
  type: 'file' | 'url' | 'text';
  content: string;
  fileName?: string;
  url?: string;
}

export interface TranscriptValidationResult {
  isValid: boolean;
  content?: string;
  wordCount?: number;
  errors?: string[];
  warnings?: string[];
}

export interface ParsedTranscript {
  rawContent: string;
  cleanedContent: string;
  wordCount: number;
  estimatedDuration: number; // in minutes
  speakers?: string[];
  keyTopics?: string[];
}

export interface TranscriptUploadState {
  isUploading: boolean;
  isValidating: boolean;
  file?: File;
  url?: string;
  rawText?: string;
  validationResult?: TranscriptValidationResult;
  parsedTranscript?: ParsedTranscript;
  error?: string;
}

// Bulk Upload Types for Episode Import with AI Analysis

export type BulkUploadItemStatus = 'pending' | 'analyzing' | 'completed' | 'error' | 'imported' | 'skipped';

export interface TranscriptAnalysisResult {
  episodeNumber: number | null;
  title: string;
  description: string;
  featuredQuote: string;
  quoteTimestamp: string | null;
  topics: string[];
  estimatedDuration: string;
  guestName: string | null;
  guestTitle: string | null;
  guestCompany: string | null;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

export interface BulkUploadItem {
  id: string;
  fileName: string;
  status: BulkUploadItemStatus;
  transcriptContent: string;
  analysis: TranscriptAnalysisResult | null;
  error: string | null;
  matchedGuestId: string | null;
  createNewGuest: boolean;
}

// SSE Event Types
export interface SSEProgressEvent {
  type: 'progress';
  current: number;
  total: number;
  fileName: string;
}

export interface SSEItemCompleteEvent {
  type: 'item_complete';
  itemId: string;
  analysis: TranscriptAnalysisResult;
  matchedGuestId: string | null;
}

export interface SSEItemErrorEvent {
  type: 'item_error';
  itemId: string;
  error: string;
}

export interface SSEItemSkippedEvent {
  type: 'item_skipped';
  itemId: string;
  reason: string;
  episodeNumber: number;
}

export interface SSEAllCompleteEvent {
  type: 'all_complete';
  successful: number;
  failed: number;
  skipped: number;
}

export type SSEEvent = SSEProgressEvent | SSEItemCompleteEvent | SSEItemErrorEvent | SSEItemSkippedEvent | SSEAllCompleteEvent;

// API Request/Response Types
export interface AnalyzeRequest {
  items: Array<{
    id: string;
    fileName: string;
    content: string;
  }>;
}

export interface ImportItem {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  publishDate: string;
  duration: string;
  guestId: string | null;
  createNewGuest: boolean;
  newGuestData?: {
    name: string;
    title: string;
    company: string;
  };
  featuredQuote: string;
  quoteTimestamp: string;
  topics: string[];
  transcriptContent: string;
}

export interface ImportRequest {
  items: ImportItem[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{
    id: string;
    fileName: string;
    error: string;
  }>;
  createdEpisodeIds: string[];
  createdGuestIds: string[];
}

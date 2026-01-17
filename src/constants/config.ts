// Application configuration

export const APP_CONFIG = {
  // App info
  name: "Lenny's Children's Book Generator",
  shortName: "Lenny's Books",
  description: 'Transform podcast conversations into magical personalized children\'s books',

  // URLs
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Generation limits (per PRD)
  minTranscriptWords: 100,
  maxTranscriptWords: 12000, // PRD: "Not supporting transcripts longer than 12,000 words"
  maxTranscriptMinutes: 60, // PRD: "Not supporting transcripts longer than 60 minutes"
  defaultPageCount: 10,
  minPageCount: 5,
  maxPageCount: 15,

  // Character limits
  maxChildNameLength: 50,
  maxThemeLength: 100,
  maxPageTextLength: 300,

  // File upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB (for PDF files)
  allowedFileTypes: ['.txt', '.pdf', 'text/plain', 'application/pdf'],

  // API rate limits (for client-side throttling)
  imageGenerationDelay: 2000, // ms between image generation calls

  // Local storage keys
  storageKeys: {
    bookDraft: 'lenny-book-draft',
    recentBooks: 'lenny-recent-books',
    userPreferences: 'lenny-preferences',
  },

  // Feature flags
  features: {
    urlFetch: false, // URL transcript fetching (requires proxy)
    pdfDownload: true,
    shareLinks: true,
    imageRegeneration: true,
    textEditing: true,
  },
} as const;

// Age options for the form
export const AGE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} ${i === 0 ? 'year' : 'years'} old`,
}));

// API endpoints
export const API_ENDPOINTS = {
  transcript: '/api/transcript',
  generateStory: '/api/generate-story',
  generateImages: '/api/generate-images',
  generatePdf: '/api/generate-pdf',
} as const;

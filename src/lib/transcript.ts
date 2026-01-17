import { TranscriptValidationResult, ParsedTranscript } from '@/types';

const MIN_WORD_COUNT = 100;
const MAX_WORD_COUNT = 12000; // PRD: "Not supporting transcripts longer than 12,000 words for MVP"
const MAX_DURATION_MINUTES = 60; // PRD: "Not supporting transcripts longer than 60 minutes"
const AVERAGE_WORDS_PER_MINUTE = 150;

// Words and patterns that might indicate inappropriate content
const INAPPROPRIATE_PATTERNS = [
  /\b(explicit|violence|violent|gore|nsfw)\b/gi,
  /\b(curse|swear|profanity)\b/gi,
];

// Function to clean and normalize transcript text
export function cleanTranscript(rawText: string): string {
  return rawText
    // Remove timestamps like [00:00:00] or (00:00)
    .replace(/[\[\(]\d{1,2}:\d{2}(:\d{2})?[\]\)]/g, '')
    // Remove speaker labels like "Speaker 1:" or "John:"
    .replace(/^[A-Za-z\s]+:\s*/gm, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
}

// Validate transcript content
export function validateTranscript(content: string): TranscriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Clean the content first
  const cleanedContent = cleanTranscript(content);

  // Count words
  const words = cleanedContent.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Check minimum word count
  if (wordCount < MIN_WORD_COUNT) {
    errors.push(
      `Transcript too short. Minimum ${MIN_WORD_COUNT} words required, found ${wordCount}.`
    );
  }

  // Check maximum word count (PRD requirement)
  if (wordCount > MAX_WORD_COUNT) {
    errors.push(
      `Transcript too long. Maximum ${MAX_WORD_COUNT.toLocaleString()} words supported, found ${wordCount.toLocaleString()}. Please use a shorter segment.`
    );
  }

  // Check estimated duration (PRD: max 60 minutes)
  const estimatedMinutes = Math.round(wordCount / AVERAGE_WORDS_PER_MINUTE);
  if (estimatedMinutes > MAX_DURATION_MINUTES) {
    errors.push(
      `Transcript too long. Maximum ${MAX_DURATION_MINUTES} minutes of content supported (estimated ${estimatedMinutes} minutes). Please use a shorter segment.`
    );
  }

  // Check for inappropriate content patterns
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(cleanedContent)) {
      warnings.push(
        'Content may contain inappropriate material. Please ensure the transcript is child-friendly.'
      );
      break;
    }
  }

  // Check if content is mostly readable text
  const alphanumericRatio =
    cleanedContent.replace(/[^a-zA-Z0-9\s]/g, '').length / cleanedContent.length;
  if (alphanumericRatio < 0.7) {
    warnings.push(
      'Transcript contains unusual characters. This may affect story quality.'
    );
  }

  return {
    isValid: errors.length === 0,
    content: cleanedContent,
    wordCount,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// Parse and analyze transcript
export function parseTranscript(content: string): ParsedTranscript {
  const cleanedContent = cleanTranscript(content);
  const words = cleanedContent.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Estimate duration based on average speaking pace
  const estimatedDuration = Math.round(wordCount / AVERAGE_WORDS_PER_MINUTE);

  // Try to identify speakers (basic heuristic)
  const speakerMatches = content.match(/^([A-Z][a-z]+):/gm);
  const speakers = speakerMatches
    ? [...new Set(speakerMatches.map((s) => s.replace(':', '')))]
    : undefined;

  // Extract potential key topics (simple noun phrase extraction)
  const keyTopics = extractKeyTopics(cleanedContent);

  return {
    rawContent: content,
    cleanedContent,
    wordCount,
    estimatedDuration,
    speakers,
    keyTopics,
  };
}

// Simple key topic extraction
function extractKeyTopics(text: string): string[] {
  // This is a simplified version - in production, use NLP library
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'where', 'when', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once', 'about',
    'after', 'before', 'because', 'while', 'during', 'through', 'into',
  ]);

  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq: Record<string, number> = {};

  for (const word of words) {
    if (!commonWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// Read PDF file content
async function readPdfFile(file: File): Promise<string> {
  // Dynamic import for client-side PDF parsing
  const pdfjsLib = await import('pdfjs-dist');

  // Set the worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

// Read text file content
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Read file content (supports both TXT and PDF)
export async function readTranscriptFile(file: File): Promise<string> {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    return readPdfFile(file);
  }
  return readTextFile(file);
}

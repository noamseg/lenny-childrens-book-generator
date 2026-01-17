import { LennyGuest, LENNY_TOPICS } from '@/types/lenny';

// System prompt for bulk transcript analysis
export const BULK_ANALYSIS_SYSTEM_PROMPT = `You are an expert at analyzing Lenny's Podcast transcripts. Your job is to extract structured metadata from podcast episode transcripts to help populate an episode database.

For each transcript, you must extract:
1. Episode number (from filename pattern if provided)
2. A compelling title that captures the main topic
3. A 2-3 sentence description summarizing the episode
4. Guest information (name, title, company)
5. A memorable, shareable quote from the transcript
6. Topics that best categorize the episode
7. Duration estimate based on word count

TOPIC CATEGORIES (select 2-4 that best fit):
${LENNY_TOPICS.join(', ')}

IMPORTANT GUIDELINES:
- If information cannot be reliably extracted, use null
- For quotes, select something insightful, memorable, or actionable
- Titles should be compelling but accurate to the content
- Descriptions should help listeners decide if they want to listen
- Duration estimation: approximately 150 words = 1 minute of speech

You MUST respond with valid JSON only.`;

interface FormatAnalysisPromptParams {
  fileName: string;
  transcriptContent: string;
  existingGuests: LennyGuest[];
}

export function formatAnalysisPrompt(params: FormatAnalysisPromptParams): string {
  const { fileName, transcriptContent, existingGuests } = params;

  // Truncate transcript to ~12k words (roughly 80k characters) to stay within context limits
  const maxChars = 80000;
  const truncatedContent = transcriptContent.length > maxChars
    ? transcriptContent.slice(0, maxChars) + '\n\n[TRANSCRIPT TRUNCATED...]'
    : transcriptContent;

  // Format existing guests for matching
  const guestList = existingGuests.length > 0
    ? existingGuests.map(g => `- ${g.name} (${g.title} at ${g.company}) [ID: ${g.id}]`).join('\n')
    : 'No existing guests in database.';

  return `Analyze this Lenny's Podcast transcript and extract episode metadata.

FILENAME: ${fileName}
(Use this to extract episode number if present, e.g., "ep-123.txt" or "episode_45.txt")

EXISTING GUESTS (for matching):
${guestList}

TRANSCRIPT:
"""
${truncatedContent}
"""

Respond with a JSON object in this exact format:
{
  "episodeNumber": <number or null if not determinable from filename>,
  "title": "<compelling episode title based on main topic>",
  "description": "<2-3 sentence summary of episode content>",
  "featuredQuote": "<memorable/shareable quote from the transcript - include the speaker name if known>",
  "quoteTimestamp": null,
  "topics": ["<topic1>", "<topic2>", ...],
  "estimatedDuration": "<e.g., '1h 15m' based on word count>",
  "guestName": "<full name of guest or null>",
  "guestTitle": "<job title of guest or null>",
  "guestCompany": "<company name or null>",
  "matchedGuestId": "<ID from existing guests list if this matches an existing guest, otherwise null>",
  "confidence": "<'high' | 'medium' | 'low' based on quality of transcript>",
  "warnings": ["<any issues or notes about this transcript>"]
}

IMPORTANT:
- Only use topic values from the allowed list: ${LENNY_TOPICS.join(', ')}
- If the guest matches an existing guest, include their ID in matchedGuestId
- Set confidence to 'low' if the transcript is unclear or incomplete
- Add warnings for any potential issues (duplicate episode, unclear guest, etc.)`;
}

// Helper to estimate duration from word count
export function estimateDuration(wordCount: number): string {
  const minutes = Math.round(wordCount / 150);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

// Helper to count words in transcript
export function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Parse episode number from filename
export function parseEpisodeNumberFromFilename(fileName: string): number | null {
  // Try various patterns: ep-123, episode_123, 123.txt, EP123, etc.
  const patterns = [
    /ep[_-]?(\d+)/i,
    /episode[_-]?(\d+)/i,
    /^(\d+)\./,
    /[_-](\d+)\./,
  ];

  for (const pattern of patterns) {
    const match = fileName.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) return num;
    }
  }

  return null;
}

import { LennyGuest, LENNY_TOPICS } from '@/types/lenny';

// System prompt for bulk transcript analysis - optimized for children's book generation
export const BULK_ANALYSIS_SYSTEM_PROMPT = `You are an expert at analyzing Lenny's Podcast transcripts for a children's book generator. Your job is to extract episode metadata AND content that can be transformed into fun, educational children's books.

FILENAME PARSING (CRITICAL):
- Guest name comes from the filename: "Brian Chesky.txt" → Guest: Brian Chesky
- For two guests: "Alice Smith and Bob Jones.txt" → guestName: "Alice Smith and Bob Jones"
- The filename IS the authoritative source for guest names

TRANSCRIPT ANALYSIS:
1. Title - Compelling 5-10 word title capturing the main insight
2. Description - 2-3 sentence summary for episode selection
3. Guest enrichment - Find title, company, bio context FROM the transcript to enrich the guest info
4. Topics - 2-4 from: ${LENNY_TOPICS.join(', ')}
5. Featured quote - Best single quote for the episode card
6. Duration estimate - ~150 words = 1 minute

CHILDREN'S BOOK EXTRACTION (IMPORTANT):
7. Core Lessons (3-5) - Frameworks, mental models, principles that could become book themes
   Examples: "Talk to your customers before building", "Start with something people love, not just like"

8. Memorable Stories (2-4) - Anecdotes suitable for narrative children's book adaptation
   Examples: "Started Airbnb by renting air mattresses to pay rent", "Got rejected by every investor"

9. Quotable Moments (3-5) - Punchy quotes perfect for illustrations or callouts in kids' books
   Examples: "You can't delegate taste", "Move fast and break things"

IMPORTANT GUIDELINES:
- Guest name MUST come from filename, use transcript only to find title/company
- Make lessons actionable and simple enough for kids to understand
- Stories should have clear beginnings, middles, and potential endings
- Quotes should be memorable, short, and visually illustratable
- If information cannot be reliably extracted, use null or empty array

You MUST respond with valid JSON only.`;

interface FormatAnalysisPromptParams {
  fileName: string;
  transcriptContent: string;
  existingGuests: LennyGuest[];
}

// Helper to parse guest name from filename (e.g., "Brian Chesky.txt" → "Brian Chesky")
export function parseGuestNameFromFilename(fileName: string): string | null {
  // Remove extension
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  // Clean up and return if it looks like a name (has at least 2 characters)
  const cleaned = withoutExt.trim();
  return cleaned.length >= 2 ? cleaned : null;
}

export function formatAnalysisPrompt(params: FormatAnalysisPromptParams): string {
  const { fileName, transcriptContent, existingGuests } = params;

  // Parse guest name from filename
  const guestNameFromFilename = parseGuestNameFromFilename(fileName);

  // Truncate transcript to ~12k words (roughly 80k characters) to stay within context limits
  const maxChars = 80000;
  const truncatedContent = transcriptContent.length > maxChars
    ? transcriptContent.slice(0, maxChars) + '\n\n[TRANSCRIPT TRUNCATED...]'
    : transcriptContent;

  // Format existing guests for matching
  const guestList = existingGuests.length > 0
    ? existingGuests.map(g => `- ${g.name} (${g.title} at ${g.company}) [ID: ${g.id}]`).join('\n')
    : 'No existing guests in database.';

  return `Analyze this Lenny's Podcast transcript and extract episode metadata for children's book generation.

FILENAME: ${fileName}
GUEST NAME (from filename): ${guestNameFromFilename || 'Could not parse'}

EXISTING GUESTS (for matching by name):
${guestList}

TRANSCRIPT:
"""
${truncatedContent}
"""

Respond with a JSON object in this exact format:
{
  "title": "<compelling 5-10 word episode title based on main insight>",
  "description": "<2-3 sentence summary of episode content>",
  "featuredQuote": "<memorable/shareable quote from the transcript - include the speaker name if known>",
  "quoteTimestamp": null,
  "topics": ["<topic1>", "<topic2>", ...],
  "estimatedDuration": "<e.g., '1h 15m' based on word count>",
  "guestName": "${guestNameFromFilename || '<parse from transcript if filename unclear>'}",
  "guestTitle": "<job title found in transcript or null>",
  "guestCompany": "<company name found in transcript or null>",
  "matchedGuestId": "<ID from existing guests list if guest name matches, otherwise null>",
  "confidence": "<'high' | 'medium' | 'low' based on quality of transcript>",
  "warnings": ["<any issues or notes about this transcript>"],
  "coreLessons": [
    "<lesson 1: framework or mental model from the episode>",
    "<lesson 2: key principle or insight>",
    "<lesson 3: actionable takeaway>"
  ],
  "memorableStories": [
    "<story 1: brief description of an anecdote that could become a book narrative>",
    "<story 2: another compelling story from the episode>"
  ],
  "quotableMoments": [
    "<quote 1: punchy, memorable quote suitable for illustration>",
    "<quote 2: another quotable moment>",
    "<quote 3: another quotable moment>"
  ]
}

IMPORTANT:
- Guest name "${guestNameFromFilename}" comes from the filename - use this as the authoritative name
- Use the transcript to find guest's title and company to enrich the guest profile
- Only use topic values from the allowed list: ${LENNY_TOPICS.join(', ')}
- If the guest name matches an existing guest, include their ID in matchedGuestId
- coreLessons: Extract 3-5 key frameworks, mental models, or principles
- memorableStories: Extract 2-4 anecdotes that could become children's book narratives
- quotableMoments: Extract 3-5 punchy quotes suitable for illustrations
- Set confidence to 'low' if the transcript is unclear or incomplete`;
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

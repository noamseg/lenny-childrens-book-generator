import Anthropic from '@anthropic-ai/sdk';
import { verifyAuthFromRequest } from '@/lib/admin-auth';
import { getGuests, getEpisodes } from '@/lib/lenny-data';
import { AnalyzeRequest, TranscriptAnalysisResult, SSEEvent } from '@/types/bulk-upload';
import {
  BULK_ANALYSIS_SYSTEM_PROMPT,
  formatAnalysisPrompt,
  parseEpisodeNumberFromFilename,
} from '@/constants/bulk-analysis-prompts';

const anthropic = new Anthropic();

// Rate limit configuration - be conservative
const DELAY_BETWEEN_REQUESTS_MS = 3000; // 3 seconds between each request
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 5000; // 5 seconds initial retry delay

function createSSEMessage(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a rate limit error (429) or overloaded (529)
      const isRateLimitError =
        lastError.message.includes('429') ||
        lastError.message.includes('rate') ||
        lastError.message.includes('overloaded') ||
        lastError.message.includes('529');

      if (attempt < maxRetries && isRateLimitError) {
        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      } else if (!isRateLimitError) {
        // Non-rate-limit error, don't retry
        throw lastError;
      }
    }
  }

  throw lastError;
}

async function analyzeTranscript(
  fileName: string,
  content: string,
  existingGuests: Awaited<ReturnType<typeof getGuests>>
): Promise<{ analysis: TranscriptAnalysisResult; matchedGuestId: string | null }> {
  const prompt = formatAnalysisPrompt({
    fileName,
    transcriptContent: content,
    existingGuests,
  });

  const message = await withRetry(async () => {
    return anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: BULK_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
  });

  // Extract text content from the response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  // Parse the JSON response
  const responseText = textContent.text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse analysis response as JSON');
  }

  const analysisData = JSON.parse(jsonMatch[0]);

  // Extract matchedGuestId separately and validate it exists
  const existingGuestIds = new Set(existingGuests.map(g => g.id));
  const matchedGuestId = analysisData.matchedGuestId && existingGuestIds.has(analysisData.matchedGuestId)
    ? analysisData.matchedGuestId
    : null;

  // Use parsed episode number from filename if AI couldn't determine
  const episodeNumber = analysisData.episodeNumber ?? parseEpisodeNumberFromFilename(fileName);

  // Build the analysis result
  const analysis: TranscriptAnalysisResult = {
    episodeNumber,
    title: analysisData.title || 'Untitled Episode',
    description: analysisData.description || '',
    featuredQuote: analysisData.featuredQuote || '',
    quoteTimestamp: analysisData.quoteTimestamp || null,
    topics: Array.isArray(analysisData.topics) ? analysisData.topics : [],
    estimatedDuration: analysisData.estimatedDuration || '1h 0m',
    guestName: analysisData.guestName || null,
    guestTitle: analysisData.guestTitle || null,
    guestCompany: analysisData.guestCompany || null,
    confidence: analysisData.confidence || 'medium',
    warnings: Array.isArray(analysisData.warnings) ? analysisData.warnings : [],
  };

  return { analysis, matchedGuestId };
}

export async function POST(request: Request) {
  if (!verifyAuthFromRequest(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return new Response(JSON.stringify({ error: 'No items provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get existing guests for matching
  const existingGuests = await getGuests();

  // Get existing episodes for duplicate detection
  const existingEpisodes = await getEpisodes();
  const existingEpisodeNumbers = new Set(existingEpisodes.map(ep => ep.episodeNumber));

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      // Process items SEQUENTIALLY (one at a time) to avoid rate limits
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        const globalIndex = i + 1;

        // Send progress event
        const progressEvent: SSEEvent = {
          type: 'progress',
          current: globalIndex,
          total: body.items.length,
          fileName: item.fileName,
        };
        controller.enqueue(encoder.encode(createSSEMessage(progressEvent)));

        // Check for duplicates based on episode number from filename
        const episodeNumberFromFilename = parseEpisodeNumberFromFilename(item.fileName);
        if (episodeNumberFromFilename && existingEpisodeNumbers.has(episodeNumberFromFilename)) {
          skippedCount++;

          const skippedEvent: SSEEvent = {
            type: 'item_skipped',
            itemId: item.id,
            reason: `Episode #${episodeNumberFromFilename} already exists`,
            episodeNumber: episodeNumberFromFilename,
          };
          controller.enqueue(encoder.encode(createSSEMessage(skippedEvent)));

          // Small delay even for skipped items
          await sleep(100);
          continue;
        }

        try {
          const { analysis, matchedGuestId } = await analyzeTranscript(
            item.fileName,
            item.content,
            existingGuests
          );

          successCount++;

          // Track this episode number to prevent duplicates within same batch
          if (analysis.episodeNumber) {
            existingEpisodeNumbers.add(analysis.episodeNumber);
          }

          // Send item complete event
          const completeEvent: SSEEvent = {
            type: 'item_complete',
            itemId: item.id,
            analysis,
            matchedGuestId,
          };
          controller.enqueue(encoder.encode(createSSEMessage(completeEvent)));
        } catch (error) {
          errorCount++;
          console.error(`Error analyzing ${item.fileName}:`, error);

          // Send item error event
          const errorEvent: SSEEvent = {
            type: 'item_error',
            itemId: item.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorEvent)));
        }

        // Add delay between requests to avoid rate limiting (except for last item)
        if (i < body.items.length - 1) {
          await sleep(DELAY_BETWEEN_REQUESTS_MS);
        }
      }

      // Send all complete event
      const allCompleteEvent: SSEEvent = {
        type: 'all_complete',
        successful: successCount,
        failed: errorCount,
        skipped: skippedCount,
      };
      controller.enqueue(encoder.encode(createSSEMessage(allCompleteEvent)));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

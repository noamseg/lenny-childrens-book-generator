import Anthropic from '@anthropic-ai/sdk';
import { verifyAuthFromRequest } from '@/lib/admin-auth';
import { getGuests } from '@/lib/lenny-data';
import { AnalyzeRequest, TranscriptAnalysisResult, SSEEvent } from '@/types/bulk-upload';
import {
  BULK_ANALYSIS_SYSTEM_PROMPT,
  formatAnalysisPrompt,
  parseEpisodeNumberFromFilename,
} from '@/constants/bulk-analysis-prompts';

const anthropic = new Anthropic();

// Batch configuration
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 2000;

function createSSEMessage(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

async function analyzeTranscript(
  id: string,
  fileName: string,
  content: string,
  existingGuests: Awaited<ReturnType<typeof getGuests>>
): Promise<{ analysis: TranscriptAnalysisResult; matchedGuestId: string | null }> {
  const prompt = formatAnalysisPrompt({
    fileName,
    transcriptContent: content,
    existingGuests,
  });

  const message = await anthropic.messages.create({
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

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let successCount = 0;
      let errorCount = 0;

      // Process items in batches
      for (let i = 0; i < body.items.length; i += BATCH_SIZE) {
        const batch = body.items.slice(i, i + BATCH_SIZE);

        // Process batch items in parallel
        const batchPromises = batch.map(async (item, batchIndex) => {
          const globalIndex = i + batchIndex + 1;

          // Send progress event
          const progressEvent: SSEEvent = {
            type: 'progress',
            current: globalIndex,
            total: body.items.length,
            fileName: item.fileName,
          };
          controller.enqueue(encoder.encode(createSSEMessage(progressEvent)));

          try {
            const { analysis, matchedGuestId } = await analyzeTranscript(
              item.id,
              item.fileName,
              item.content,
              existingGuests
            );

            successCount++;

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
        });

        // Wait for all items in batch to complete
        await Promise.all(batchPromises);

        // Add delay between batches to avoid rate limiting (except for last batch)
        if (i + BATCH_SIZE < body.items.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      // Send all complete event
      const allCompleteEvent: SSEEvent = {
        type: 'all_complete',
        successful: successCount,
        failed: errorCount,
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

import { NextResponse } from 'next/server';
import { verifyAuthFromRequest } from '@/lib/admin-auth';
import { createEpisode, createGuest, getEpisodes } from '@/lib/lenny-data';
import { ImportRequest, ImportResult } from '@/types/bulk-upload';
import { CreateEpisodeInput, CreateGuestInput } from '@/types/lenny';

export async function POST(request: Request) {
  if (!verifyAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ImportRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 });
  }

  // Get existing episodes to check for duplicates
  const existingEpisodes = await getEpisodes();
  const existingEpisodeNumbers = new Set(existingEpisodes.map(ep => ep.episodeNumber));

  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    createdEpisodeIds: [],
    createdGuestIds: [],
  };

  // Process each item
  for (const item of body.items) {
    try {
      // Check for duplicate episode number
      if (existingEpisodeNumbers.has(item.episodeNumber)) {
        result.skipped++;
        result.errors.push({
          id: item.id,
          fileName: `Episode #${item.episodeNumber}`,
          error: `Episode #${item.episodeNumber} already exists`,
        });
        continue;
      }

      // Validate required fields
      if (!item.title) {
        result.errors.push({
          id: item.id,
          fileName: `Episode #${item.episodeNumber}`,
          error: 'Title is required',
        });
        continue;
      }

      let guestId = item.guestId;

      // Create new guest if needed
      if (item.createNewGuest && item.newGuestData) {
        const newGuestInput: CreateGuestInput = {
          name: item.newGuestData.name,
          title: item.newGuestData.title,
          company: item.newGuestData.company,
          bio: '', // Will need manual editing
          photoUrl: '', // Will need manual editing
        };

        const newGuest = await createGuest(newGuestInput);
        guestId = newGuest.id;
        result.createdGuestIds.push(newGuest.id);
      }

      // Ensure we have a guest ID
      if (!guestId) {
        result.errors.push({
          id: item.id,
          fileName: `Episode #${item.episodeNumber}`,
          error: 'No guest assigned',
        });
        continue;
      }

      // Create episode
      const episodeInput: CreateEpisodeInput = {
        episodeNumber: item.episodeNumber,
        title: item.title,
        description: item.description,
        publishDate: item.publishDate || new Date().toISOString().split('T')[0],
        duration: item.duration,
        guestId,
        featuredQuote: item.featuredQuote,
        quoteTimestamp: item.quoteTimestamp || '',
        topics: item.topics,
      };

      const episode = await createEpisode(episodeInput, item.transcriptContent);
      result.createdEpisodeIds.push(episode.id);
      result.imported++;

      // Add to existing set to prevent duplicates within same import
      existingEpisodeNumbers.add(item.episodeNumber);
    } catch (error) {
      console.error(`Error importing episode #${item.episodeNumber}:`, error);
      result.errors.push({
        id: item.id,
        fileName: `Episode #${item.episodeNumber}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json(result);
}

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

  // Get existing episodes to auto-generate episode numbers
  const existingEpisodes = await getEpisodes();
  // Find max episode number for auto-generation
  let maxEpisodeNumber = existingEpisodes.reduce(
    (max, ep) => Math.max(max, ep.episodeNumber || 0),
    0
  );
  // Track guest names for duplicate detection
  const existingGuestNames = new Set(
    existingEpisodes
      .filter(ep => ep.guest?.name)
      .map(ep => ep.guest!.name.toLowerCase())
  );

  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    createdEpisodeIds: [],
    createdGuestIds: [],
  };

  // Process each item
  for (const item of body.items) {
    // Determine guest name for duplicate checking and logging
    const guestName = item.newGuestData?.name ||
      (item.guestId ? existingEpisodes.find(ep => ep.guestId === item.guestId)?.guest?.name : null);

    try {
      // Check for duplicate by guest name
      if (guestName && existingGuestNames.has(guestName.toLowerCase())) {
        result.skipped++;
        result.errors.push({
          id: item.id,
          fileName: guestName,
          error: `Episode with guest "${guestName}" already exists`,
        });
        continue;
      }

      // Validate required fields
      if (!item.title) {
        result.errors.push({
          id: item.id,
          fileName: guestName || 'Unknown',
          error: 'Title is required',
        });
        continue;
      }

      let guestId: string | undefined = item.guestId || undefined;

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

      // Auto-generate episode number if not provided
      const episodeNumber = item.episodeNumber || ++maxEpisodeNumber;

      // Create episode with book content fields
      const episodeInput: CreateEpisodeInput = {
        episodeNumber,
        title: item.title,
        description: item.description,
        publishDate: item.publishDate || new Date().toISOString().split('T')[0],
        duration: item.duration,
        guestId,
        featuredQuote: item.featuredQuote,
        quoteTimestamp: item.quoteTimestamp || '',
        topics: item.topics,
        // Children's book content
        coreLessons: item.coreLessons,
        memorableStories: item.memorableStories,
        quotableMoments: item.quotableMoments,
      };

      const episode = await createEpisode(episodeInput, item.transcriptContent);
      result.createdEpisodeIds.push(episode.id);
      result.imported++;

      // Track guest name to prevent duplicates within same import
      if (guestName) {
        existingGuestNames.add(guestName.toLowerCase());
      }
    } catch (error) {
      console.error(`Error importing episode for guest "${guestName}":`, error);
      result.errors.push({
        id: item.id,
        fileName: guestName || 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json(result);
}

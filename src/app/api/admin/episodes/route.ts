import { NextResponse } from 'next/server';
import { verifyAuthFromRequest } from '@/lib/admin-auth';
import { getEpisodes, createEpisode } from '@/lib/lenny-data';

export async function GET(request: Request) {
  if (!verifyAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const episodes = await getEpisodes();
    return NextResponse.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!verifyAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { transcript, ...episodeData } = body;

    // Validate required fields
    if (!episodeData.title || !episodeData.guestId) {
      return NextResponse.json(
        { error: 'Title and guest are required' },
        { status: 400 }
      );
    }

    const episode = await createEpisode(episodeData, transcript);
    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    console.error('Error creating episode:', error);
    return NextResponse.json(
      { error: 'Failed to create episode' },
      { status: 500 }
    );
  }
}

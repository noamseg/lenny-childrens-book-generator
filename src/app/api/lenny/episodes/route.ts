import { NextResponse } from 'next/server';
import { getEpisodes, searchEpisodes, getEpisodesByTopic, getPopularEpisodes } from '@/lib/lenny-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const topic = searchParams.get('topic');
    const sort = searchParams.get('sort');
    const limit = searchParams.get('limit');

    let episodes;

    if (query) {
      episodes = await searchEpisodes(query);
    } else if (topic && topic !== 'All') {
      episodes = await getEpisodesByTopic(topic);
    } else if (sort === 'popular') {
      episodes = await getPopularEpisodes(limit ? parseInt(limit) : undefined);
    } else {
      episodes = await getEpisodes();
    }

    return NextResponse.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}

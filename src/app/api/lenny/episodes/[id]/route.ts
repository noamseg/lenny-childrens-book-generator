import { NextResponse } from 'next/server';
import { getEpisodeWithTranscript, incrementBooksGenerated } from '@/lib/lenny-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await getEpisodeWithTranscript(id);

    if (!result) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching episode:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episode' },
      { status: 500 }
    );
  }
}

// Increment books generated count when a book is created
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await incrementBooksGenerated(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing books count:', error);
    return NextResponse.json(
      { error: 'Failed to update count' },
      { status: 500 }
    );
  }
}

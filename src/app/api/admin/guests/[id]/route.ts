import { NextResponse } from 'next/server';
import { verifyAuthFromRequest } from '@/lib/admin-auth';
import { getGuest, updateGuest, deleteGuest } from '@/lib/lenny-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const guest = await getGuest(id);

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!verifyAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const guestData = await request.json();

    const guest = await updateGuest(id, guestData);

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { error: 'Failed to update guest' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!verifyAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteGuest(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { error: 'Failed to delete guest' },
      { status: 500 }
    );
  }
}

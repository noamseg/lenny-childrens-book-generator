import { NextResponse } from 'next/server';
import { verifyAuthFromRequest } from '@/lib/admin-auth';
import { getGuests, createGuest } from '@/lib/lenny-data';

export async function GET(request: Request) {
  // Allow GET without auth for episode form dropdown
  try {
    const guests = await getGuests();
    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!verifyAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const guestData = await request.json();

    // Validate required fields
    if (!guestData.name || !guestData.company) {
      return NextResponse.json(
        { error: 'Name and company are required' },
        { status: 400 }
      );
    }

    const guest = await createGuest(guestData);
    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { error: 'Failed to create guest' },
      { status: 500 }
    );
  }
}

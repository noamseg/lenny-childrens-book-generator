import { NextResponse } from 'next/server';
import { getGuests } from '@/lib/lenny-data';

export async function GET() {
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

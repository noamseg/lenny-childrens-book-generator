'use client';

import { useRef } from 'react';
import { LennyGuest } from '@/types/lenny';
import GuestCard from './GuestCard';

interface GuestGridProps {
  guests: LennyGuest[];
  selectedGuestId?: string;
  onGuestSelect: (guestId: string | undefined) => void;
}

export default function GuestGrid({ guests, selectedGuestId, onGuestSelect }: GuestGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (guests.length === 0) return null;

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Guest scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-12 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All guests option */}
        <button
          onClick={() => onGuestSelect(undefined)}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all min-w-[100px] ${
            !selectedGuestId
              ? 'bg-primary-100 ring-2 ring-primary-500 scale-105'
              : 'hover:bg-gray-50 hover:scale-105'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-md">
            <span className="text-2xl">👥</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">All Guests</p>
          <p className="text-xs text-gray-500">{guests.length} total</p>
        </button>

        {guests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            isSelected={selectedGuestId === guest.id}
            onClick={() => onGuestSelect(guest.id === selectedGuestId ? undefined : guest.id)}
          />
        ))}
      </div>
    </div>
  );
}

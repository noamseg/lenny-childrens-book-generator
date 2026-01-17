'use client';

import { LennyGuest } from '@/types/lenny';

interface GuestCardProps {
  guest: LennyGuest;
  isSelected?: boolean;
  onClick: () => void;
}

export default function GuestCard({ guest, isSelected, onClick }: GuestCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-2xl transition-all min-w-[100px] ${
        isSelected
          ? 'bg-primary-100 ring-2 ring-primary-500 scale-105'
          : 'hover:bg-gray-50 hover:scale-105'
      }`}
    >
      {guest.photoUrl ? (
        <img
          src={guest.photoUrl}
          alt={guest.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-md">
          {guest.name.charAt(0)}
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-gray-900 text-center line-clamp-1">
        {guest.name.split(' ')[0]}
      </p>
      <p className="text-xs text-gray-500 text-center line-clamp-1">
        {guest.company}
      </p>
    </button>
  );
}

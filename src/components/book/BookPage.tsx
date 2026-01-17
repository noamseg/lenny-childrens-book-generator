'use client';

import Image from 'next/image';
import { Page } from '@/types';

interface BookPageProps {
  page: Page;
  childName: string;
  isActive?: boolean;
}

export default function BookPage({ page, childName, isActive = true }: BookPageProps) {
  return (
    <div
      className={`
        relative bg-white rounded-2xl shadow-playful-lg overflow-hidden
        transition-all duration-300
        ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}
      `}
    >
      {/* Page number badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-primary-600 shadow-md">
          {page.pageNumber}
        </span>
      </div>

      {/* Illustration */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-sky-100 to-purple-100">
        {page.imageUrl ? (
          <Image
            src={page.imageUrl}
            alt={`Illustration for page ${page.pageNumber}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : page.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-500">Creating illustration...</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-30">🎨</div>
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="p-6">
        <p className="text-lg leading-relaxed text-gray-800 font-body">
          {page.text.replace(/\[CHILD_NAME\]/g, childName)}
        </p>
      </div>

      {/* Decorative corner */}
      <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-tr from-accent-200 to-transparent rotate-45 opacity-50" />
      </div>
    </div>
  );
}

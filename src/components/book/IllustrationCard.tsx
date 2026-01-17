'use client';

import Image from 'next/image';

interface IllustrationCardProps {
  imageUrl?: string;
  imagePrompt: string;
  pageNumber: number;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

export default function IllustrationCard({
  imageUrl,
  imagePrompt,
  pageNumber,
  isLoading = false,
  onRegenerate,
}: IllustrationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-playful overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-square bg-gradient-to-br from-sky-50 to-purple-50">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Creating illustration...
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center line-clamp-2">
              {imagePrompt}
            </p>
          </div>
        ) : imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`Illustration for page ${pageNumber}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {/* Regenerate button overlay */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm
                  rounded-lg shadow-md opacity-0 hover:opacity-100 transition-opacity
                  hover:bg-white"
                title="Regenerate illustration"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-4xl mb-2 opacity-30">🎨</span>
            <p className="text-sm text-gray-400 text-center">
              No illustration yet
            </p>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Page {pageNumber}
          </span>
          {imageUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Generated
            </span>
          )}
        </div>
        {imagePrompt && (
          <p className="mt-1 text-xs text-gray-400 line-clamp-2" title={imagePrompt}>
            {imagePrompt}
          </p>
        )}
      </div>
    </div>
  );
}

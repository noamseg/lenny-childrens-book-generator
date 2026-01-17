'use client';

import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ShareButtons from './ShareButtons';

interface PostDownloadNudgeProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  childName: string;
}

export default function PostDownloadNudge({
  isOpen,
  onClose,
  bookId,
  childName,
}: PostDownloadNudgeProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        {/* Celebration animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <span className="text-6xl block animate-bounce">🎉</span>
          <span className="absolute -top-2 right-0 text-2xl animate-ping">✨</span>
          <span className="absolute -bottom-2 left-0 text-2xl animate-ping animation-delay-200">⭐</span>
        </div>

        <h2 className="font-display text-2xl font-bold mb-2 text-gray-900">
          Your Book is Ready!
        </h2>
        <p className="text-gray-600 mb-6">
          {childName}&apos;s adventure has been downloaded. Share the magic with
          family and friends!
        </p>

        {/* Share options */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Share this creation:
          </p>
          <div className="flex justify-center">
            <ShareButtons bookId={bookId} title={`${childName}'s Adventure`} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
          <Link href="/create">
            <Button variant="primary" className="gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Another Book
            </Button>
          </Link>
        </div>

        {/* Fun message */}
        <p className="text-xs text-gray-400 mt-6">
          Tip: Print it out for bedtime reading! 📖
        </p>
      </div>
    </Modal>
  );
}

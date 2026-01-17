'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Button, Card, ReportButton, FeedbackPrompt } from '@/components/ui';
import { BookPreview } from '@/components/book';
import { ShareButtons, DownloadButton, PostDownloadNudge } from '@/components/share';
import { Book, IllustrationStyle } from '@/types';

// Mock book data for demonstration
// In production, this would be fetched from an API or database
function getMockBook(bookId: string): Book {
  return {
    id: bookId,
    childName: 'Alex',
    childAge: 5,
    theme: 'adventure',
    illustrationStyle: 'storybook' as IllustrationStyle,
    pages: [
      {
        pageNumber: 1,
        text: 'Once upon a time, there was a curious child named Alex who loved to explore.',
        imageUrl: 'https://placehold.co/1024x1024/E8D5B7/333333?text=Page+1',
        imagePrompt: 'A curious child in a magical forest',
      },
      {
        pageNumber: 2,
        text: 'One sunny morning, Alex discovered a hidden path in the garden.',
        imageUrl: 'https://placehold.co/1024x1024/98D8C8/333333?text=Page+2',
        imagePrompt: 'A sunny garden with a hidden path',
      },
      {
        pageNumber: 3,
        text: 'The path led to a meadow filled with colorful butterflies dancing in the breeze.',
        imageUrl: 'https://placehold.co/1024x1024/F7DC6F/333333?text=Page+3',
        imagePrompt: 'A meadow with colorful butterflies',
      },
      {
        pageNumber: 4,
        text: 'A friendly rabbit hopped over and said, "Would you like to see something magical?"',
        imageUrl: 'https://placehold.co/1024x1024/DDA0DD/333333?text=Page+4',
        imagePrompt: 'A friendly rabbit talking to a child',
      },
      {
        pageNumber: 5,
        text: 'Alex followed the rabbit to a sparkling stream where fish swam in rainbow colors.',
        imageUrl: 'https://placehold.co/1024x1024/85C1E9/333333?text=Page+5',
        imagePrompt: 'A sparkling stream with colorful fish',
      },
      {
        pageNumber: 6,
        text: '"Look!" said Alex, pointing at a beautiful tree with golden leaves.',
        imageUrl: 'https://placehold.co/1024x1024/FFE4E1/333333?text=Page+6',
        imagePrompt: 'A magical tree with golden leaves',
      },
      {
        pageNumber: 7,
        text: 'Under the tree, Alex found a treasure chest filled with precious memories.',
        imageUrl: 'https://placehold.co/1024x1024/E6E6FA/333333?text=Page+7',
        imagePrompt: 'A treasure chest under a golden tree',
      },
      {
        pageNumber: 8,
        text: 'Each memory sparkled like a star, reminding Alex of happy times with family.',
        imageUrl: 'https://placehold.co/1024x1024/F0FFF0/333333?text=Page+8',
        imagePrompt: 'Sparkling memories floating in the air',
      },
      {
        pageNumber: 9,
        text: 'As the sun began to set, Alex knew it was time to head home.',
        imageUrl: 'https://placehold.co/1024x1024/FFF0F5/333333?text=Page+9',
        imagePrompt: 'A beautiful sunset over the meadow',
      },
      {
        pageNumber: 10,
        text: 'And Alex fell asleep that night dreaming of the next great adventure. The End.',
        imageUrl: 'https://placehold.co/1024x1024/F5FFFA/333333?text=Page+10',
        imagePrompt: 'A child peacefully sleeping with dreams',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function PreviewPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadNudge, setShowDownloadNudge] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleDownloadComplete = () => {
    setShowDownloadNudge(true);
  };

  const handleDownloadNudgeClose = () => {
    setShowDownloadNudge(false);
    // Show feedback prompt after closing download nudge
    setTimeout(() => setShowFeedback(true), 500);
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setBook(getMockBook(bookId));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [bookId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 flex items-center justify-center">
        <Card className="text-center p-12">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Loading your book...</p>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 flex items-center justify-center">
        <Card className="text-center p-12 max-w-md">
          <span className="text-6xl block mb-4">📚</span>
          <h1 className="font-display text-2xl font-bold mb-2">
            Book Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find the book you&apos;re looking for.
          </p>
          <Link href="/create">
            <Button>Create a New Book</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12">
      <Container size="xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/create"
              className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Create Another Book
            </Link>
            <h1 className="font-display text-3xl font-bold">
              {book.childName}&apos;s Adventure
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <ShareButtons bookId={book.id} title={`${book.childName}'s Adventure`} />
            <DownloadButton bookId={book.id} onDownloadComplete={handleDownloadComplete} />
          </div>
        </div>

        {/* Book Preview */}
        <BookPreview book={book} />

        {/* Book details */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Book Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Character:</strong> {book.childName}
              </li>
              {book.childAge && (
                <li>
                  <strong>Age:</strong> {book.childAge} years old
                </li>
              )}
              {book.theme && (
                <li>
                  <strong>Theme:</strong> {book.theme}
                </li>
              )}
              <li>
                <strong>Style:</strong> {book.illustrationStyle}
              </li>
              <li>
                <strong>Pages:</strong> {book.pages.length}
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Share Your Book</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this magical story with family and friends!
            </p>
            <ShareButtons
              bookId={book.id}
              title={`${book.childName}'s Adventure`}
            />
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get a print-ready version of your book.
            </p>
            <DownloadButton bookId={book.id} onDownloadComplete={handleDownloadComplete} />
          </Card>
        </div>

        {/* Report content link */}
        <div className="mt-8 text-center">
          <ReportButton bookId={book.id} />
        </div>

        {/* Post-download nudge modal */}
        <PostDownloadNudge
          isOpen={showDownloadNudge}
          onClose={handleDownloadNudgeClose}
          bookId={book.id}
          childName={book.childName}
        />

        {/* Feedback prompt */}
        <FeedbackPrompt
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          bookId={book.id}
          childName={book.childName}
        />
      </Container>
    </div>
  );
}

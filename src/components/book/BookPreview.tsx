'use client';

import { useState } from 'react';
import { Book, Page } from '@/types';
import BookPage from './BookPage';
import PageEditor from './PageEditor';
import { Button } from '@/components/ui';

interface BookPreviewProps {
  book: Book;
  onUpdatePage?: (pageNumber: number, newText: string) => void;
  onRegenerateImage?: (pageNumber: number) => void;
  onDownload?: () => void;
}

export default function BookPreview({
  book,
  onUpdatePage,
  onRegenerateImage,
  onDownload,
}: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [editingPage, setEditingPage] = useState<number | null>(null);
  const [localPages, setLocalPages] = useState<Page[]>(book.pages);

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < localPages.length) {
      setCurrentPage(pageIndex);
    }
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  const handleEditClick = () => {
    setEditingPage(localPages[currentPage].pageNumber);
  };

  const handleSaveEdit = (pageNumber: number, newText: string) => {
    // Update local state
    setLocalPages((prev) =>
      prev.map((page) =>
        page.pageNumber === pageNumber ? { ...page, text: newText } : page
      )
    );

    // Call parent callback if provided
    if (onUpdatePage) {
      onUpdatePage(pageNumber, newText);
    }

    setEditingPage(null);
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
  };

  const handleRegenerateImage = () => {
    if (onRegenerateImage) {
      onRegenerateImage(localPages[currentPage].pageNumber);
    }
  };

  const currentPageData = localPages[currentPage];
  const isEditing = editingPage === currentPageData.pageNumber;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Book title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
          {book.childName}&apos;s Adventure
        </h2>
        <p className="text-gray-500">
          Page {currentPage + 1} of {localPages.length}
        </p>
      </div>

      {/* Page display or editor */}
      <div className="relative mb-8">
        {!isEditing && (
          <>
            {/* Navigation arrows */}
            <button
              onClick={goToPrevious}
              disabled={currentPage === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                w-12 h-12 bg-white rounded-full shadow-playful-lg
                flex items-center justify-center
                disabled:opacity-30 disabled:cursor-not-allowed
                hover:scale-110 transition-transform"
              aria-label="Previous page"
            >
              <svg
                className="w-6 h-6 text-gray-600"
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
            </button>

            <button
              onClick={goToNext}
              disabled={currentPage === localPages.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                w-12 h-12 bg-white rounded-full shadow-playful-lg
                flex items-center justify-center
                disabled:opacity-30 disabled:cursor-not-allowed
                hover:scale-110 transition-transform"
              aria-label="Next page"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Current page or editor */}
        <div className="px-8">
          {isEditing ? (
            <PageEditor
              page={currentPageData}
              childName={book.childName}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <BookPage
              page={currentPageData}
              childName={book.childName}
              isActive={true}
            />
          )}
        </div>
      </div>

      {/* Page thumbnails */}
      <div className="flex justify-center gap-2 flex-wrap mb-6">
        {localPages.map((page, index) => (
          <button
            key={page.pageNumber}
            onClick={() => goToPage(index)}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              text-sm font-semibold transition-all
              ${
                currentPage === index
                  ? 'bg-primary-500 text-white shadow-playful'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            aria-label={`Go to page ${page.pageNumber}`}
            aria-current={currentPage === index ? 'page' : undefined}
          >
            {page.pageNumber}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      {!isEditing && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={handleEditClick}
            className="gap-2"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Text
          </Button>

          {onRegenerateImage && (
            <Button
              variant="outline"
              onClick={handleRegenerateImage}
              className="gap-2"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Regenerate Image
            </Button>
          )}

          {onDownload && (
            <Button variant="primary" onClick={onDownload} className="gap-2">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </Button>
          )}
        </div>
      )}

      {/* Edit hint */}
      {!isEditing && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Click &quot;Edit Text&quot; to customize any page
        </p>
      )}
    </div>
  );
}

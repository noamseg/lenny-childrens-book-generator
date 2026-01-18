'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Book } from '@/types';

interface DownloadButtonProps {
  bookId: string;
  book?: Book; // Full book object for PDF generation
  onDownload?: () => Promise<string>; // Returns download URL
  onDownloadComplete?: () => void; // Called after successful download
}

export default function DownloadButton({ bookId, book, onDownload, onDownloadComplete }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (onDownload) {
        const downloadUrl = await onDownload();
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `childrens-book-${bookId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Notify download complete
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      } else {
        // Default: call the generate-pdf API with full book object
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, book }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `childrens-book-${bookId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        // Notify download complete
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="primary"
        size="lg"
        onClick={handleDownload}
        isLoading={isGenerating}
        className="gap-2"
      >
        {!isGenerating && (
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        {isGenerating ? 'Generating PDF...' : 'Download PDF'}
      </Button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        High-quality print-ready PDF
      </p>
    </div>
  );
}

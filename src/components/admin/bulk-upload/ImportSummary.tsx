'use client';

import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { ImportResult } from '@/types/bulk-upload';

interface ImportSummaryProps {
  result: ImportResult;
  onStartOver: () => void;
}

export default function ImportSummary({
  result,
  onStartOver,
}: ImportSummaryProps) {
  const hasErrors = result.errors.length > 0;
  const allFailed = result.imported === 0 && result.errors.length > 0;

  return (
    <div className="space-y-6">
      {/* Main Summary */}
      <Card className="text-center">
        <div className="text-6xl mb-4">
          {allFailed ? '❌' : hasErrors ? '⚠️' : '🎉'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {allFailed ? 'Import Failed' : hasErrors ? 'Import Completed with Issues' : 'Import Successful!'}
        </h2>
        <p className="text-gray-600 mb-6">
          {allFailed
            ? 'No episodes were imported. See errors below.'
            : hasErrors
              ? `${result.imported} episode${result.imported === 1 ? '' : 's'} imported, ${result.errors.length} error${result.errors.length === 1 ? '' : 's'}`
              : `Successfully imported ${result.imported} episode${result.imported === 1 ? '' : 's'}!`
          }
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{result.imported}</p>
            <p className="text-sm text-gray-500">Imported</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{result.skipped}</p>
            <p className="text-sm text-gray-500">Skipped</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{result.errors.length}</p>
            <p className="text-sm text-gray-500">Errors</p>
          </div>
        </div>

        {/* New Guests Created */}
        {result.createdGuestIds.length > 0 && (
          <p className="text-sm text-gray-600 mb-4">
            {result.createdGuestIds.length} new guest{result.createdGuestIds.length === 1 ? '' : 's'} created.{' '}
            <Link href="/admin/guests" className="text-primary-600 hover:underline">
              Edit guest profiles
            </Link>
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onStartOver}>
            Import More
          </Button>
          <Link href="/admin/episodes">
            <Button>View Episodes</Button>
          </Link>
        </div>
      </Card>

      {/* Error Details */}
      {result.errors.length > 0 && (
        <Card className="border-red-200">
          <h3 className="font-semibold text-red-700 mb-4">
            Import Errors
          </h3>
          <div className="space-y-2">
            {result.errors.map((error, index) => (
              <div
                key={`${error.id}-${index}`}
                className="flex items-start gap-3 py-2 px-3 bg-red-50 rounded-lg"
              >
                <span className="text-red-500">❌</span>
                <div>
                  <p className="font-medium text-red-700">{error.fileName}</p>
                  <p className="text-sm text-red-600">{error.error}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Success Details */}
      {result.imported > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">
            What&apos;s Next?
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <span>Episodes are now available in the admin panel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <span>Transcripts are saved and ready for book generation</span>
            </li>
            {result.createdGuestIds.length > 0 && (
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">!</span>
                <span>New guest profiles need photos and bios - <Link href="/admin/guests" className="text-primary-600 hover:underline">edit guests</Link></span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <span className="text-blue-500">→</span>
              <span>Review episode details and make any needed edits</span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}

'use client';

import { Card, Button, ProgressBar } from '@/components/ui';
import { BulkUploadItem } from '@/types/bulk-upload';

interface AnalysisProgressProps {
  items: BulkUploadItem[];
  progress: {
    current: number;
    total: number;
    currentFileName: string;
  } | null;
  onCancel: () => void;
}

export default function AnalysisProgress({
  items,
  progress,
  onCancel,
}: AnalysisProgressProps) {
  const completedCount = items.filter(i => i.status === 'completed').length;
  const errorCount = items.filter(i => i.status === 'error').length;
  const skippedCount = items.filter(i => i.status === 'skipped').length;
  const analyzingCount = items.filter(i => i.status === 'analyzing').length;

  const progressPercent = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Progress */}
      <Card className="text-center">
        <div className="text-6xl mb-4 animate-pulse">
          {analyzingCount > 0 ? '🤖' : '⏳'}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Analyzing Transcripts with AI
        </h2>
        <p className="text-gray-600 mb-6">
          {progress
            ? `Processing ${progress.current} of ${progress.total} files...`
            : 'Preparing analysis...'}
        </p>

        {progress && (
          <>
            <div className="mb-2">
              <ProgressBar progress={progressPercent} />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Current: {progress.currentFileName}
            </p>
          </>
        )}

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{analyzingCount}</p>
            <p className="text-sm text-gray-500">Analyzing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{skippedCount}</p>
            <p className="text-sm text-gray-500">Skipped</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{errorCount}</p>
            <p className="text-sm text-gray-500">Errors</p>
          </div>
        </div>

        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Card>

      {/* Item Status List */}
      <Card>
        <h3 className="font-medium text-gray-900 mb-4">File Status</h3>
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  item.status === 'completed' ? 'bg-green-50' :
                  item.status === 'error' ? 'bg-red-50' :
                  item.status === 'skipped' ? 'bg-yellow-50' :
                  item.status === 'analyzing' ? 'bg-blue-50' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.status === 'completed' ? '✅' :
                     item.status === 'error' ? '❌' :
                     item.status === 'skipped' ? '⏭️' :
                     item.status === 'analyzing' ? '⏳' :
                     '⏸️'}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {item.fileName}
                  </span>
                </div>
                <div className="text-right">
                  {item.status === 'completed' && item.analysis && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.analysis.confidence === 'high' ? 'bg-green-100 text-green-700' :
                      item.analysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.analysis.confidence} confidence
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs text-red-600">
                      {item.error}
                    </span>
                  )}
                  {item.status === 'skipped' && (
                    <span className="text-xs text-yellow-600">
                      {item.error}
                    </span>
                  )}
                  {item.status === 'analyzing' && (
                    <span className="text-xs text-blue-600 animate-pulse">
                      Analyzing...
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="text-xs text-gray-400">
                      Waiting...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

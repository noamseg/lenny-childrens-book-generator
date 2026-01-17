'use client';

import { useCallback, useRef, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { BulkUploadItem } from '@/types/bulk-upload';

interface BulkFileDropZoneProps {
  items: BulkUploadItem[];
  onAddFiles: (files: File[]) => Promise<void>;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onStartAnalysis: () => void;
  disabled?: boolean;
}

export default function BulkFileDropZone({
  items,
  onAddFiles,
  onRemoveItem,
  onClear,
  onStartAnalysis,
  disabled = false,
}: BulkFileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.txt')
    );

    if (files.length > 0) {
      await onAddFiles(files);
    }
  }, [disabled, onAddFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onAddFiles(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onAddFiles]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-colors
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={!disabled ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-6xl mb-4">
          {isDragging ? '📥' : '📁'}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop transcript files here
        </h3>
        <p className="text-gray-500 mb-4">
          or click to browse for .txt files
        </p>
        <p className="text-sm text-gray-400">
          You can upload hundreds of files at once
        </p>
      </div>

      {/* File List */}
      {items.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              {items.length} file{items.length === 1 ? '' : 's'} ready for analysis
            </h3>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClear}
                disabled={disabled}
              >
                Clear All
              </Button>
              <Button
                onClick={onStartAnalysis}
                disabled={disabled || items.length === 0}
              >
                Start Analysis
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📄</span>
                    <span className="text-sm font-medium text-gray-700">
                      {item.fileName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(item.transcriptContent.length / 1024)}KB
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    disabled={disabled}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <span className="sr-only">Remove</span>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

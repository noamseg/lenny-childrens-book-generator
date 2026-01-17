'use client';

import { useState, useCallback, useRef } from 'react';
import { Button, Card } from '@/components/ui';

interface TranscriptUploaderProps {
  onUpload: (file: File) => void;
  onTextSubmit: (text: string) => void;
  isUploading?: boolean;
  error?: string;
}

export default function TranscriptUploader({
  onUpload,
  onTextSubmit,
  isUploading = false,
  error,
}: TranscriptUploaderProps) {
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (
        file.type === 'text/plain' ||
        file.type === 'application/pdf' ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.pdf')
      )) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleTextSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  return (
    <Card variant="outlined" className="w-full max-w-2xl mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('file')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            mode === 'file'
              ? 'bg-primary-500 text-white shadow-playful'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            mode === 'text'
              ? 'bg-primary-500 text-white shadow-playful'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Paste Text
        </button>
      </div>

      {mode === 'file' ? (
        /* File upload zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              {isUploading ? (
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-8 h-8 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">
              {isUploading ? 'Uploading...' : 'Drop your transcript here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (.txt or .pdf files)
            </p>
          </div>
        </div>
      ) : (
        /* Text input */
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your podcast transcript here..."
            className="w-full h-48 px-4 py-3 rounded-xl border-2 border-gray-200
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              focus:outline-none resize-none transition-all"
            disabled={isUploading}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {text.split(/\s+/).filter(Boolean).length} words
            </span>
            <Button
              onClick={handleTextSubmit}
              isLoading={isUploading}
              disabled={!text.trim() || isUploading}
            >
              Process Transcript
            </Button>
          </div>
        </div>
      )}

      {/* Playful error message with illustrations */}
      {error && (
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl">
          <div className="flex items-start gap-3">
            {/* Error illustration based on error type */}
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              {error.toLowerCase().includes('too short') ? (
                <span className="text-2xl" role="img" aria-label="Thinking face">🤔</span>
              ) : error.toLowerCase().includes('too long') ? (
                <span className="text-2xl" role="img" aria-label="Book overflow">📚</span>
              ) : error.toLowerCase().includes('file') || error.toLowerCase().includes('read') ? (
                <span className="text-2xl" role="img" aria-label="Confused paper">📄</span>
              ) : error.toLowerCase().includes('inappropriate') || error.toLowerCase().includes('content') ? (
                <span className="text-2xl" role="img" aria-label="Shield">🛡️</span>
              ) : (
                <span className="text-2xl" role="img" aria-label="Oops">🙈</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">
                {error.toLowerCase().includes('too short')
                  ? 'Need a bit more story magic!'
                  : error.toLowerCase().includes('too long')
                  ? 'Whoa, that\'s a lot of words!'
                  : error.toLowerCase().includes('file') || error.toLowerCase().includes('read')
                  ? 'Hmm, that file seems shy...'
                  : error.toLowerCase().includes('inappropriate') || error.toLowerCase().includes('content')
                  ? 'Content check needed!'
                  : 'Oops! Something went sideways'}
              </h4>
              <p className="text-sm text-orange-700">{error}</p>
              <p className="text-xs text-orange-500 mt-2 italic">
                {error.toLowerCase().includes('too short')
                  ? 'Try adding more content - at least 100 words helps us create better stories!'
                  : error.toLowerCase().includes('too long')
                  ? 'Try using a shorter segment - we work best with transcripts under 12,000 words.'
                  : error.toLowerCase().includes('file')
                  ? 'Make sure it\'s a .txt or .pdf file, and try again!'
                  : 'Don\'t worry - just try again or use a different transcript!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-6 p-4 bg-sky-50 rounded-xl">
        <h4 className="font-medium text-sky-900 mb-2">
          Tips for best results:
        </h4>
        <ul className="text-sm text-sky-700 space-y-1">
          <li>Use transcripts from family-friendly podcast episodes</li>
          <li>Longer transcripts (1000+ words) work best</li>
          <li>Include conversations with your child for personalization</li>
        </ul>
      </div>
    </Card>
  );
}

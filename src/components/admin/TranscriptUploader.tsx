'use client';

import { useState, useRef } from 'react';
import { Button, Card } from '@/components/ui';

interface TranscriptUploaderProps {
  onTranscriptChange: (content: string) => void;
  initialContent?: string;
}

export default function TranscriptUploader({ onTranscriptChange, initialContent = '' }: TranscriptUploaderProps) {
  const [content, setContent] = useState(initialContent);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Check file type
    const validTypes = ['text/plain', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      alert('Please upload a .txt or .pdf file');
      return;
    }

    setFileName(file.name);

    if (file.type === 'application/pdf') {
      // For PDF, we'd need to extract text - for now, just notify
      alert('PDF upload detected. Please paste the transcript text directly for now.');
      return;
    }

    // Read text file
    const text = await file.text();
    setContent(text);
    onTranscriptChange(text);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setFileName(null);
    onTranscriptChange(text);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-600 mb-2">
          {fileName ? (
            <>Uploaded: <strong>{fileName}</strong></>
          ) : (
            'Drag and drop a transcript file here'
          )}
        </p>
        <p className="text-gray-400 text-sm mb-4">or</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose File
        </Button>
      </div>

      {/* Text area */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Transcript Content
          </label>
          <span className="text-sm text-gray-500">
            {wordCount.toLocaleString()} words
          </span>
        </div>
        <textarea
          value={content}
          onChange={handleTextChange}
          placeholder="Paste the transcript text here..."
          rows={12}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none font-mono text-sm"
        />
      </div>
    </div>
  );
}

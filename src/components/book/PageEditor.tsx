'use client';

import { useState, useEffect, useRef } from 'react';
import { Page } from '@/types';
import { Button } from '@/components/ui';

interface PageEditorProps {
  page: Page;
  childName: string;
  onSave: (pageNumber: number, newText: string) => void;
  onCancel: () => void;
}

export default function PageEditor({
  page,
  childName,
  onSave,
  onCancel,
}: PageEditorProps) {
  const [text, setText] = useState(page.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, [text.length]);

  const handleSave = () => {
    onSave(page.pageNumber, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  // Preview text with child's name
  const previewText = text.replace(/\[CHILD_NAME\]/g, childName);

  return (
    <div className="bg-white rounded-2xl shadow-playful-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit Page {page.pageNumber}
        </h3>
        <span className="text-sm text-gray-500">
          Press Cmd+Enter to save, Esc to cancel
        </span>
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Text
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              focus:outline-none resize-none transition-all"
            placeholder="Enter the page text..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Use [CHILD_NAME] to insert the child&apos;s name
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <p className="text-gray-800 leading-relaxed">{previewText}</p>
        </div>

        {/* Character count */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>{text.length} characters</span>
          <span
            className={text.length > 200 ? 'text-amber-600 font-medium' : ''}
          >
            {text.length > 200 && 'Consider keeping text shorter for young readers'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

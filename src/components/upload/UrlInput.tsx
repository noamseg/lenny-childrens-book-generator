'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function UrlInput({ onSubmit, isLoading = false, error }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://podcast-transcript-url.com/episode"
            error={error}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!url.trim() || !isValidUrl(url) || isLoading}
        >
          Fetch
        </Button>
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Paste a URL to a public podcast transcript page
      </p>
    </form>
  );
}

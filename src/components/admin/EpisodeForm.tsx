'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui';
import TranscriptUploader from './TranscriptUploader';
import { LennyEpisode, LennyGuest, CreateEpisodeInput, LENNY_TOPICS } from '@/types/lenny';

interface EpisodeFormProps {
  episode?: LennyEpisode;
  initialTranscript?: string;
  mode: 'create' | 'edit';
}

export default function EpisodeForm({ episode, initialTranscript = '', mode }: EpisodeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [guests, setGuests] = useState<LennyGuest[]>([]);
  const [transcript, setTranscript] = useState(initialTranscript);

  const [formData, setFormData] = useState<CreateEpisodeInput>({
    episodeNumber: episode?.episodeNumber || 1,
    title: episode?.title || '',
    description: episode?.description || '',
    publishDate: episode?.publishDate || new Date().toISOString().split('T')[0],
    duration: episode?.duration || '',
    guestId: episode?.guestId || '',
    featuredQuote: episode?.featuredQuote || '',
    quoteTimestamp: episode?.quoteTimestamp || '',
    topics: episode?.topics || [],
    spotifyUrl: episode?.spotifyUrl || '',
    youtubeUrl: episode?.youtubeUrl || '',
  });

  useEffect(() => {
    // Fetch guests for dropdown
    fetch('/api/admin/guests')
      .then(res => res.json())
      .then(data => setGuests(data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'episodeNumber' ? parseInt(value) || 0 : value }));
  };

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = mode === 'create'
        ? '/api/admin/episodes'
        : `/api/admin/episodes/${episode?.id}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, transcript }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save episode');
      }

      router.push('/admin/episodes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Episode details */}
        <Card>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-6">
            Episode Details
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Episode Number"
                name="episodeNumber"
                type="number"
                value={formData.episodeNumber}
                onChange={handleChange}
                min={1}
                required
              />
              <Input
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 1h 23m"
                required
              />
            </div>

            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Episode title"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the episode..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Publish Date"
                name="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest
                </label>
                <select
                  name="guestId"
                  value={formData.guestId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  required
                >
                  <option value="">Select a guest</option>
                  {guests.map(guest => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} ({guest.company})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Featured Quote"
              name="featuredQuote"
              value={formData.featuredQuote}
              onChange={handleChange}
              placeholder="A memorable quote from the episode"
              required
            />

            <Input
              label="Quote Timestamp"
              name="quoteTimestamp"
              value={formData.quoteTimestamp}
              onChange={handleChange}
              placeholder="e.g., 12:34"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {LENNY_TOPICS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.topics.includes(topic)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Spotify URL (optional)"
                name="spotifyUrl"
                value={formData.spotifyUrl}
                onChange={handleChange}
                placeholder="https://open.spotify.com/..."
              />
              <Input
                label="YouTube URL (optional)"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </Card>

        {/* Right column - Transcript */}
        <Card>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-6">
            Transcript
          </h2>
          <TranscriptUploader
            onTranscriptChange={setTranscript}
            initialContent={initialTranscript}
          />
        </Card>
      </div>

      <div className="mt-6 flex gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Episode' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

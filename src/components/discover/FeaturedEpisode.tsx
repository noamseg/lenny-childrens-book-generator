'use client';

import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { LennyEpisode } from '@/types/lenny';

interface FeaturedEpisodeProps {
  episode: LennyEpisode;
  onGuestClick?: (guestId: string) => void;
}

export default function FeaturedEpisode({ episode, onGuestClick }: FeaturedEpisodeProps) {
  return (
    <Card className="bg-gradient-to-br from-primary-50 via-white to-purple-50 border-2 border-primary-100 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Guest photo - large */}
        <button
          onClick={() => episode.guest && onGuestClick?.(episode.guest.id)}
          className="flex-shrink-0 self-center md:self-start group"
        >
          {episode.guest?.photoUrl ? (
            <img
              src={episode.guest.photoUrl}
              alt={episode.guest.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-lg group-hover:border-primary-300 transition-colors"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg group-hover:border-primary-300 transition-colors">
              {episode.guest?.name.charAt(0) || '?'}
            </div>
          )}
        </button>

        {/* Episode info */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
            <span>✨</span>
            <span>Featured Episode</span>
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {episode.title}
          </h2>

          <button
            onClick={() => episode.guest && onGuestClick?.(episode.guest.id)}
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            <span className="font-semibold">{episode.guest?.name}</span>
            <span className="mx-2">•</span>
            <span>{episode.guest?.title} at {episode.guest?.company}</span>
          </button>

          <p className="text-gray-500 mt-1 text-sm">
            Episode #{episode.episodeNumber} • {episode.duration} • {new Date(episode.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Featured quote */}
          {episode.featuredQuote && (
            <blockquote className="mt-4 text-lg text-gray-700 italic border-l-4 border-purple-400 pl-4">
              &ldquo;{episode.featuredQuote}&rdquo;
            </blockquote>
          )}

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            {episode.topics.map(topic => (
              <span
                key={topic}
                className="px-3 py-1 bg-white text-gray-600 text-sm rounded-full border border-gray-200"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3 justify-center md:justify-start">
            <Link href={`/create?episode=${episode.id}`}>
              <Button size="lg" className="gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Create Book from This Episode
              </Button>
            </Link>
            {episode.spotifyUrl && (
              <a href={episode.spotifyUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  Listen on Spotify
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { LennyEpisode } from '@/types/lenny';

interface EpisodeCardProps {
  episode: LennyEpisode;
  onGuestClick?: (guestId: string) => void;
}

export default function EpisodeCard({ episode, onGuestClick }: EpisodeCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* Guest photo */}
        <button
          onClick={() => episode.guest && onGuestClick?.(episode.guest.id)}
          className="flex-shrink-0 group"
        >
          {episode.guest?.photoUrl ? (
            <img
              src={episode.guest.photoUrl}
              alt={episode.guest.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-primary-300 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-100 group-hover:border-primary-300 transition-colors">
              {episode.guest?.name.charAt(0) || '?'}
            </div>
          )}
        </button>

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary-600 font-medium">
                Episode #{episode.episodeNumber}
              </p>
              <h3 className="font-display font-bold text-gray-900 line-clamp-1">
                {episode.title}
              </h3>
              <button
                onClick={() => episode.guest && onGuestClick?.(episode.guest.id)}
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                {episode.guest?.name} • {episode.duration} • {new Date(episode.publishDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </button>
            </div>
            <Link href={`/create?episode=${episode.id}`} className="flex-shrink-0">
              <Button size="sm" className="gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Create Book</span>
              </Button>
            </Link>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {episode.topics.slice(0, 4).map(topic => (
              <span
                key={topic}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured quote */}
      {episode.featuredQuote && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-primary-50 rounded-xl border-l-4 border-purple-400">
          <div className="flex items-start gap-2">
            <span className="text-purple-500 text-lg flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-gray-700 italic line-clamp-2">
                {episode.featuredQuote}
              </p>
              {episode.guest?.name && (
                <p className="text-xs text-purple-500 mt-1 font-medium">
                  — {episode.guest.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Lessons */}
      {episode.coreLessons && episode.coreLessons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Key Lessons
          </p>
          <ul className="space-y-1">
            {episode.coreLessons.slice(0, 2).map((lesson, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-primary-500">•</span>
                <span className="line-clamp-1">{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

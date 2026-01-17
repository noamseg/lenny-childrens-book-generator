'use client';

import { Modal, Button } from '@/components/ui';
import { LennyGuest, LennyEpisode } from '@/types/lenny';
import Link from 'next/link';

interface GuestModalProps {
  guest: LennyGuest;
  episodes: LennyEpisode[];
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestModal({ guest, episodes, isOpen, onClose }: GuestModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={guest.name} size="lg">
      <div className="space-y-6">
        {/* Guest header */}
        <div className="flex items-start gap-6">
          {guest.photoUrl ? (
            <img
              src={guest.photoUrl}
              alt={guest.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-100">
              {guest.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-gray-900">
              {guest.name}
            </h3>
            <p className="text-gray-600">
              {guest.title} at {guest.company}
            </p>
            <p className="text-gray-500 text-sm mt-2">{guest.bio}</p>

            {/* Social links */}
            <div className="flex gap-3 mt-3">
              {guest.linkedIn && (
                <a
                  href={guest.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {guest.twitter && (
                <a
                  href={`https://twitter.com/${guest.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Episodes list */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Episodes ({episodes.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      #{episode.episodeNumber}: {episode.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {episode.duration} • {new Date(episode.publishDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/create?episode=${episode.id}`}>
                    <Button size="sm">Create Book</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

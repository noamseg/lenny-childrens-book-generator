'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import {
  GuestGrid,
  GuestModal,
  EpisodeCard,
  FeaturedEpisode,
  TopicFilter,
  SearchBar,
} from '@/components/discover';
import { LennyEpisode, LennyGuest } from '@/types/lenny';

export default function DiscoverPage() {
  const [episodes, setEpisodes] = useState<LennyEpisode[]>([]);
  const [guests, setGuests] = useState<LennyGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedGuestId, setSelectedGuestId] = useState<string | undefined>();

  // Modal state
  const [modalGuest, setModalGuest] = useState<LennyGuest | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [episodesRes, guestsRes] = await Promise.all([
          fetch('/api/lenny/episodes'),
          fetch('/api/lenny/guests'),
        ]);

        if (!episodesRes.ok || !guestsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [episodesData, guestsData] = await Promise.all([
          episodesRes.json(),
          guestsRes.json(),
        ]);

        setEpisodes(episodesData);
        setGuests(guestsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter episodes
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          episode.title.toLowerCase().includes(query) ||
          episode.description.toLowerCase().includes(query) ||
          episode.guest?.name.toLowerCase().includes(query) ||
          episode.guest?.company.toLowerCase().includes(query) ||
          episode.topics.some(t => t.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Topic filter
      if (selectedTopic !== 'All' && !episode.topics.includes(selectedTopic)) {
        return false;
      }

      // Guest filter
      if (selectedGuestId && episode.guestId !== selectedGuestId) {
        return false;
      }

      return true;
    });
  }, [episodes, searchQuery, selectedTopic, selectedGuestId]);

  // Get featured episode (most recent or most popular)
  const featuredEpisode = useMemo(() => {
    if (filteredEpisodes.length === 0) return null;
    // If filtering, don't show featured
    if (searchQuery || selectedTopic !== 'All' || selectedGuestId) return null;
    return filteredEpisodes[0];
  }, [filteredEpisodes, searchQuery, selectedTopic, selectedGuestId]);

  // Get episodes for display (exclude featured)
  const displayEpisodes = useMemo(() => {
    if (!featuredEpisode) return filteredEpisodes;
    return filteredEpisodes.filter(ep => ep.id !== featuredEpisode.id);
  }, [filteredEpisodes, featuredEpisode]);

  // Get episodes for guest modal
  const guestEpisodes = useMemo(() => {
    if (!modalGuest) return [];
    return episodes.filter(ep => ep.guestId === modalGuest.id);
  }, [episodes, modalGuest]);

  const handleGuestClick = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest) setModalGuest(guest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <div className="py-12">
        <Container size="xl">
          {/* Header section */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Discover Lenny&apos;s Podcast Episodes</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Turn your favorite Lenny&apos;s Podcast episodes into magical personalized
              children&apos;s books starring your little one.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading episodes...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <span className="text-6xl block mb-4">😔</span>
              <h3 className="font-display text-xl font-bold mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          ) : episodes.length === 0 ? (
            <Card className="text-center py-12">
              <span className="text-6xl block mb-4">🎙️</span>
              <h3 className="font-display text-xl font-bold mb-2">
                No episodes yet
              </h3>
              <p className="text-gray-600 mb-4">
                Episodes will appear here once they&apos;re added to the library.
              </p>
              <Link href="/create">
                <Button>Upload Your Own Transcript</Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Guest Grid */}
              <div className="mb-8 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <GuestGrid
                  guests={guests}
                  selectedGuestId={selectedGuestId}
                  onGuestSelect={setSelectedGuestId}
                />
              </div>

              {/* Search and filters */}
              <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search guests, episodes, or topics..."
                    />
                  </div>
                </div>
                <TopicFilter
                  selectedTopic={selectedTopic}
                  onTopicChange={setSelectedTopic}
                />
              </div>

              {/* Featured Episode */}
              {featuredEpisode && (
                <div className="mb-8">
                  <FeaturedEpisode
                    episode={featuredEpisode}
                    onGuestClick={handleGuestClick}
                  />
                </div>
              )}

              {/* Results count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  {filteredEpisodes.length === episodes.length
                    ? `${episodes.length} episodes`
                    : `${filteredEpisodes.length} of ${episodes.length} episodes`}
                </p>
                {(searchQuery || selectedTopic !== 'All' || selectedGuestId) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTopic('All');
                      setSelectedGuestId(undefined);
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Episodes list */}
              {displayEpisodes.length === 0 ? (
                <Card className="text-center py-12">
                  <span className="text-6xl block mb-4">🔍</span>
                  <h3 className="font-display text-xl font-bold mb-2">
                    No episodes found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {displayEpisodes.map((episode) => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      onGuestClick={handleGuestClick}
                    />
                  ))}
                </div>
              )}

              {/* CTA section */}
              <div className="mt-12 text-center">
                <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-100">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                    Have Your Own Transcript?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upload any podcast transcript or paste your own conversation text.
                  </p>
                  <Link href="/create">
                    <Button size="lg" className="gap-2">
                      <svg
                        className="w-5 h-5"
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
                      Upload Your Transcript
                    </Button>
                  </Link>
                </Card>
              </div>
            </>
          )}
        </Container>
      </div>

      {/* Guest Modal */}
      {modalGuest && (
        <GuestModal
          guest={modalGuest}
          episodes={guestEpisodes}
          isOpen={!!modalGuest}
          onClose={() => setModalGuest(null)}
        />
      )}
    </div>
  );
}

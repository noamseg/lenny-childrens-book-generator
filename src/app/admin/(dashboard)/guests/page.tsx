import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { getGuests, getGuestEpisodes } from '@/lib/lenny-data';

export default async function GuestsPage() {
  const guests = await getGuests();

  // Get episode counts for each guest
  const guestsWithCounts = await Promise.all(
    guests.map(async (guest) => {
      const episodes = await getGuestEpisodes(guest.id);
      return { ...guest, episodeCount: episodes.length };
    })
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Guests
          </h1>
          <p className="text-gray-600 mt-1">
            Manage podcast guests
          </p>
        </div>
        <Link href="/admin/guests/new">
          <Button className="gap-2">
            <span>➕</span>
            Add Guest
          </Button>
        </Link>
      </div>

      {guests.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-6xl block mb-4">👤</span>
          <h3 className="font-display text-xl font-bold mb-2">No guests yet</h3>
          <p className="text-gray-600 mb-4">
            Add your first podcast guest to get started.
          </p>
          <Link href="/admin/guests/new">
            <Button>Add First Guest</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guestsWithCounts.map((guest) => (
            <Card key={guest.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {guest.photoUrl ? (
                  <img
                    src={guest.photoUrl}
                    alt={guest.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl text-gray-400">👤</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-gray-900 truncate">
                    {guest.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {guest.title} at {guest.company}
                  </p>
                  <p className="text-sm text-primary-600 mt-1">
                    {guest.episodeCount} episode{guest.episodeCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-2">
                  {guest.linkedIn && (
                    <a
                      href={guest.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600"
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
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  )}
                </div>
                <Link
                  href={`/admin/guests/${guest.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Edit
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

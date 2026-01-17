import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { getEpisodes, getGuests } from '@/lib/lenny-data';

export default async function AdminDashboard() {
  const [episodes, guests] = await Promise.all([
    getEpisodes(),
    getGuests(),
  ]);

  const totalBooks = episodes.reduce((sum, ep) => sum + (ep.booksGenerated || 0), 0);
  const recentEpisodes = episodes.slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome to the Lenny&apos;s Books admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-white">🎙️</span>
            </div>
            <div>
              <p className="text-sm text-primary-700 font-medium">Total Episodes</p>
              <p className="text-3xl font-bold text-primary-900">{episodes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-white">👤</span>
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Guests</p>
              <p className="text-3xl font-bold text-purple-900">{guests.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-white">📚</span>
            </div>
            <div>
              <p className="text-sm text-accent-700 font-medium">Books Generated</p>
              <p className="text-3xl font-bold text-accent-900">{totalBooks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/admin/episodes/new">
              <Button className="w-full justify-start gap-3">
                <span className="text-lg">➕</span>
                Add New Episode
              </Button>
            </Link>
            <Link href="/admin/guests/new">
              <Button variant="outline" className="w-full justify-start gap-3">
                <span className="text-lg">👤</span>
                Add New Guest
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">
            Recent Episodes
          </h2>
          {recentEpisodes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No episodes yet. Add your first episode!
            </p>
          ) : (
            <ul className="space-y-3">
              {recentEpisodes.map((episode) => (
                <li key={episode.id}>
                  <Link
                    href={`/admin/episodes/${episode.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">🎙️</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        #{episode.episodeNumber}: {episode.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {episode.guest?.name || 'No guest'}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

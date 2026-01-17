import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { getEpisodes } from '@/lib/lenny-data';

export default async function EpisodesPage() {
  const episodes = await getEpisodes();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Episodes
          </h1>
          <p className="text-gray-600 mt-1">
            Manage Lenny's Podcast episodes
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/episodes/bulk-upload">
            <Button variant="secondary" className="gap-2">
              <span>📁</span>
              Bulk Upload
            </Button>
          </Link>
          <Link href="/admin/episodes/new">
            <Button className="gap-2">
              <span>➕</span>
              Add Episode
            </Button>
          </Link>
        </div>
      </div>

      {episodes.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-6xl block mb-4">🎙️</span>
          <h3 className="font-display text-xl font-bold mb-2">No episodes yet</h3>
          <p className="text-gray-600 mb-4">
            Add your first Lenny's Podcast episode to get started.
          </p>
          <Link href="/admin/episodes/new">
            <Button>Add First Episode</Button>
          </Link>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Episode
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Topics
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Books
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {episodes.map((episode) => (
                  <tr key={episode.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          #{episode.episodeNumber}: {episode.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {episode.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {episode.guest ? (
                        <div className="flex items-center gap-3">
                          {episode.guest.photoUrl && (
                            <img
                              src={episode.guest.photoUrl}
                              alt={episode.guest.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {episode.guest.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {episode.guest.company}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(episode.publishDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {episode.topics.slice(0, 3).map(topic => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                        {episode.topics.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{episode.topics.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {episode.booksGenerated || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/episodes/${episode.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

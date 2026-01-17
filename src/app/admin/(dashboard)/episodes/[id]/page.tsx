import { notFound } from 'next/navigation';
import { EpisodeForm } from '@/components/admin';
import { getEpisodeWithTranscript } from '@/lib/lenny-data';

interface EditEpisodePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEpisodePage({ params }: EditEpisodePageProps) {
  const { id } = await params;
  const result = await getEpisodeWithTranscript(id);

  if (!result) {
    notFound();
  }

  const { episode, transcript } = result;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Edit Episode #{episode.episodeNumber}
        </h1>
        <p className="text-gray-600 mt-1">
          {episode.title}
        </p>
      </div>

      <EpisodeForm
        episode={episode}
        initialTranscript={transcript}
        mode="edit"
      />
    </div>
  );
}

import { EpisodeForm } from '@/components/admin';

export default function NewEpisodePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Add New Episode
        </h1>
        <p className="text-gray-600 mt-1">
          Create a new Lenny Podcast episode with transcript
        </p>
      </div>

      <EpisodeForm mode="create" />
    </div>
  );
}

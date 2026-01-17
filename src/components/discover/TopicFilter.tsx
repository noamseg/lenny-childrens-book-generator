'use client';

import { LENNY_TOPICS } from '@/types/lenny';

interface TopicFilterProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export default function TopicFilter({ selectedTopic, onTopicChange }: TopicFilterProps) {
  const allTopics = ['All', ...LENNY_TOPICS];

  return (
    <div className="flex flex-wrap gap-2">
      {allTopics.map((topic) => (
        <button
          key={topic}
          onClick={() => onTopicChange(topic)}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            selectedTopic === topic
              ? 'bg-primary-500 text-white shadow-playful'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}

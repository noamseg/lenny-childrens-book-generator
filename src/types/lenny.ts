// Lenny's Podcast Episode & Guest Types

export interface LennyGuest {
  id: string;
  name: string;
  title: string;           // e.g., "CEO at Stripe"
  company: string;
  bio: string;
  photoUrl: string;        // Guest headshot
  linkedIn?: string;
  twitter?: string;
}

export interface LennyEpisode {
  id: string;
  episodeNumber?: number;  // Optional - auto-generated for internal ordering
  title: string;
  description: string;
  publishDate: string;     // ISO date
  duration: string;        // e.g., "1h 23m"
  guestId?: string;        // Reference to LennyGuest (optional)
  guest?: LennyGuest;      // Populated when fetched
  featuredQuote: string;
  quoteTimestamp: string;
  topics: string[];        // e.g., ["Product", "Growth", "Leadership"]
  transcriptPath: string;  // Path to transcript file
  spotifyUrl?: string;
  youtubeUrl?: string;
  booksGenerated: number;  // Track popularity
  // Children's book content extraction
  coreLessons?: string[];      // Key frameworks, mental models, takeaways
  memorableStories?: string[]; // Anecdotes that could become book narratives
  quotableMoments?: string[];  // Punchy quotes for illustrations/callouts
}

// Form types for creating/editing
export interface CreateEpisodeInput {
  episodeNumber?: number;  // Optional - auto-generated if not provided
  title: string;
  description: string;
  publishDate: string;
  duration: string;
  guestId?: string; // Optional - some episodes may not have a guest assigned
  featuredQuote: string;
  quoteTimestamp: string;
  topics: string[];
  spotifyUrl?: string;
  youtubeUrl?: string;
  // Children's book content
  coreLessons?: string[];
  memorableStories?: string[];
  quotableMoments?: string[];
}

export interface CreateGuestInput {
  name: string;
  title: string;
  company: string;
  bio: string;
  photoUrl: string;
  linkedIn?: string;
  twitter?: string;
}

// Available topics for filtering
export const LENNY_TOPICS = [
  'Product',
  'Growth',
  'Leadership',
  'Strategy',
  'Culture',
  'Hiring',
  'Marketing',
  'Design',
  'Engineering',
  'Startups',
  'AI',
  'B2B',
  'Consumer',
  'Pricing',
  'Metrics',
] as const;

export type LennyTopic = typeof LENNY_TOPICS[number];

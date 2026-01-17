import { promises as fs } from 'fs';
import path from 'path';
import { LennyEpisode, LennyGuest, CreateEpisodeInput, CreateGuestInput } from '@/types/lenny';

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const EPISODES_FILE = path.join(DATA_DIR, 'episodes.json');
const GUESTS_FILE = path.join(DATA_DIR, 'guests.json');
const TRANSCRIPTS_DIR = path.join(DATA_DIR, 'transcripts');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(TRANSCRIPTS_DIR, { recursive: true });
}

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============ GUEST OPERATIONS ============

export async function getGuests(): Promise<LennyGuest[]> {
  try {
    const data = await fs.readFile(GUESTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getGuest(id: string): Promise<LennyGuest | null> {
  const guests = await getGuests();
  return guests.find(g => g.id === id) || null;
}

export async function createGuest(input: CreateGuestInput): Promise<LennyGuest> {
  await ensureDirectories();
  const guests = await getGuests();

  const newGuest: LennyGuest = {
    id: generateId(),
    ...input,
  };

  guests.push(newGuest);
  await fs.writeFile(GUESTS_FILE, JSON.stringify(guests, null, 2));

  return newGuest;
}

export async function updateGuest(id: string, input: Partial<CreateGuestInput>): Promise<LennyGuest | null> {
  const guests = await getGuests();
  const index = guests.findIndex(g => g.id === id);

  if (index === -1) return null;

  guests[index] = { ...guests[index], ...input };
  await fs.writeFile(GUESTS_FILE, JSON.stringify(guests, null, 2));

  return guests[index];
}

export async function deleteGuest(id: string): Promise<boolean> {
  const guests = await getGuests();
  const filtered = guests.filter(g => g.id !== id);

  if (filtered.length === guests.length) return false;

  await fs.writeFile(GUESTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// ============ EPISODE OPERATIONS ============

export async function getEpisodes(): Promise<LennyEpisode[]> {
  try {
    const data = await fs.readFile(EPISODES_FILE, 'utf-8');
    const episodes: LennyEpisode[] = JSON.parse(data);

    // Populate guest data
    const guests = await getGuests();
    const guestMap = new Map(guests.map(g => [g.id, g]));

    return episodes.map(ep => ({
      ...ep,
      guest: guestMap.get(ep.guestId),
    }));
  } catch {
    return [];
  }
}

export async function getEpisode(id: string): Promise<LennyEpisode | null> {
  const episodes = await getEpisodes();
  return episodes.find(e => e.id === id) || null;
}

export async function getEpisodeWithTranscript(id: string): Promise<{ episode: LennyEpisode; transcript: string } | null> {
  const episode = await getEpisode(id);
  if (!episode) return null;

  try {
    const transcriptPath = path.join(DATA_DIR, episode.transcriptPath);
    const transcript = await fs.readFile(transcriptPath, 'utf-8');
    return { episode, transcript };
  } catch {
    return { episode, transcript: '' };
  }
}

export async function getGuestEpisodes(guestId: string): Promise<LennyEpisode[]> {
  const episodes = await getEpisodes();
  return episodes.filter(e => e.guestId === guestId);
}

export async function getEpisodesByTopic(topic: string): Promise<LennyEpisode[]> {
  const episodes = await getEpisodes();
  return episodes.filter(e => e.topics.includes(topic));
}

export async function createEpisode(input: CreateEpisodeInput, transcriptContent?: string): Promise<LennyEpisode> {
  await ensureDirectories();
  const episodes = await getEpisodes();

  const id = generateId();
  const transcriptPath = `transcripts/ep-${input.episodeNumber.toString().padStart(3, '0')}.txt`;

  // Save transcript if provided
  if (transcriptContent) {
    await saveTranscript(transcriptPath, transcriptContent);
  }

  const newEpisode: LennyEpisode = {
    id,
    ...input,
    transcriptPath,
    booksGenerated: 0,
  };

  // Don't include populated guest in saved data
  const episodeToSave = { ...newEpisode };
  delete episodeToSave.guest;

  episodes.push(episodeToSave);

  // Sort by episode number descending
  episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);

  await fs.writeFile(EPISODES_FILE, JSON.stringify(episodes, null, 2));

  // Return with populated guest
  const guest = await getGuest(input.guestId);
  return { ...newEpisode, guest: guest || undefined };
}

export async function updateEpisode(id: string, input: Partial<CreateEpisodeInput>, transcriptContent?: string): Promise<LennyEpisode | null> {
  const data = await fs.readFile(EPISODES_FILE, 'utf-8');
  const episodes: LennyEpisode[] = JSON.parse(data);
  const index = episodes.findIndex(e => e.id === id);

  if (index === -1) return null;

  // Update transcript if provided
  if (transcriptContent) {
    await saveTranscript(episodes[index].transcriptPath, transcriptContent);
  }

  episodes[index] = { ...episodes[index], ...input };

  // Sort by episode number descending
  episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);

  await fs.writeFile(EPISODES_FILE, JSON.stringify(episodes, null, 2));

  // Return with populated guest
  const guest = await getGuest(episodes[index].guestId);
  return { ...episodes[index], guest: guest || undefined };
}

export async function deleteEpisode(id: string): Promise<boolean> {
  const data = await fs.readFile(EPISODES_FILE, 'utf-8');
  const episodes: LennyEpisode[] = JSON.parse(data);
  const episode = episodes.find(e => e.id === id);

  if (!episode) return false;

  // Delete transcript file
  try {
    const transcriptPath = path.join(DATA_DIR, episode.transcriptPath);
    await fs.unlink(transcriptPath);
  } catch {
    // File may not exist
  }

  const filtered = episodes.filter(e => e.id !== id);
  await fs.writeFile(EPISODES_FILE, JSON.stringify(filtered, null, 2));

  return true;
}

export async function incrementBooksGenerated(episodeId: string): Promise<void> {
  const data = await fs.readFile(EPISODES_FILE, 'utf-8');
  const episodes: LennyEpisode[] = JSON.parse(data);
  const index = episodes.findIndex(e => e.id === episodeId);

  if (index !== -1) {
    episodes[index].booksGenerated = (episodes[index].booksGenerated || 0) + 1;
    await fs.writeFile(EPISODES_FILE, JSON.stringify(episodes, null, 2));
  }
}

// ============ TRANSCRIPT OPERATIONS ============

export async function saveTranscript(relativePath: string, content: string): Promise<void> {
  await ensureDirectories();
  const fullPath = path.join(DATA_DIR, relativePath);
  await fs.writeFile(fullPath, content, 'utf-8');
}

export async function getTranscript(relativePath: string): Promise<string> {
  try {
    const fullPath = path.join(DATA_DIR, relativePath);
    return await fs.readFile(fullPath, 'utf-8');
  } catch {
    return '';
  }
}

// ============ SEARCH & FILTER ============

export async function searchEpisodes(query: string): Promise<LennyEpisode[]> {
  const episodes = await getEpisodes();
  const lowerQuery = query.toLowerCase();

  return episodes.filter(ep =>
    ep.title.toLowerCase().includes(lowerQuery) ||
    ep.description.toLowerCase().includes(lowerQuery) ||
    ep.guest?.name.toLowerCase().includes(lowerQuery) ||
    ep.guest?.company.toLowerCase().includes(lowerQuery) ||
    ep.topics.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

export async function getFeaturedEpisode(): Promise<LennyEpisode | null> {
  const episodes = await getEpisodes();
  // Return the most recent episode
  return episodes[0] || null;
}

export async function getPopularEpisodes(limit: number = 5): Promise<LennyEpisode[]> {
  const episodes = await getEpisodes();
  return [...episodes]
    .sort((a, b) => (b.booksGenerated || 0) - (a.booksGenerated || 0))
    .slice(0, limit);
}

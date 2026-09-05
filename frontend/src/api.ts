const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export interface ChunkResult {
  start: number;
  end: number;
  text: string;
  score: number;
  wordCount: number;
  chunkIndex: number;
  timestampUrl: string;
}

export interface VideoResult {
  videoId: string;
  title: string;
  url: string;
  bestScore: number;
  chunks: ChunkResult[];
  noTranscript?: boolean;
}

export interface SearchResponse {
  query: string;
  results: VideoResult[];
}

export interface Source {
  title: string;
  videoId: string;
  start: number;
  end: number;
  url: string;
  timestampUrl: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: Source[];
}

export async function searchCourse(query: string): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Ask failed');
  return res.json();
}

export interface AutocompleteSuggestion {
  title: string;
  videoId: string;
  url: string;
  position: number;
  noTranscript?: boolean;
}

export async function getAutocomplete(query: string): Promise<AutocompleteSuggestion[]> {
  if (query.length < 1) return [];
  const res = await fetch(`${API_BASE}/autocomplete?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

const rawApiUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } })?.env?.VITE_API_URL;
const API_BASE = rawApiUrl
  ? `${rawApiUrl.replace(/\/$/, '')}/api`
  : '/api';

const TOKEN_KEY = 'dsa_access_passcode';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['x-access-token'] = token;
  }
  return headers;
}

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
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: getRequestHeaders(),
  });
  if (res.status === 401) {
    clearAuthToken();
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ question }),
  });
  if (res.status === 401) {
    clearAuthToken();
    throw new Error('UNAUTHORIZED');
  }
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
  try {
    const res = await fetch(`${API_BASE}/autocomplete?q=${encodeURIComponent(query)}`, {
      headers: getRequestHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}

// Authentication check & verification
export async function checkAuthStatus(): Promise<{ isProtected: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/status`);
    if (!res.ok) return { isProtected: false };
    return res.json();
  } catch {
    return { isProtected: false };
  }
}

export async function verifyPasscode(password: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.valid) {
      setAuthToken(password);
      return { valid: true };
    }
    return { valid: false, error: data.error || 'Incorrect passcode' };
  } catch {
    return { valid: false, error: 'Could not connect to authentication service' };
  }
}

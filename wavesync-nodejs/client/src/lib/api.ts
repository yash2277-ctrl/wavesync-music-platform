// ─── Centralized API client ─────────────────────────────────────────────────

const TOKEN_KEY = 'wavesync-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('wavesync-user');
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };

  // Only set JSON content-type when body is not FormData
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token && opts.auth !== false) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string | null;
  bpm: number | null;
  duration: number | null;
  cover: string | null;
  streamUrl: string;
  plays: number;
  likes: number;
  lyrics: string | null;
  style: string | null;
  isAI: boolean;
  isPublished: boolean;
  uploadedBy: string | null;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  prompt: string;
  style: string;
  title: string;
  genre: string;
  mood: string;
  lyrics: string;
  isInstrumental: boolean;
  bpm: number;
  cover: string | null;
  trackId: string | null;
  streamUrl: string | null;
  progress: number;
  createdAt: string;
  completedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  bio?: string;
  avatar?: string | null;
}

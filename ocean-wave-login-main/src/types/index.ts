// ─── Core domain types ────────────────────────────────────────────────────────

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // seconds
  cover: string;    // image URL (from your AI music API)
  mood?: string;
  bpm?: number;
  audioUrl?: string; // streaming URL from your AI music API
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  cover?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export type ThemeName = 'ocean' | 'sunset' | 'midnight';

export type Mood = 'energetic' | 'chill' | 'focused' | 'party' | 'melancholy' | 'workout';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  trackIds: string[];
  trackCount: number;
}

interface LibraryContextType {
  likedIds: Set<string>;
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => Promise<void>;
  playlists: Playlist[];
  refreshPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const LIKED_KEY = 'ws-liked';

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')); }
    catch { return new Set(); }
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...likedIds]));
  }, [likedIds]);

  const refreshPlaylists = useCallback(async () => {
    if (!user) { setPlaylists([]); return; }
    try {
      const d = await api<{ data: Playlist[] }>('/api/playlists/mine');
      setPlaylists(d.data);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { refreshPlaylists(); }, [refreshPlaylists]);

  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds]);

  const toggleLike = useCallback(async (id: string) => {
    setLikedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    if (user) api(`/api/tracks/${id}/like`, { method: 'POST' }).catch(() => {});
  }, [user]);

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    if (!user) return null;
    const d = await api<{ playlist: Playlist }>('/api/playlists', {
      method: 'POST', body: JSON.stringify({ name, description }),
    });
    await refreshPlaylists();
    return d.playlist;
  }, [user, refreshPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    await api(`/api/playlists/${id}`, { method: 'DELETE' });
    await refreshPlaylists();
  }, [refreshPlaylists]);

  const addToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    await api(`/api/playlists/${playlistId}/tracks`, { method: 'POST', body: JSON.stringify({ trackId }) });
    await refreshPlaylists();
  }, [refreshPlaylists]);

  const removeFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    await api(`/api/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' });
    await refreshPlaylists();
  }, [refreshPlaylists]);

  return (
    <LibraryContext.Provider value={{
      likedIds, isLiked, toggleLike,
      playlists, refreshPlaylists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}

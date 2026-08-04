import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Playlist } from '../types';

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  getPlaylist: (id: string) => Playlist | undefined;
  likedTrackIds: Set<string>;
  toggleLike: (trackId: string) => void;
}

const STORAGE_KEY = 'wavesync_playlists';
const LIKED_KEY   = 'wavesync_liked';

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(LIKED_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...likedTrackIds]));
  }, [likedTrackIds]);

  const createPlaylist = (name: string, description?: string): Playlist => {
    const pl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      trackIds: [],
      createdAt: new Date().toISOString(),
    };
    setPlaylists(prev => [...prev, pl]);
    return pl;
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId && !p.trackIds.includes(trackId)
        ? { ...p, trackIds: [...p.trackIds, trackId] }
        : p
    ));
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId
        ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) }
        : p
    ));
  };

  const getPlaylist = (id: string) => playlists.find(p => p.id === id);

  const toggleLike = (trackId: string) => {
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  return (
    <PlaylistContext.Provider value={{
      playlists, createPlaylist, deletePlaylist,
      addTrackToPlaylist, removeTrackFromPlaylist, getPlaylist,
      likedTrackIds, toggleLike,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists(): PlaylistContextType {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistProvider');
  return ctx;
}

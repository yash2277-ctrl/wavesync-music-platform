import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: string[]; // Array of track IDs
  createdAt: string;
  updatedAt: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylist: (id: string) => Playlist | undefined;
  refreshPlaylists: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const loadPlaylists = () => {
      try {
        const stored = localStorage.getItem('wavesync_playlists');
        if (stored) {
          setPlaylists(JSON.parse(stored));
        } else {
          // Initialize with default playlists
          const defaultPlaylists: Playlist[] = [
            {
              id: '1',
              name: 'Chill Vibes',
              description: 'Relaxing oceanic sounds',
              tracks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Workout Mix',
              description: 'Energizing beats',
              tracks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              name: 'Focus Flow',
              description: 'Deep concentration',
              tracks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '4',
              name: 'Night Drive',
              description: 'Late night journeys',
              tracks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setPlaylists(defaultPlaylists);
          localStorage.setItem('wavesync_playlists', JSON.stringify(defaultPlaylists));
        }
      } catch (error) {
        console.error('Failed to load playlists:', error);
      }
    };

    loadPlaylists();
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (playlists.length > 0) {
      localStorage.setItem('wavesync_playlists', JSON.stringify(playlists));
    }
  }, [playlists]);

  const createPlaylist = async (name: string, description?: string): Promise<Playlist> => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const deletePlaylist = async (id: string): Promise<void> => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const updatePlaylist = async (id: string, updates: Partial<Playlist>): Promise<void> => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string): Promise<void> => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId && !p.tracks.includes(trackId)
          ? { ...p, tracks: [...p.tracks, trackId], updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<void> => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t !== trackId), updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const getPlaylist = (id: string): Playlist | undefined => {
    return playlists.find(p => p.id === id);
  };

  const refreshPlaylists = async (): Promise<void> => {
    // Force reload from localStorage
    const stored = localStorage.getItem('wavesync_playlists');
    if (stored) {
      setPlaylists(JSON.parse(stored));
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        updatePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        getPlaylist,
        refreshPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within PlaylistProvider');
  }
  return context;
}

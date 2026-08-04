import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { aiEngine } from '../services/aiRecommendations';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  path?: string;
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Track[];
  aiAutoPlayEnabled: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (tracks: Track[]) => void;
  toggleAIAutoPlay: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [aiAutoPlayEnabled, setAiAutoPlayEnabled] = useState(false);
  const [trackStartTime, setTrackStartTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userId = localStorage.getItem('userId') || 'guest';

  // Initialize audio element
  useEffect(() => {
    // Create a single audio element for the app lifecycle
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      // Track listening completion for AI
      if (currentTrack && currentTrack.genre) {
        const listenDuration = Date.now() - trackStartTime;
        const completed = listenDuration > (duration * 1000 * 0.8); // 80% completion
        aiEngine.trackListening(userId, currentTrack as any, completed, listenDuration);
      }
      
      setIsPlaying(false);
      
      // AI auto-play next track
      if (aiAutoPlayEnabled) {
        handleAIAutoPlay();
      } else {
        // Move to next track in playlist
        if (playlist.length > 0 && currentTrack) {
          const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
          const nextIndex = (currentIndex + 1) % playlist.length;
          if (nextIndex !== 0) {
            playTrack(playlist[nextIndex]);
          }
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  // Intentionally run once; internal state updates are handled inside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTrack = async (track: Track) => {
    if (!audioRef.current) return;

    try {
      const audio = audioRef.current;
      // Mark track as played
      if (track.id) {
        await fetch(`/api/tracks/${track.id}/play`, { method: 'POST' }).catch(() => {});
      }
      
      // Pause current audio before swapping source to avoid AbortError spam
      audio.pause();

      setCurrentTrack(track);
      setTrackStartTime(Date.now());
      const encodedId = encodeURIComponent(track.id);
      const primaryUrl = track.path && track.path.startsWith('http')
        ? track.path
        : `/api/stream/${encodedId}`;
      const fallbackUrl = `/api/public/play/${encodedId}`;

      console.log('Playing track:', track.title, 'from:', primaryUrl);
      audio.src = primaryUrl;
      audio.load();

      try {
        await audio.play();
      } catch (primaryErr: any) {
        // If primary stream fails, retry once on public play endpoint.
        if (!track.path || !track.path.startsWith('http')) {
          console.warn('Primary stream failed, retrying fallback:', primaryErr);
          audio.src = fallbackUrl;
          audio.load();
          await audio.play();
        } else {
          throw primaryErr;
        }
      }

      setIsPlaying(true);
    } catch (err: any) {
      // Ignore AbortError caused by rapid source swaps; log others
      if (err?.name !== 'AbortError') {
        console.error('Failed to play track:', err);
      }
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const handleAIAutoPlay = async () => {
    if (!currentTrack) return;

    try {
      // Fetch available tracks
      const response = await fetch('/api/library');
      const data = await response.json();
      const availableTracks = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        genre: t.genre,
        duration: t.duration,
        path: `/api/stream/${t.id}`,
      }));

      // Get AI recommendation for next track
      const recommendedTrack = aiEngine.getNextAutoPlayTrack(
        userId,
        currentTrack as any,
        availableTracks
      );

      if (recommendedTrack) {
        playTrack(recommendedTrack as Track);
      } else {
        // Fallback to regular next track
        goToNextTrack();
      }
    } catch (error) {
      console.error('AI auto-play error:', error);
      goToNextTrack();
    }
  };

  const goToNextTrack = () => {
    if (playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const previousTrack = () => {
    if (playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol / 100;
    setVolumeState(vol);
  };

  const toggleAIAutoPlay = () => {
    setAiAutoPlayEnabled(!aiAutoPlayEnabled);
    localStorage.setItem('aiAutoPlayEnabled', (!aiAutoPlayEnabled).toString());
  };

  // Load AI auto-play preference
  useEffect(() => {
    const saved = localStorage.getItem('aiAutoPlayEnabled');
    if (saved) {
      setAiAutoPlayEnabled(saved === 'true');
    }
    // Load user AI profile
    aiEngine.loadProfile(userId);
  }, [userId]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        playlist,
        aiAutoPlayEnabled,
        playTrack,
        togglePlay,
        nextTrack: goToNextTrack,
        previousTrack,
        seek,
        setVolume,
        setPlaylist,
        toggleAIAutoPlay,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
}

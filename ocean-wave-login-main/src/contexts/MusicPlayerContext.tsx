import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { Track } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MusicPlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

interface MusicPlayerActions {
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueue: (tracks: Track[], index?: number) => void;
}

type MusicPlayerContextType = MusicPlayerState & MusicPlayerActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Audio element setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audioRef.current = audio;

    const onTimeUpdate  = () => setCurrentTime(audio.currentTime);
    const onDuration    = () => setDuration(audio.duration || 0);
    const onEnded       = () => handleTrackEnd();
    const onPlay        = () => setIsPlaying(true);
    const onPause       = () => setIsPlaying(false);

    audio.addEventListener('timeupdate',      onTimeUpdate);
    audio.addEventListener('durationchange',  onDuration);
    audio.addEventListener('ended',           onEnded);
    audio.addEventListener('play',            onPlay);
    audio.addEventListener('pause',           onPause);

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Track-end handler (needs latest state via ref trick) ─────────────────────
  const stateRef = useRef({ queue, queueIndex, repeatMode, isShuffled });
  useEffect(() => {
    stateRef.current = { queue, queueIndex, repeatMode, isShuffled };
  }, [queue, queueIndex, repeatMode, isShuffled]);

  const handleTrackEnd = useCallback(() => {
    const { queue: q, queueIndex: idx, repeatMode: rm, isShuffled: sh } = stateRef.current;
    if (rm === 'one') {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play().catch(() => {});
      return;
    }
    if (q.length === 0) return;

    let nextIdx: number;
    if (sh) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= q.length) {
        if (rm === 'all') nextIdx = 0;
        else return; // stop
      }
    }
    setQueueIndex(nextIdx);
    setCurrentTrack(q[nextIdx]);
    // Audio src is set via useEffect below
  }, []);

  // ── Sync audio src when currentTrack changes ─────────────────────────────────
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audio = audioRef.current;
    // AI tracks don't have real audio files — we use a silent placeholder so
    // the UI works fully. When real AI audio URLs are available, set track.cover
    // to the audio URL and use it here.
    audio.src = ''; // no real audio yet — player UI still works
    audio.load();
    setCurrentTime(0);
    setDuration(currentTrack.duration); // use metadata duration
    audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setQueueState(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
    setCurrentTrack(track);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying, currentTrack]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = isShuffled
      ? Math.floor(Math.random() * queue.length)
      : (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
  }, [queue, queueIndex, isShuffled]);

  const previousTrack = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
  }, [queue, queueIndex, currentTime]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol / 100;
    setVolumeState(vol);
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.volume = next ? 0 : volume / 100;
    setIsMuted(next);
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => setIsShuffled(s => !s), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(m => m === 'none' ? 'all' : m === 'all' ? 'one' : 'none');
  }, []);

  const setQueue = useCallback((tracks: Track[], index = 0) => {
    setQueueState(tracks);
    setQueueIndex(index);
    if (tracks[index]) setCurrentTrack(tracks[index]);
  }, []);

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack, queue, queueIndex, isPlaying,
      currentTime, duration, volume, isMuted, isShuffled, repeatMode,
      playTrack, togglePlay, nextTrack, previousTrack,
      seek, setVolume, toggleMute, toggleShuffle, cycleRepeat, setQueue,
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer(): MusicPlayerContextType {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return ctx;
}

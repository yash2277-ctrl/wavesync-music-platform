import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { api, Track } from '@/lib/api';

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerContextType {
  current: Track | null;
  queue: Track[];
  index: number;
  isPlaying: boolean;
  time: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent]   = useState<Track | null>(null);
  const [queue, setQueue]       = useState<Track[]>([]);
  const [index, setIndex]       = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime]         = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVol]        = useState(() => Number(localStorage.getItem('ws-volume') ?? 80));
  const [muted, setMuted]       = useState(false);
  const [shuffle, setShuffle]   = useState(false);
  const [repeat, setRepeat]     = useState<RepeatMode>('none');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef({ queue, index, repeat, shuffle });
  useEffect(() => { stateRef.current = { queue, index, repeat, shuffle }; }, [queue, index, repeat, shuffle]);

  // ── init audio ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audioRef.current = audio;

    const onTime = () => setTime(audio.currentTime);
    const onDur  = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause= () => setIsPlaying(false);
    const onEnd  = () => handleEnd();

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDur);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playIndex = useCallback((q: Track[], i: number) => {
    const track = q[i];
    if (!track || !audioRef.current) return;
    setCurrent(track);
    setIndex(i);
    audioRef.current.src = track.streamUrl;
    audioRef.current.play().catch(() => setIsPlaying(false));
    api(`/api/tracks/${track.id}/play`, { method: 'POST', auth: false }).catch(() => {});
  }, []);

  const handleEnd = useCallback(() => {
    const { queue: q, index: i, repeat: r, shuffle: s } = stateRef.current;
    if (r === 'one') { audioRef.current!.currentTime = 0; audioRef.current!.play(); return; }
    if (q.length === 0) return;
    let ni = s ? Math.floor(Math.random() * q.length) : i + 1;
    if (ni >= q.length) {
      if (r === 'all') ni = 0;
      else { setIsPlaying(false); return; }
    }
    playIndex(q, ni);
  }, [playIndex]);

  const play = useCallback((track: Track, q?: Track[]) => {
    const newQueue = q ?? [track];
    const i = newQueue.findIndex(t => t.id === track.id);
    setQueue(newQueue);
    playIndex(newQueue, i >= 0 ? i : 0);
  }, [playIndex]);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    setQueue(tracks);
    playIndex(tracks, startIndex);
  }, [playIndex]);

  const toggle = useCallback(() => {
    if (!audioRef.current || !current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
  }, [isPlaying, current]);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    const ni = shuffle ? Math.floor(Math.random() * queue.length) : (index + 1) % queue.length;
    playIndex(queue, ni);
  }, [queue, index, shuffle, playIndex]);

  const prev = useCallback(() => {
    if (queue.length === 0) return;
    if (time > 3 && audioRef.current) { audioRef.current.currentTime = 0; return; }
    const pi = (index - 1 + queue.length) % queue.length;
    playIndex(queue, pi);
  }, [queue, index, time, playIndex]);

  const seek = useCallback((t: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = t;
    setTime(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = v / 100;
    setVol(v);
    localStorage.setItem('ws-volume', String(v));
    if (v > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const m = !muted;
    audioRef.current.volume = m ? 0 : volume / 100;
    setMuted(m);
  }, [muted, volume]);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const cycleRepeat = useCallback(() => setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none'), []);

  return (
    <PlayerContext.Provider value={{
      current, queue, index, isPlaying, time, duration, volume, muted, shuffle, repeat,
      play, toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat, playQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

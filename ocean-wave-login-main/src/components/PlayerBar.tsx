import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { usePlaylists } from '../contexts/PlaylistContext';

const fmt = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export function PlayerBar() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume, isMuted,
    isShuffled, repeatMode,
    togglePlay, nextTrack, previousTrack, seek, setVolume, toggleMute,
    toggleShuffle, cycleRepeat,
  } = useMusicPlayer();
  const { likedTrackIds, toggleLike } = usePlaylists();

  const isLiked = currentTrack ? likedTrackIds.has(currentTrack.id) : false;

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-20 md:h-24 bg-card/95 backdrop-blur-xl border-t border-border flex items-center gap-2 md:gap-4 px-3 md:px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* ── Track info ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 w-44 md:w-64 flex-shrink-0 relative z-10">
        {currentTrack ? (
          <>
            <img src={currentTrack.cover} alt={currentTrack.title} className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover flex-shrink-0 shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={() => toggleLike(currentTrack.id)}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Nothing playing</p>
          </div>
        )}
      </div>

      {/* ── Playback controls ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center gap-1 md:gap-2 max-w-xl mx-auto relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className={`w-8 h-8 ${isShuffled ? 'text-cyan-400' : ''}`} onClick={toggleShuffle}>
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-cyan-400" onClick={previousTrack} disabled={!currentTrack}>
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-transform disabled:opacity-40"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-cyan-400" onClick={nextTrack} disabled={!currentTrack}>
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button variant="ghost" size="icon" className={`w-8 h-8 ${repeatMode !== 'none' ? 'text-cyan-400' : ''}`} onClick={cycleRepeat}>
            <RepeatIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] md:text-xs text-muted-foreground w-8 text-right">{fmt(currentTime)}</span>
          <Slider
            value={[currentTrack ? currentTime : 0]}
            max={duration || 100}
            step={1}
            onValueChange={([v]) => seek(v)}
            className="flex-1 cursor-pointer"
            disabled={!currentTrack}
          />
          <span className="text-[10px] md:text-xs text-muted-foreground w-8">{fmt(duration)}</span>
        </div>
      </div>

      {/* ── Volume ─────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-2 w-32 xl:w-40 justify-end relative z-10">
        <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-cyan-400" onClick={toggleMute}>
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={([v]) => setVolume(v)}
          className="w-20 xl:w-24 cursor-pointer"
        />
      </div>
    </footer>
  );
}

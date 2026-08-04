import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Repeat1, Mic2, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { LyricsPanel } from './LyricsPanel';
import { QueuePanel } from './QueuePanel';

const fmt = (s: number) => !s || isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

export function PlayerBar() {
  const { current, isPlaying, time, duration, volume, muted, shuffle, repeat,
          toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const liked = current ? isLiked(current.id) : false;

  return (
    <>
      {showLyrics && current && <LyricsPanel track={current} onClose={() => setShowLyrics(false)} />}
      {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}

      <footer className="fixed bottom-0 inset-x-0 z-40 h-20 md:h-24 glass border-t border-border flex items-center gap-3 px-3 md:px-5">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          {current ? (
            <>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {current.cover
                  ? <img src={current.cover} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-grad flex items-center justify-center text-white font-bold">{current.title.charAt(0)}</div>}
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="font-medium text-sm truncate">{current.title}</p>
                <p className="text-xs text-muted-foreground truncate">{current.artist}</p>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0 hidden sm:flex" onClick={() => toggleLike(current.id)}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted" />
              <p className="text-sm text-muted-foreground hidden sm:block">Nothing playing</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className={`w-8 h-8 ${shuffle ? 'text-primary' : ''}`} onClick={toggleShuffle}><Shuffle className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={prev} disabled={!current}><SkipBack className="w-4 h-4" /></Button>
            <Button size="icon" onClick={toggle} disabled={!current} className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-foreground text-background hover:scale-105 transition-transform disabled:opacity-40">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={next} disabled={!current}><SkipForward className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className={`w-8 h-8 ${repeat !== 'none' ? 'text-primary' : ''}`} onClick={cycleRepeat}><RepeatIcon className="w-4 h-4" /></Button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] md:text-xs text-muted-foreground w-9 text-right tabular-nums">{fmt(time)}</span>
            <Slider value={[time]} max={duration || 100} step={1} onValueChange={([v]) => seek(v)} disabled={!current} className="flex-1 cursor-pointer" />
            <span className="text-[10px] md:text-xs text-muted-foreground w-9 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="w-[30%] flex items-center justify-end gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className={`w-8 h-8 ${showLyrics ? 'text-primary' : ''}`} onClick={() => { setShowLyrics(v => !v); setShowQueue(false); }} disabled={!current} title="Lyrics">
            <Mic2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className={`w-8 h-8 ${showQueue ? 'text-primary' : ''}`} onClick={() => { setShowQueue(v => !v); setShowLyrics(false); }} title="Queue">
            <ListMusic className="w-4 h-4" />
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleMute}>
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider value={[muted ? 0 : volume]} max={100} step={1} onValueChange={([v]) => setVolume(v)} className="w-20 cursor-pointer" />
          </div>
        </div>
      </footer>
    </>
  );
}

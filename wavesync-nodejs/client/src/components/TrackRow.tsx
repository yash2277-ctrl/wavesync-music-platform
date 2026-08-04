import { Play, Pause, Heart, MoreHorizontal, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Track } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Props {
  track: Track;
  queue?: Track[];
  index?: number;
}

const fmt = (s: number | null) => s ? `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}` : '--:--';

export function TrackRow({ track, queue, index }: Props) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const { isLiked, toggleLike, playlists, addToPlaylist } = useLibrary();
  const navigate = useNavigate();
  const active = current?.id === track.id;
  const liked = isLiked(track.id);

  const handlePlay = () => active ? toggle() : play(track, queue ?? [track]);

  return (
    <div className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-primary/10' : 'hover:bg-card-hover'}`}>
      {/* index / play */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <span className={`text-sm tabular-nums group-hover:hidden ${active ? 'text-primary' : 'text-muted-foreground'}`}>
          {active && isPlaying ? '♪' : (index !== undefined ? index + 1 : '')}
        </span>
        <button onClick={handlePlay} className="hidden group-hover:flex text-foreground">
          {active && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* title + cover */}
      <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={handlePlay}>
        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          {track.cover ? <img src={track.cover} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-grad flex items-center justify-center text-white font-bold">{track.title.charAt(0)}</div>}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`font-medium truncate ${active ? 'text-primary' : ''}`}>{track.title}</p>
            {track.isAI && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>
      </div>

      {/* album (desktop) */}
      <p className="hidden md:block text-sm text-muted-foreground truncate">{track.album}</p>

      {/* like (desktop) */}
      <button onClick={() => toggleLike(track.id)} className="hidden md:block">
        <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-primary text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`} />
      </button>

      {/* duration + menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm text-muted-foreground tabular-nums hidden sm:block">{fmt(track.duration)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-border">
            <DropdownMenuItem onClick={() => toggleLike(track.id)}>
              <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-primary text-primary' : ''}`} /> {liked ? 'Unlike' : 'Like'}
            </DropdownMenuItem>
            {track.uploadedBy && (
              <DropdownMenuItem onClick={() => navigate(`/artist/${track.uploadedBy}`)}>
                Go to artist
              </DropdownMenuItem>
            )}
            {playlists.map(pl => (
              <DropdownMenuItem key={pl.id} onClick={() => addToPlaylist(pl.id, track.id)}>
                <Plus className="w-4 h-4 mr-2" /> Add to {pl.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

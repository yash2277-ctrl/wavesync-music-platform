import { Play, Pause, Heart, MoreVertical, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { usePlaylists } from '../contexts/PlaylistContext';
import type { Track } from '../types';

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  index?: number;
  variant?: 'grid' | 'list';
}

export function TrackCard({ track, queue, index, variant = 'grid' }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();
  const { likedTrackIds, toggleLike, playlists, addTrackToPlaylist } = usePlaylists();

  const isActive  = currentTrack?.id === track.id;
  const isLiked   = likedTrackIds.has(track.id);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playTrack(track, queue ?? [track]);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: (index ?? 0) * 0.04 }}
        className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-card/60 border border-transparent'}`}
        onClick={handlePlay}
      >
        {/* Index / play indicator */}
        <div className="w-6 text-center flex-shrink-0">
          {isActive && isPlaying ? (
            <span className="text-cyan-400 text-sm">♫</span>
          ) : (
            <span className="text-muted-foreground text-sm group-hover:hidden">{(index ?? 0) + 1}</span>
          )}
          <Play className="w-4 h-4 text-white hidden group-hover:block" fill="white" />
        </div>

        {/* Cover */}
        <img src={track.cover} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isActive ? 'text-cyan-400' : ''}`}>{track.title}</p>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>

        {/* Genre badge */}
        <span className="hidden md:block text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 flex-shrink-0">{track.genre}</span>

        {/* Duration */}
        <span className="text-sm text-muted-foreground flex-shrink-0">{formatDuration(track.duration)}</span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => toggleLike(track.id)}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-cyan-500/20">
              {playlists.map(pl => (
                <DropdownMenuItem key={pl.id} onClick={() => addTrackToPlaylist(pl.id, track.id)}>
                  <Plus className="w-4 h-4 mr-2" /> Add to {pl.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  // Grid variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index ?? 0) * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`group relative bg-card/80 backdrop-blur-sm rounded-2xl p-4 cursor-pointer border transition-all ${isActive ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-transparent hover:border-cyan-500/20'}`}
      onClick={handlePlay}
    >
      {/* Cover */}
      <div className="relative mb-4 rounded-xl overflow-hidden aspect-square">
        <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            {isActive && isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
          </div>
        </div>

      </div>

      {/* Info */}
      <p className={`font-semibold truncate mb-1 ${isActive ? 'text-cyan-400' : ''}`}>{track.title}</p>
      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>

      {/* Like button */}
      <button
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => { e.stopPropagation(); toggleLike(track.id); }}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
      </button>
    </motion.div>
  );
}

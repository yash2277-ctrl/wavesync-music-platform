import { Play, Pause, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/contexts/PlayerContext';
import { Track } from '@/lib/api';

interface Props {
  track: Track;
  queue?: Track[];
  subtitle?: string;
}

export function TrackCard({ track, queue, subtitle }: Props) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const active = current?.id === track.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    active ? toggle() : play(track, queue ?? [track]);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative bg-card hover:bg-card-hover rounded-xl p-3 cursor-pointer transition-colors"
      onClick={handlePlay}
    >
      <div className="relative mb-3 rounded-lg overflow-hidden aspect-square bg-muted">
        {track.cover
          ? <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-grad flex items-center justify-center text-3xl font-bold text-white">{track.title.charAt(0)}</div>}

        {track.isAI && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        )}

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ scale: 1.08 }}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-grad shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity glow"
          onClick={handlePlay}
        >
          {active && isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
        </motion.button>
      </div>

      <p className={`font-semibold truncate ${active ? 'text-primary' : ''}`}>{track.title}</p>
      <p className="text-sm text-muted-foreground truncate">{subtitle ?? track.artist}</p>
    </motion.div>
  );
}

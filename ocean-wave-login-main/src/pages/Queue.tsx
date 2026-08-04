import { motion } from 'framer-motion';
import { ListMusic, Play, Pause, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

export default function Queue() {
  const { queue, queueIndex, currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useMusicPlayer();

  const clearQueue = () => setQueue([], 0);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListMusic className="w-8 h-8 text-cyan-400" /> Queue
        </h1>
        {queue.length > 0 && (
          <Button variant="outline" onClick={clearQueue}>Clear Queue</Button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <ListMusic className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Queue is empty.</p>
          <p className="text-sm text-muted-foreground mt-1">Play a track or mood to fill the queue.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((track, i) => {
            const isActive = i === queueIndex;
            return (
              <motion.div
                key={`${track.id}-${i}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-card/60 border border-transparent'}`}
              >
                <span className="w-6 text-center text-sm text-muted-foreground flex-shrink-0">{i + 1}</span>
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isActive ? 'text-cyan-400' : ''}`}>{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0"
                  onClick={() => isActive ? togglePlay() : playTrack(track, queue)}>
                  {isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

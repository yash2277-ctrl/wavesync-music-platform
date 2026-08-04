import { motion } from 'framer-motion';
import { X, ListMusic, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

export function QueuePanel({ onClose }: { onClose: () => void }) {
  const { queue, index, current, isPlaying, play, toggle } = usePlayer();

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed right-0 top-0 bottom-20 md:bottom-24 z-40 w-full sm:w-96 glass border-l border-border flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2"><ListMusic className="w-4 h-4 text-primary" /> Queue</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <ListMusic className="w-10 h-10 opacity-40" />
            <p>Queue is empty</p>
          </div>
        ) : (
          queue.map((t, i) => {
            const active = i === index;
            return (
              <div key={`${t.id}-${i}`}
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer ${active ? 'bg-primary/10' : 'hover:bg-card-hover'}`}
                onClick={() => active ? toggle() : play(t, queue)}>
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                  {t.cover ? <img src={t.cover} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-grad flex items-center justify-center text-white text-sm font-bold">{t.title.charAt(0)}</div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    {active && isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${active ? 'text-primary' : ''}`}>{t.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.artist}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

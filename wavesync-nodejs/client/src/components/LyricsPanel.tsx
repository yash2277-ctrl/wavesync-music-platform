import { motion } from 'framer-motion';
import { X, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track } from '@/lib/api';

export function LyricsPanel({ track, onClose }: { track: Track; onClose: () => void }) {
  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed right-0 top-0 bottom-20 md:bottom-24 z-40 w-full sm:w-96 glass border-l border-border flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2"><Mic2 className="w-4 h-4 text-primary" /> Lyrics</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {track.cover ? <img src={track.cover} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-grad flex items-center justify-center text-white font-bold">{track.title.charAt(0)}</div>}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{track.title}</p>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {track.lyrics ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{track.lyrics}</pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <Mic2 className="w-10 h-10 opacity-40" />
            <p>No lyrics for this track</p>
            {track.isAI ? null : <p className="text-xs">This may be an instrumental.</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

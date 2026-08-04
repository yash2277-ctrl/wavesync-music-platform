import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { api, Track } from '@/lib/api';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';

export default function Liked() {
  const { likedIds } = useLibrary();
  const { playQueue } = usePlayer();
  const [all, setAll] = useState<Track[]>([]);

  useEffect(() => {
    api<{ data: Track[] }>('/api/tracks?limit=100').then(d => setAll(d.data)).catch(() => {});
  }, []);

  const liked = all.filter(t => likedIds.has(t.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-end gap-6">
        <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart className="w-20 h-20 text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Playlist</p>
          <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
          <p className="text-muted-foreground">{liked.length} {liked.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </div>

      {liked.length > 0 ? (
        <>
          <Button onClick={() => playQueue(liked)} className="rounded-full w-14 h-14 bg-grad text-white p-0">
            <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
          </Button>
          <div className="bg-card/50 rounded-xl p-2">
            {liked.map((t, i) => <TrackRow key={t.id} track={t} queue={liked} index={i} />)}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center gap-3">
          <Heart className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No liked songs yet</p>
          <p className="text-sm text-muted-foreground/60">Tap the heart on any track to save it here.</p>
        </div>
      )}
    </motion.div>
  );
}

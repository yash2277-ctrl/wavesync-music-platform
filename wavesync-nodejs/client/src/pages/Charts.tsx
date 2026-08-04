import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Play } from 'lucide-react';
import { api, Track } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';

export default function Charts() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playQueue } = usePlayer();

  useEffect(() => {
    api<{ data: Track[] }>('/api/tracks/trending?limit=50')
      .then(d => setTracks(d.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-grad p-8">
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">CHART</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-10 h-10" /> Top 50
            </h1>
            <p className="text-white/80 mt-2">The most played AI tracks right now</p>
          </div>
          {tracks.length > 0 && (
            <Button onClick={() => playQueue(tracks)} className="bg-white text-black hover:bg-white/90 rounded-full w-14 h-14 hidden sm:flex">
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            </Button>
          )}
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-card animate-pulse" />)}</div>
      ) : tracks.length > 0 ? (
        <div className="bg-card/50 rounded-xl p-2">
          {tracks.map((t, i) => <TrackRow key={t.id} track={t} queue={tracks} index={i} />)}
        </div>
      ) : (
        <p className="text-muted-foreground py-16 text-center">No charts yet. Songs appear here as they get played.</p>
      )}
    </motion.div>
  );
}

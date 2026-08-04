import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface Artist {
  id: string; username: string; bio: string; avatar: string | null;
  trackCount: number; totalPlays: number; followers: number;
}

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ data: Artist[] }>('/api/artists').then(d => setArtists(d.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Mic2 className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold">Artists</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-full bg-card animate-pulse" />)}
        </div>
      ) : artists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artists.map(a => (
            <Link key={a.id} to={`/artist/${a.id}`}>
              <motion.div whileHover={{ y: -4 }} className="bg-card hover:bg-card-hover rounded-xl p-4 text-center transition-colors">
                <div className="w-full aspect-square rounded-full bg-grad flex items-center justify-center mb-3 text-4xl font-bold text-white">
                  {a.username.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold truncate">{a.username}</p>
                <p className="text-xs text-muted-foreground">{a.trackCount} tracks · {a.followers} followers</p>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center gap-3">
          <Mic2 className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No artists yet</p>
          <p className="text-sm text-muted-foreground/60">Publish songs to appear here as an artist.</p>
        </div>
      )}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, UserPlus, UserCheck } from 'lucide-react';
import { api, Track } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ArtistProfile {
  id: string; username: string; bio: string; followers: number;
  isFollowing: boolean; totalPlays: number; trackCount: number; tracks: Track[];
}

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { playQueue } = usePlayer();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => api<{ artist: ArtistProfile }>(`/api/artists/${id}`).then(d => setArtist(d.artist)).catch(() => setArtist(null)).finally(() => setLoading(false));
  useEffect(load, [id]);

  const follow = async () => {
    try {
      const d = await api<{ following: boolean }>(`/api/artists/${id}/follow`, { method: 'POST' });
      setArtist(a => a ? { ...a, isFollowing: d.following, followers: a.followers + (d.following ? 1 : -1) } : a);
    } catch (e: any) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
  };

  if (loading) return <div className="h-64 rounded-2xl bg-card animate-pulse" />;
  if (!artist) return <p className="text-muted-foreground py-16 text-center">Artist not found.</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-grad p-8">
        <div className="relative z-10 flex items-end gap-6">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-5xl font-bold text-white flex-shrink-0">
            {artist.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">ARTIST</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{artist.username}</h1>
            <p className="text-white/80 mt-2">{artist.followers} followers · {artist.totalPlays.toLocaleString()} plays · {artist.trackCount} tracks</p>
            {artist.bio && <p className="text-white/70 text-sm mt-1 max-w-lg">{artist.bio}</p>}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={() => artist.tracks.length && playQueue(artist.tracks)} disabled={!artist.tracks.length}
          className="rounded-full w-14 h-14 bg-grad text-white p-0"><Play className="w-6 h-6 ml-0.5" fill="currentColor" /></Button>
        <Button variant="outline" onClick={follow} className="gap-2 rounded-full">
          {artist.isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
        </Button>
      </div>

      {/* Tracks */}
      <section>
        <h2 className="text-xl font-bold mb-3">Popular</h2>
        {artist.tracks.length > 0 ? (
          <div className="bg-card/50 rounded-xl p-2">
            {artist.tracks.map((t, i) => <TrackRow key={t.id} track={t} queue={artist.tracks} index={i} />)}
          </div>
        ) : <p className="text-muted-foreground py-8 text-center">No published tracks yet.</p>}
      </section>
    </motion.div>
  );
}

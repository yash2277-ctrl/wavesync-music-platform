import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trash2, Music } from 'lucide-react';
import { api, Track } from '@/lib/api';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FullPlaylist {
  id: string; name: string; description: string; trackCount: number; tracks: Track[];
}

export default function Playlist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deletePlaylist } = useLibrary();
  const { playQueue } = usePlayer();
  const [pl, setPl] = useState<FullPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api<{ playlist: FullPlaylist }>(`/api/playlists/${id}`)
      .then(d => setPl(d.playlist)).catch(() => setPl(null)).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const remove = async () => {
    if (!pl || !confirm(`Delete "${pl.name}"?`)) return;
    await deletePlaylist(pl.id);
    toast({ title: 'Playlist deleted' });
    navigate('/library');
  };

  if (loading) return <div className="space-y-4"><div className="h-48 rounded-2xl bg-card animate-pulse" /></div>;
  if (!pl) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted-foreground">Playlist not found.</p>
      <Button variant="outline" onClick={() => navigate('/library')}>Back to Library</Button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-end gap-6">
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-grad flex items-center justify-center shadow-2xl flex-shrink-0">
          <span className="text-6xl md:text-8xl font-bold text-white">{pl.name.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground mb-1">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 truncate">{pl.name}</h1>
          {pl.description && <p className="text-muted-foreground mb-1">{pl.description}</p>}
          <p className="text-sm text-muted-foreground">{pl.trackCount} tracks</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => pl.tracks.length && playQueue(pl.tracks)} disabled={!pl.tracks.length}
          className="rounded-full w-14 h-14 bg-grad text-white p-0"><Play className="w-6 h-6 ml-0.5" fill="currentColor" /></Button>
        <Button variant="ghost" size="icon" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-5 h-5" /></Button>
      </div>

      {pl.tracks.length > 0 ? (
        <div className="bg-card/50 rounded-xl p-2">
          {pl.tracks.map((t, i) => <TrackRow key={t.id} track={t} queue={pl.tracks} index={i} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
          <Music className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">This playlist is empty</p>
          <p className="text-sm text-muted-foreground/60">Add tracks from Search, Browse or any track menu.</p>
        </div>
      )}
    </motion.div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trash2, ArrowLeft, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { usePlaylists } from '../contexts/PlaylistContext';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { getTracks } from '../data/tracks';
import { TrackCard } from '../components/TrackCard';

export default function Playlist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlaylist, deletePlaylist } = usePlaylists();
  const { setQueue } = useMusicPlayer();

  const playlist = id ? getPlaylist(id) : undefined;
  const tracks = playlist
    ? getTracks().filter(t => playlist.trackIds.includes(t.id))
    : [];

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground text-lg">Playlist not found.</p>
        <Button variant="outline" onClick={() => navigate('/library')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-6">
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl flex-shrink-0">
          <span className="text-6xl md:text-8xl font-bold text-white">{playlist.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 truncate">{playlist.name}</h1>
          {playlist.description && <p className="text-muted-foreground mb-2">{playlist.description}</p>}
          <p className="text-sm text-muted-foreground">{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={() => tracks.length && setQueue(tracks, 0)} disabled={tracks.length === 0}
          className="rounded-full w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-black p-0">
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        </Button>
        <Button variant="ghost" size="icon"
          onClick={() => { deletePlaylist(playlist.id); navigate('/library'); }}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
          <Music className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">This playlist is empty.</p>
          <p className="text-sm text-muted-foreground/60">Add tracks from Search or Browse.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} queue={tracks} index={i} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}

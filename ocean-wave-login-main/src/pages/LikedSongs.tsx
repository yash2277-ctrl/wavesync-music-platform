import { motion } from 'framer-motion';
import { Heart, Play, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { usePlaylists } from '../contexts/PlaylistContext';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { getTracks } from '../data/tracks';
import { TrackCard } from '../components/TrackCard';

export default function LikedSongs() {
  const { likedTrackIds } = usePlaylists();
  const { setQueue } = useMusicPlayer();
  const liked = getTracks().filter(t => likedTrackIds.has(t.id));

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-6">
        <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart className="w-20 h-20 text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Playlist</p>
          <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
          <p className="text-muted-foreground">{liked.length} {liked.length === 1 ? 'track' : 'tracks'}</p>
        </div>
      </motion.div>

      {liked.length > 0 && (
        <Button onClick={() => setQueue(liked, 0)}
          className="rounded-full w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-black p-0">
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        </Button>
      )}

      {liked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center gap-3">
          <Music className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No liked songs yet.</p>
          <p className="text-sm text-muted-foreground/60">Heart any track to save it here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {liked.map((track, i) => (
            <TrackCard key={track.id} track={track} queue={liked} index={i} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}

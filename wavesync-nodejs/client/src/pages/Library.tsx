import { motion } from 'framer-motion';
import { Library as LibIcon, Plus, Music, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { Button } from '@/components/ui/button';

export default function Library() {
  const { playlists, createPlaylist } = useLibrary();
  const navigate = useNavigate();

  const create = async () => {
    const pl = await createPlaylist('New Playlist');
    if (pl) navigate(`/playlist/${pl.id}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3"><LibIcon className="w-7 h-7 text-primary" /> Your Library</h1>
        <Button onClick={create} className="bg-grad text-white gap-2"><Plus className="w-4 h-4" /> New Playlist</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Liked shortcut */}
        <Link to="/liked">
          <motion.div whileHover={{ y: -4 }} className="bg-card hover:bg-card-hover rounded-xl p-3 transition-colors">
            <div className="aspect-square rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3">
              <Heart className="w-12 h-12 text-white" fill="white" />
            </div>
            <p className="font-semibold truncate">Liked Songs</p>
            <p className="text-sm text-muted-foreground">Playlist</p>
          </motion.div>
        </Link>

        {playlists.map(pl => (
          <Link key={pl.id} to={`/playlist/${pl.id}`}>
            <motion.div whileHover={{ y: -4 }} className="bg-card hover:bg-card-hover rounded-xl p-3 transition-colors">
              <div className="aspect-square rounded-lg bg-grad flex items-center justify-center mb-3">
                <span className="text-3xl font-bold text-white">{pl.name.charAt(0)}</span>
              </div>
              <p className="font-semibold truncate">{pl.name}</p>
              <p className="text-sm text-muted-foreground">{pl.trackCount} tracks</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
          <Music className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Create your first playlist</p>
          <Button onClick={create} className="bg-grad text-white gap-2 mt-1"><Plus className="w-4 h-4" /> New Playlist</Button>
        </div>
      )}
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Library as LibraryIcon, Plus, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlaylists } from '../contexts/PlaylistContext';
import { getTracks } from '../data/tracks';
import { Button } from '../components/ui/button';
import { TrackCard } from '../components/TrackCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Library() {
  const { playlists, createPlaylist, likedTrackIds } = usePlaylists();
  const allTracks = getTracks();
  const likedTracks = allTracks.filter(t => likedTrackIds.has(t.id));

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LibraryIcon className="w-8 h-8 text-cyan-400" /> Your Library
        </h1>
        <Button onClick={() => createPlaylist('New Playlist')}
          className="bg-cyan-500 hover:bg-cyan-600 text-black gap-2">
          <Plus className="w-4 h-4" /> New Playlist
        </Button>
      </motion.div>

      <Tabs defaultValue="playlists">
        <TabsList className="mb-4">
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked Songs ({likedTracks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
              <Music className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No playlists yet.</p>
              <p className="text-sm text-muted-foreground/60">Create a playlist to organise your tracks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((pl, i) => (
                <motion.div key={pl.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/playlist/${pl.id}`} className="block group">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-cyan-500/20 transition-shadow">
                      <span className="text-4xl font-bold text-white">{pl.name.charAt(0)}</span>
                    </div>
                    <p className="font-semibold truncate group-hover:text-cyan-400 transition-colors">{pl.name}</p>
                    <p className="text-sm text-muted-foreground">{pl.trackIds.length} tracks</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked">
          {likedTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
              <Music className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No liked tracks yet.</p>
              <p className="text-sm text-muted-foreground/60">Heart a track to save it here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {likedTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} queue={likedTracks} index={i} variant="list" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

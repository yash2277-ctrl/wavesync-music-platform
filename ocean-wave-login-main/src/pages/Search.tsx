import { useState } from 'react';
import { Search as SearchIcon, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { TrackCard } from '../components/TrackCard';
import { searchTracks, getGenres, getTracks, getTracksByGenre } from '../data/tracks';
import type { Track } from '../types';

const GENRE_COLORS: Record<string, string> = {
  Ambient:      'from-blue-500 to-cyan-500',
  Electronic:   'from-cyan-500 to-teal-500',
  'Lo-Fi':      'from-indigo-500 to-purple-500',
  Synthpop:     'from-pink-500 to-rose-500',
  Focus:        'from-purple-500 to-indigo-500',
  Dance:        'from-orange-500 to-pink-500',
  Experimental: 'from-gray-600 to-slate-700',
  Synthwave:    'from-fuchsia-500 to-purple-600',
  Jazz:         'from-amber-600 to-orange-700',
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = getGenres();
  const allTracks = getTracks();

  const handleSearch = (q: string) => {
    setQuery(q);
    setSelectedGenre(null);
    setResults(q.trim().length > 1 ? searchTracks(q) : []);
  };

  const handleGenre = (genre: string) => {
    setSelectedGenre(genre);
    setQuery('');
    setResults(getTracksByGenre(genre));
  };

  return (
    <div className="space-y-8 pb-4">
      {/* Search input */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <div className="relative max-w-lg">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search tracks, artists, genres…"
            className="pl-11 h-12 text-base bg-card border-border rounded-xl"
          />
        </div>
      </motion.div>

      {/* Search / genre results */}
      {(query || selectedGenre) && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold mb-4">
            {selectedGenre ? `Genre: ${selectedGenre}` : `Results for "${query}"`}
            <span className="text-sm font-normal text-muted-foreground ml-2">({results.length} tracks)</span>
          </h2>
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((track, i) => (
                <TrackCard key={track.id} track={track} queue={results} index={i} variant="list" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">No tracks found.</p>
          )}
        </motion.section>
      )}

      {/* Genre grid — only when catalogue has genres */}
      {!query && !selectedGenre && genres.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre, i) => (
              <motion.button
                key={genre}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.04, y: -4 }}
                onClick={() => handleGenre(genre)}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${GENRE_COLORS[genre] ?? 'from-gray-600 to-gray-800'} p-6 h-28 text-left cursor-pointer`}
              >
                <p className="text-white font-bold text-lg relative z-10">{genre}</p>
                <p className="text-white/70 text-xs relative z-10">{getTracksByGenre(genre).length} tracks</p>
                <div className="absolute inset-0 bg-black/10" />
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* All tracks list */}
      {!query && !selectedGenre && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold mb-4">All Tracks</h2>
          {allTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
              <Music className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No tracks in the catalogue yet.</p>
              <p className="text-sm text-muted-foreground/60">Connect your AI music API to populate tracks.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {allTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} queue={allTracks} index={i} variant="list" />
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
}

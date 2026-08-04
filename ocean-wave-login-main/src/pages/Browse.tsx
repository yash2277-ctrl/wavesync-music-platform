import { motion } from 'framer-motion';
import { Sparkles, Music2, Zap, Music } from 'lucide-react';
import { getGenres, getMoods, getTracksByGenre, getTracksByMood } from '../data/tracks';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

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

const MOOD_COLORS: Record<string, string> = {
  chill:      'from-blue-400 to-cyan-400',
  energetic:  'from-orange-500 to-red-500',
  focused:    'from-purple-500 to-indigo-500',
  party:      'from-pink-500 to-rose-500',
  melancholy: 'from-slate-500 to-gray-600',
  workout:    'from-yellow-500 to-orange-500',
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
      <Music className="w-10 h-10 text-muted-foreground/40" />
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Browse() {
  const { setQueue } = useMusicPlayer();
  const genres = getGenres();
  const moods  = getMoods();

  return (
    <div className="space-y-12 pb-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Discover</h1>
          </div>
          <p className="text-white/80 text-lg">Explore AI music by genre and mood</p>
        </div>
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Browse by Genre */}
      <section>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <Music2 className="w-6 h-6 text-cyan-400" /> Browse by Genre
        </h2>
        {genres.length === 0 ? (
          <EmptyState label="No genres available yet. Add tracks to see genres here." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre, i) => {
              const tracks = getTracksByGenre(genre);
              return (
                <motion.button
                  key={genre}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  onClick={() => setQueue(tracks, 0)}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${GENRE_COLORS[genre] ?? 'from-gray-600 to-gray-800'} p-6 h-32 text-left cursor-pointer`}
                >
                  <p className="text-white font-bold text-xl relative z-10">{genre}</p>
                  <p className="text-white/70 text-sm relative z-10">{tracks.length} tracks</p>
                  <div className="absolute inset-0 bg-black/10" />
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* Browse by Mood */}
      <section>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" /> Browse by Mood
        </h2>
        {moods.length === 0 ? (
          <EmptyState label="No moods available yet. Add tracks with mood metadata to see them here." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {moods.map((mood, i) => {
              const tracks = getTracksByMood(mood);
              return (
                <motion.button
                  key={mood}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  onClick={() => setQueue(tracks, 0)}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${MOOD_COLORS[mood] ?? 'from-gray-600 to-gray-800'} p-8 h-40 text-left cursor-pointer`}
                >
                  <p className="text-white font-bold text-2xl capitalize relative z-10">{mood}</p>
                  <p className="text-white/70 text-sm relative z-10">{tracks.length} tracks</p>
                  <div className="absolute inset-0 bg-black/10" />
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

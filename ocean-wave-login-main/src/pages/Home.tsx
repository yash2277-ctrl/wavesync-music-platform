import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Music } from 'lucide-react';
import { getTracks, getTracksByMood, getMoods } from '../data/tracks';
import { TrackCard } from '../components/TrackCard';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { getStoredUser } from '../lib/auth';

const MOOD_GRADIENTS: Record<string, { gradient: string; emoji: string }> = {
  chill:      { gradient: 'from-blue-500 to-cyan-500',     emoji: '🌊' },
  energetic:  { gradient: 'from-orange-500 to-red-500',    emoji: '⚡' },
  focused:    { gradient: 'from-purple-500 to-indigo-500', emoji: '🧠' },
  party:      { gradient: 'from-pink-500 to-rose-500',     emoji: '🎉' },
  workout:    { gradient: 'from-yellow-500 to-orange-500', emoji: '💪' },
  melancholy: { gradient: 'from-slate-500 to-gray-600',    emoji: '🌙' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { setQueue } = useMusicPlayer();
  const user = getStoredUser();
  const tracks = getTracks();
  const moods = getMoods();
  const recentTracks = tracks.slice(0, 8);
  const featuredTracks = tracks.slice(8, 16);

  const playMood = (mood: string) => {
    const moodTracks = getTracksByMood(mood);
    if (moodTracks.length) setQueue(moodTracks, 0);
  };

  return (
    <div className="space-y-10 pb-4">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
          {getGreeting()}{user?.username ? `, ${user.username}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">Your AI music platform — zero copyright, infinite sound.</p>
      </motion.div>

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/30 via-cyan-600/20 to-blue-600/30 border border-cyan-500/20 p-6"
      >
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI-Generated Music</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Every track is composed by AI — no copyright, no royalties, stream freely.
            </p>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl" />
      </motion.div>

      {/* Mood stations — only shown when moods exist */}
      {moods.length > 0 && (
        <section>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" /> Browse by Mood
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {moods.map((mood, i) => {
              const style = MOOD_GRADIENTS[mood] ?? { gradient: 'from-gray-600 to-gray-800', emoji: '🎵' };
              return (
                <motion.button
                  key={mood}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => playMood(mood)}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} p-5 text-left cursor-pointer`}
                >
                  <div className="text-3xl mb-2">{style.emoji}</div>
                  <p className="text-white font-semibold text-sm capitalize">{mood}</p>
                  <div className="absolute inset-0 bg-black/10" />
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent tracks */}
      {recentTracks.length > 0 ? (
        <section>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" /> Latest Tracks
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentTracks.map((track, i) => (
              <TrackCard key={track.id} track={track} queue={recentTracks} index={i} variant="grid" />
            ))}
          </div>
        </section>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border text-center gap-3"
        >
          <Music className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">No tracks yet</p>
          <p className="text-sm text-muted-foreground/60 max-w-xs">
            Connect your AI music API and call <code className="text-cyan-400">setTracks()</code> to populate the catalogue.
          </p>
        </motion.div>
      )}

      {/* Featured tracks */}
      {featuredTracks.length > 0 && (
        <section>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> Featured
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {featuredTracks.map((track, i) => (
              <TrackCard key={track.id} track={track} queue={featuredTracks} index={i} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

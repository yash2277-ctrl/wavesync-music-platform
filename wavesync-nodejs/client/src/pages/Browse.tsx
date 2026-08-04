import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, Track } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackCard } from '@/components/TrackCard';

const COLORS = ['from-purple-500 to-pink-500','from-cyan-500 to-blue-600','from-orange-500 to-red-500','from-green-500 to-teal-500','from-fuchsia-500 to-purple-600','from-amber-500 to-orange-600','from-indigo-500 to-blue-500','from-rose-500 to-pink-600'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const active = params.get('genre');
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const { playQueue } = usePlayer();

  useEffect(() => {
    api<{ genres: string[] }>('/api/tracks/genres').then(d => setGenres(d.genres)).catch(() => {});
    api<{ moods: string[] }>('/api/tracks/moods').then(d => setMoods(d.moods)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!active) { setTracks([]); return; }
    api<{ data: Track[] }>(`/api/tracks?genre=${active}&limit=50`).then(d => setTracks(d.data)).catch(() => {});
  }, [active]);

  if (active) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <button onClick={() => setParams({})} className="text-sm text-muted-foreground hover:text-foreground">← All genres</button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold capitalize">{active}</h1>
          {tracks.length > 0 && <button onClick={() => playQueue(tracks)} className="px-5 py-2 rounded-full bg-grad text-white text-sm font-semibold">Play all</button>}
        </div>
        {tracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tracks.map(t => <TrackCard key={t.id} track={t} queue={tracks} />)}
          </div>
        ) : <p className="text-muted-foreground py-10 text-center">No tracks in this genre yet.</p>}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex items-center gap-3">
        <Compass className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold">Browse</h1>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((g, i) => (
            <motion.button key={g} whileHover={{ scale: 1.03, y: -4 }} onClick={() => setParams({ genre: g })}
              className={`relative h-32 rounded-2xl bg-gradient-to-br ${COLORS[i % COLORS.length]} p-5 text-left overflow-hidden`}>
              <span className="text-xl font-bold text-white capitalize relative z-10">{g}</span>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-xl bg-black/20 rotate-12" />
            </motion.button>
          ))}
          {genres.length === 0 && <p className="text-muted-foreground col-span-full py-8 text-center">No genres yet. Create songs to populate this.</p>}
        </div>
      </section>

      {moods.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Moods</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {moods.map((m, i) => (
              <motion.button key={m} whileHover={{ scale: 1.04 }} onClick={() => setParams({ genre: m })}
                className={`h-20 rounded-xl bg-gradient-to-br ${COLORS[(i+3) % COLORS.length]} flex items-center justify-center`}>
                <span className="font-bold text-white capitalize">{m}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api, Track } from '@/lib/api';
import { TrackRow } from '@/components/TrackRow';
import { useNavigate } from 'react-router-dom';

const GENRE_COLORS = ['from-purple-500 to-pink-500','from-cyan-500 to-blue-600','from-orange-500 to-red-500','from-green-500 to-teal-500','from-fuchsia-500 to-purple-600','from-amber-500 to-orange-600','from-indigo-500 to-blue-500','from-rose-500 to-pink-600'];

export default function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api<{ genres: string[] }>('/api/tracks/genres').then(d => setGenres(d.genres)).catch(() => {}); }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      api<{ data: Track[] }>(`/api/tracks?q=${encodeURIComponent(q)}&limit=50`)
        .then(d => setResults(d.data)).catch(() => setResults([])).finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Songs, artists, genres…" className="pl-12 h-12 text-base rounded-full" />
          {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {q.trim().length >= 2 ? (
        <section>
          <h2 className="text-xl font-bold mb-4">{results.length} result{results.length !== 1 && 's'}</h2>
          {results.length > 0 ? (
            <div className="bg-card/50 rounded-xl p-2">
              {results.map((t, i) => <TrackRow key={t.id} track={t} queue={results} index={i} />)}
            </div>
          ) : !searching && <p className="text-muted-foreground py-10 text-center">No tracks found for "{q}"</p>}
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-bold mb-4">Browse genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((g, i) => (
              <motion.button key={g} whileHover={{ scale: 1.03 }} onClick={() => navigate(`/browse?genre=${g}`)}
                className={`relative h-28 rounded-xl bg-gradient-to-br ${GENRE_COLORS[i % GENRE_COLORS.length]} p-4 text-left overflow-hidden`}>
                <span className="text-lg font-bold text-white capitalize relative z-10">{g}</span>
                <div className="absolute -right-3 -bottom-3 w-20 h-20 rounded-lg bg-black/20 rotate-12" />
              </motion.button>
            ))}
            {genres.length === 0 && <p className="text-muted-foreground col-span-full">No genres yet — create some songs first.</p>}
          </div>
        </section>
      )}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Wand2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, Track } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackCard } from '@/components/TrackCard';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Track[]>([]);
  const [recent, setRecent] = useState<Track[]>([]);
  const [latest, setLatest] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ data: Track[] }>('/api/tracks/trending?limit=12').catch(() => ({ data: [] })),
      api<{ data: Track[] }>('/api/tracks/recent?limit=8').catch(() => ({ data: [] })),
      api<{ data: Track[] }>('/api/tracks?sort=newest&limit=12').catch(() => ({ data: [] })),
    ]).then(([t, r, l]) => {
      setTrending(t.data); setRecent(r.data); setLatest(l.data); setLoading(false);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">{greeting()}{user ? `, ${user.username}` : ''}</h1>
        <p className="text-muted-foreground mt-1">Discover, create and stream AI music.</p>
      </div>

      {/* Create CTA banner */}
      <motion.div whileHover={{ scale: 1.005 }}
        className="relative overflow-hidden rounded-2xl bg-grad p-8 cursor-pointer"
        onClick={() => navigate('/create')}>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Make your own song</h2>
              <p className="text-white/80">Describe an idea — AI writes, composes and produces it.</p>
            </div>
          </div>
          <Button className="bg-white text-black hover:bg-white/90 gap-2 hidden sm:flex font-semibold">
            Create <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-card animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Trending */}
          {trending.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Trending Now</h2>
                <Button variant="ghost" size="sm" onClick={() => playQueue(trending)}>Play all</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trending.slice(0, 6).map(t => <TrackCard key={t.id} track={t} queue={trending} />)}
              </div>
            </section>
          )}

          {/* Recently played */}
          {recent.length > 0 && (
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-primary" /> Recently Played</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recent.slice(0, 6).map(t => <TrackCard key={t.id} track={t} queue={recent} />)}
              </div>
            </section>
          )}

          {/* Fresh AI drops */}
          {latest.length > 0 ? (
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-primary" /> Fresh AI Drops</h2>
              <div className="bg-card/50 rounded-xl p-2">
                {latest.map((t, i) => <TrackRow key={t.id} track={t} queue={latest} index={i} />)}
              </div>
            </section>
          ) : trending.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border text-center gap-3">
              <Sparkles className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">No music yet</p>
              <p className="text-sm text-muted-foreground/60">Be the first to create an AI song.</p>
              <Button onClick={() => navigate('/create')} className="bg-grad text-white gap-2 mt-2"><Wand2 className="w-4 h-4" /> Create now</Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

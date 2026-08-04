import { motion } from 'framer-motion';
import { Sparkles, Zap, Coffee, Brain, Music, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { getTracksByMood, getTracks, getMoods } from '../data/tracks';
import { useToast } from '../hooks/use-toast';

const MOOD_META: Record<string, { icon: React.ElementType; color: string; desc: string }> = {
  energetic:  { icon: Zap,     color: 'from-orange-500 to-red-500',    desc: 'High-energy tracks to power your day' },
  chill:      { icon: Coffee,  color: 'from-blue-500 to-cyan-500',     desc: 'Relaxing ambient and lo-fi' },
  focused:    { icon: Brain,   color: 'from-purple-500 to-indigo-500', desc: 'Concentration-optimised music' },
  party:      { icon: Music,   color: 'from-pink-500 to-rose-500',     desc: 'Dance and electronic bangers' },
  melancholy: { icon: Moon,    color: 'from-slate-500 to-gray-600',    desc: 'Emotional compositions' },
  workout:    { icon: Sun,     color: 'from-yellow-500 to-orange-500', desc: 'Maximum BPM tracks' },
};

export default function AIRadio() {
  const { setQueue } = useMusicPlayer();
  const { toast } = useToast();
  const allTracks = getTracks();
  const moods = getMoods();

  const startStation = (mood: string) => {
    const tracks = getTracksByMood(mood);
    if (!tracks.length) {
      toast({ title: 'No tracks for this mood yet', variant: 'destructive' });
      return;
    }
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
    toast({ title: `🎵 ${mood.charAt(0).toUpperCase() + mood.slice(1)} Station`, description: `Playing ${shuffled.length} tracks` });
  };

  const startRandom = () => {
    if (!allTracks.length) {
      toast({ title: 'No tracks available yet', variant: 'destructive' });
      return;
    }
    const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
    toast({ title: '🎲 Full Mix', description: `Playing all ${shuffled.length} tracks in random order` });
  };

  return (
    <div className="space-y-10 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Radio</h1>
          <p className="text-muted-foreground">Curated stations from AI-generated music</p>
        </div>
      </motion.div>

      {/* Full mix */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/20">
          <CardContent className="p-8 text-center space-y-4">
            <Sparkles className="w-14 h-14 mx-auto text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Full Mix</h2>
              <p className="text-muted-foreground">
                {allTracks.length > 0
                  ? `Shuffle all ${allTracks.length} tracks`
                  : 'No tracks available yet'}
              </p>
            </div>
            <Button size="lg" onClick={startRandom} disabled={allTracks.length === 0}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 disabled:opacity-40">
              <Sparkles className="w-5 h-5 mr-2" /> Start Mix
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood stations */}
      <section>
        <h2 className="text-xl font-bold mb-5">Mood Stations</h2>
        {moods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
            <Music className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No mood stations yet.</p>
            <p className="text-sm text-muted-foreground/60">Add tracks with mood metadata to enable stations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moods.map((mood, i) => {
              const meta = MOOD_META[mood] ?? { icon: Music, color: 'from-gray-600 to-gray-800', desc: '' };
              const count = getTracksByMood(mood).length;
              return (
                <motion.div
                  key={mood}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="cursor-pointer hover:border-cyan-500/30 transition-all group"
                    onClick={() => startStation(mood)}>
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <meta.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-1 capitalize">{mood}</h3>
                      <p className="text-sm text-muted-foreground">{meta.desc}</p>
                      <p className="text-xs text-muted-foreground mt-2">{count} tracks</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Why AI music */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" /> Why AI Music?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">✅ Zero Copyright</p>
                <p className="text-muted-foreground">AI-generated tracks carry no royalties or DMCA risk — stream and share freely.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🎵 Infinite Variety</p>
                <p className="text-muted-foreground">Generate unlimited unique compositions across any genre or mood on demand.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🚀 Deployable</p>
                <p className="text-muted-foreground">Build a music platform without licensing headaches — perfect for monetisation.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Music, Mic2, Play, Pause, Trash2, Check, Loader2, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api, GenerationJob, Track } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';

const STYLES = ['lo-fi','synthwave','pop','electronic','hiphop','ambient','rock','jazz','cinematic','house','trap','classical'];
const MOODS  = ['energetic','chill','focused','party','melancholy','workout','romantic','happy','dark','dreamy'];

const PROMPT_IDEAS = [
  'A dreamy lo-fi beat for late night coding',
  'Energetic synthwave with retro 80s vibes',
  'Chill acoustic guitar for a rainy afternoon',
  'Epic cinematic orchestral build-up',
  'Upbeat pop anthem about chasing dreams',
  'Dark ambient soundscape for deep focus',
];

// ── Job card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onChange }: { job: GenerationJob; onChange: () => void }) {
  const { toast } = useToast();
  const { play, current, isPlaying, toggle } = usePlayer();
  const [busy, setBusy] = useState(false);
  const generating = job.status === 'generating' || job.status === 'queued';
  const active = current?.id === job.trackId;

  const asTrack = (): Track => ({
    id: job.trackId!, title: job.title, artist: 'You', album: 'AI Singles',
    genre: job.genre, mood: job.mood, bpm: job.bpm, duration: null,
    cover: job.cover, streamUrl: job.streamUrl!, plays: 0, likes: 0,
    lyrics: job.lyrics, style: job.style, isAI: true, isPublished: false,
    uploadedBy: null, createdAt: job.createdAt,
  });

  const handlePlay = () => {
    if (!job.trackId) return;
    active ? toggle() : play(asTrack());
  };

  const publish = async () => {
    setBusy(true);
    try {
      await api(`/api/generate/jobs/${job.id}/publish`, { method: 'POST' });
      toast({ title: 'Published!', description: 'Your song is now in the public library.' });
      onChange();
    } catch (e: any) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api(`/api/generate/jobs/${job.id}`, { method: 'DELETE' });
      toast({ title: 'Deleted' });
      onChange();
    } catch (e: any) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
    finally { setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border">
      {/* Cover with state */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {generating ? (
          <div className="w-full h-full bg-grad/30 flex items-center justify-center">
            <div className="flex items-end gap-0.5 h-6">
              {[0,1,2,3].map(i => (
                <span key={i} className="w-1 bg-primary rounded-full equalizer-bar" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        ) : job.cover ? (
          <img src={job.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-grad flex items-center justify-center text-white font-bold">{job.title.charAt(0)}</div>
        )}
        {job.status === 'complete' && (
          <button onClick={handlePlay} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {active && isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{job.title}</p>
        <p className="text-sm text-muted-foreground truncate capitalize">{job.genre} · {job.mood}</p>
        {generating && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-primary">
            <Loader2 className="w-3 h-3 animate-spin" /> Generating…
          </div>
        )}
      </div>

      {/* Actions */}
      {job.status === 'complete' && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" onClick={publish} disabled={busy} className="bg-grad text-white gap-1 hover:brightness-110">
            <Check className="w-3.5 h-3.5" /> Publish
          </Button>
          <Button size="icon" variant="ghost" onClick={remove} disabled={busy} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      {job.status === 'failed' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-destructive">Failed</span>
          <Button size="icon" variant="ghost" onClick={remove}><Trash2 className="w-4 h-4" /></Button>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Create page ──────────────────────────────────────────────────────────
export default function Create() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'simple' | 'custom'>('simple');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('lo-fi');
  const [mood, setMood] = useState('chill');
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [instrumental, setInstrumental] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadJobs = async () => {
    try { const d = await api<{ data: GenerationJob[] }>('/api/generate/jobs'); setJobs(d.data); }
    catch { /* ignore */ }
  };

  useEffect(() => {
    loadJobs();
    pollRef.current = setInterval(() => {
      setJobs(prev => {
        if (prev.some(j => j.status === 'generating' || j.status === 'queued')) loadJobs();
        return prev;
      });
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const generate = async () => {
    if (tab === 'simple' && !prompt.trim()) { toast({ title: 'Describe your song first', variant: 'destructive' }); return; }
    if (tab === 'custom' && !style.trim() && !lyrics.trim()) { toast({ title: 'Add a style or lyrics', variant: 'destructive' }); return; }
    setGenerating(true);
    try {
      const body = tab === 'simple'
        ? { prompt, isInstrumental: instrumental }
        : { style, mood, title, lyrics, isInstrumental: instrumental };
      await api('/api/generate', { method: 'POST', body: JSON.stringify(body) });
      toast({ title: '🎵 Generating your song', description: 'It will appear below in a few seconds.' });
      setPrompt(''); setTitle(''); setLyrics('');
      await loadJobs();
    } catch (e: any) { toast({ title: 'Generation failed', description: e.message, variant: 'destructive' }); }
    finally { setGenerating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-grad flex items-center justify-center glow">
          <Wand2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Create</h1>
          <p className="text-muted-foreground">Turn an idea into a full song with AI</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator panel */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Tabs */}
          <div className="flex bg-secondary/50 rounded-xl p-1">
            {(['simple','custom'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-grad text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'simple' ? 'Simple' : 'Custom'}
              </button>
            ))}
          </div>

          {tab === 'simple' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Describe your song</Label>
                <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
                  placeholder="e.g. A dreamy lo-fi beat for late night coding…" className="resize-none" />
              </div>
              <div className="flex flex-wrap gap-2">
                {PROMPT_IDEAS.map(p => (
                  <button key={p} onClick={() => setPrompt(p)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-secondary hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Song title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STYLES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MOODS.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Lyrics</Label>
                <Textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={6} disabled={instrumental}
                  placeholder={instrumental ? 'Instrumental — no lyrics' : 'Write your own lyrics, or leave blank to auto-generate…'} className="resize-none font-mono text-sm" />
              </div>
            </div>
          )}

          {/* Instrumental toggle */}
          <button onClick={() => setInstrumental(v => !v)}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <span className={`w-10 h-6 rounded-full relative transition-colors ${instrumental ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${instrumental ? 'left-5' : 'left-1'}`} />
            </span>
            <div className="text-left">
              <p className="text-sm font-medium flex items-center gap-1.5"><Mic2 className="w-3.5 h-3.5" /> Instrumental</p>
              <p className="text-xs text-muted-foreground">Generate music without vocals</p>
            </div>
          </button>

          <Button onClick={generate} disabled={generating} className="w-full h-12 bg-grad text-white font-semibold gap-2 hover:brightness-110">
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</> : <><Sparkles className="w-4 h-4" /> Generate Song</>}
          </Button>
        </div>

        {/* Jobs panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><ListMusic className="w-4 h-4 text-primary" /> Your Generations</h2>
            {jobs.length > 0 && <span className="text-sm text-muted-foreground">{jobs.length}</span>}
          </div>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center gap-3">
              <Music className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No songs yet</p>
              <p className="text-sm text-muted-foreground/60">Generate your first AI track →</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map(j => <JobCard key={j.id} job={j} onChange={loadJobs} />)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Check, CloudUpload, Edit2, Eye, EyeOff, Heart, Loader2,
  Mic2, Music, Pause, Play, Plus, Radio, Sparkles, Trash2, Upload, Wand2, X
} from 'lucide-react';
import { api, GenerationJob, getToken, Track } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const GENRES = ['general', 'pop', 'electronic', 'hiphop', 'lo-fi', 'synthwave', 'ambient', 'rock', 'jazz', 'cinematic', 'house', 'acoustic'];
const MOODS = ['chill', 'energetic', 'focused', 'party', 'melancholy', 'workout', 'romantic', 'happy', 'dark', 'dreamy'];
const IDEAS = [
  'Midnight synthpop with a huge chorus',
  'Dreamy lo-fi study beat with soft piano',
  'High energy workout anthem with punchy drums',
  'Cinematic ambient track for a rainy city',
];

interface Stats {
  totalTracks: number;
  published: number;
  drafts: number;
  totalPlays: number;
  totalLikes: number;
  topTrack: Track | null;
}

const emptyStats: Stats = { totalTracks: 0, published: 0, drafts: 0, totalPlays: 0, totalLikes: 0, topTrack: null };

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="bg-card/80 border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', album: 'AI Singles', genre: 'general', mood: 'chill', bpm: '', isPublished: true });

  const chooseAudio = (file: File) => {
    setAudio(file);
    if (!form.title) setForm(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!audio) {
      toast({ title: 'Choose an audio file first', variant: 'destructive' });
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('audio', audio);
      if (cover) fd.append('cover', cover);
      Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
      const res = await fetch('/api/studio/upload', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      toast({ title: 'Track saved', description: form.isPublished ? 'It is live in the library.' : 'It is saved as a draft.' });
      setAudio(null);
      setCover(null);
      setPreview(null);
      setForm({ title: '', artist: '', album: 'AI Singles', genre: 'general', mood: 'chill', bpm: '', isPublished: true });
      onDone();
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div
        onClick={() => audioRef.current?.click()}
        onDrop={event => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file?.type.startsWith('audio/')) chooseAudio(file);
        }}
        onDragOver={event => event.preventDefault()}
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${audio ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/60'}`}
      >
        <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={event => event.target.files?.[0] && chooseAudio(event.target.files[0])} />
        {audio ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="w-9 h-9 text-primary" />
            <p className="font-semibold">{audio.name}</p>
            <p className="text-xs text-muted-foreground">{(audio.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <CloudUpload className="w-11 h-11 text-muted-foreground" />
            <p className="font-semibold">Drop audio here or browse</p>
            <p className="text-sm text-muted-foreground">MP3, WAV, M4A, FLAC and OGG are supported.</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_220px] gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Artist</Label>
            <Input value={form.artist} onChange={event => setForm(prev => ({ ...prev, artist: event.target.value }))} placeholder="Your artist name" />
          </div>
          <div className="space-y-1.5">
            <Label>Album</Label>
            <Input value={form.album} onChange={event => setForm(prev => ({ ...prev, album: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Genre</Label>
            <Select value={form.genre} onValueChange={value => setForm(prev => ({ ...prev, genre: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GENRES.map(item => <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mood</Label>
            <Select value={form.mood} onValueChange={value => setForm(prev => ({ ...prev, mood: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MOODS.map(item => <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cover Art</Label>
          <button type="button" onClick={() => coverRef.current?.click()} className="aspect-square w-full rounded-xl border-2 border-dashed border-border overflow-hidden bg-secondary/40">
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={event => {
              const file = event.target.files?.[0];
              if (!file) return;
              setCover(file);
              setPreview(URL.createObjectURL(file));
            }} />
            {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <span className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground"><Plus className="w-8 h-8" /> Add cover</span>}
          </button>
        </div>
      </div>

      <button type="button" onClick={() => setForm(prev => ({ ...prev, isPublished: !prev.isPublished }))} className="flex items-center gap-3 w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
        <span className={`w-10 h-6 rounded-full relative transition-colors ${form.isPublished ? 'bg-primary' : 'bg-muted'}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isPublished ? 'left-5' : 'left-1'}`} />
        </span>
        <span className="text-left">
          <span className="block text-sm font-medium">{form.isPublished ? 'Publish now' : 'Save as draft'}</span>
          <span className="block text-xs text-muted-foreground">{form.isPublished ? 'Visible in the streaming library.' : 'Only you can manage it in Studio.'}</span>
        </span>
      </button>

      <Button type="submit" disabled={busy || !audio} className="w-full h-11 bg-grad text-white gap-2">
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading</> : <><Upload className="w-4 h-4" /> Upload Track</>}
      </Button>
    </form>
  );
}

function StudioTrackRow({ track, onRefresh }: { track: Track; onRefresh: () => void }) {
  const { toast } = useToast();
  const { play, current, isPlaying, toggle } = usePlayer();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: track.title, artist: track.artist, album: track.album, genre: track.genre, mood: track.mood || 'chill' });
  const active = current?.id === track.id;

  const save = async () => {
    setBusy(true);
    try {
      await api(`/api/studio/tracks/${track.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      toast({ title: 'Track updated' });
      setEditing(false);
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async () => {
    setBusy(true);
    try {
      await api(`/api/studio/tracks/${track.id}/${track.isPublished ? 'unpublish' : 'publish'}`, { method: 'POST' });
      toast({ title: track.isPublished ? 'Moved to drafts' : 'Published' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Publish failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${track.title}"?`)) return;
    setBusy(true);
    try {
      await api(`/api/studio/tracks/${track.id}`, { method: 'DELETE' });
      toast({ title: 'Track deleted' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid md:grid-cols-5 gap-3">
          <Input value={form.title} onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))} className="md:col-span-2" />
          <Input value={form.artist} onChange={event => setForm(prev => ({ ...prev, artist: event.target.value }))} />
          <Input value={form.album} onChange={event => setForm(prev => ({ ...prev, album: event.target.value }))} />
          <Select value={form.genre} onValueChange={value => setForm(prev => ({ ...prev, genre: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{GENRES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          <Button size="sm" onClick={save} disabled={busy} className="bg-grad text-white"><Check className="w-4 h-4 mr-1" /> Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-colors ${active ? 'bg-primary/10 border-primary/40' : 'border-border bg-card/70 hover:bg-card-hover'}`}>
      <button onClick={() => active ? toggle() : play(track)} className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
        {track.cover ? <img src={track.cover} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full bg-grad text-white font-bold flex items-center justify-center">{track.title.charAt(0)}</span>}
        <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {active && isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`font-medium truncate ${active ? 'text-primary' : ''}`}>{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artist} - {track.album}</p>
      </div>
      <div className="hidden md:flex items-center gap-2">
        {track.isAI && <Badge className="bg-primary/15 text-primary border-primary/30"><Sparkles className="w-3 h-3 mr-1" /> AI</Badge>}
        <Badge variant="outline" className="capitalize">{track.genre}</Badge>
        <Badge className={track.isPublished ? 'bg-accent/15 text-accent border-accent/30' : 'bg-muted text-muted-foreground'}>{track.isPublished ? 'Live' : 'Draft'}</Badge>
      </div>
      <div className="hidden lg:flex text-sm text-muted-foreground gap-3">
        <span className="flex items-center gap-1"><Play className="w-3 h-3" />{track.plays}</span>
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{track.likes}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setEditing(true)} disabled={busy}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={togglePublish} disabled={busy}>{track.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={remove} disabled={busy}><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

function GenerationRow({ job, onRefresh }: { job: GenerationJob; onRefresh: () => void }) {
  const { toast } = useToast();
  const { play, current, isPlaying, toggle } = usePlayer();
  const [busy, setBusy] = useState(false);
  const active = current?.id === job.trackId;
  const isWorking = job.status === 'generating' || job.status === 'queued';

  const playGenerated = () => {
    if (!job.trackId || !job.streamUrl) return;
    const track: Track = {
      id: job.trackId,
      title: job.title,
      artist: 'You',
      album: 'AI Singles',
      genre: job.genre,
      mood: job.mood,
      bpm: job.bpm,
      duration: null,
      cover: job.cover,
      streamUrl: job.streamUrl,
      plays: 0,
      likes: 0,
      lyrics: job.lyrics,
      style: job.style,
      isAI: true,
      isPublished: false,
      uploadedBy: null,
      createdAt: job.createdAt,
    };
    active ? toggle() : play(track);
  };

  const publish = async () => {
    setBusy(true);
    try {
      await api(`/api/generate/jobs/${job.id}/publish`, { method: 'POST' });
      toast({ title: 'Published to library' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Publish failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api(`/api/generate/jobs/${job.id}`, { method: 'DELETE' });
      toast({ title: 'Generation deleted' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card/70 border border-border p-3">
      <button onClick={playGenerated} disabled={!job.trackId} className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
        {isWorking ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : job.cover ? <img src={job.cover} alt="" className="w-full h-full object-cover" /> : <Sparkles className="w-6 h-6 text-primary" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{job.title}</p>
        <p className="text-sm text-muted-foreground truncate capitalize">{job.genre} - {job.mood} - {job.bpm} BPM</p>
        {isWorking && <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden"><span className="block h-full bg-grad" style={{ width: `${job.progress || 12}%` }} /></div>}
      </div>
      <Badge className={job.status === 'complete' ? 'bg-accent/15 text-accent border-accent/30' : 'bg-primary/15 text-primary border-primary/30'}>{job.status}</Badge>
      {job.status === 'complete' && (
        <>
          <Button size="icon" variant="ghost" onClick={playGenerated}>{active && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
          <Button size="sm" onClick={publish} disabled={busy} className="bg-grad text-white">Publish</Button>
        </>
      )}
      <Button size="icon" variant="ghost" onClick={remove} disabled={busy} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
    </div>
  );
}

export default function Studio() {
  const { toast } = useToast();
  const { playQueue } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState(IDEAS[0]);
  const [style, setStyle] = useState('synthwave');
  const [generating, setGenerating] = useState(false);

  const published = useMemo(() => tracks.filter(track => track.isPublished), [tracks]);
  const drafts = useMemo(() => tracks.filter(track => !track.isPublished), [tracks]);

  const load = async () => {
    const [trackRes, statRes, jobRes] = await Promise.all([
      api<{ data: Track[] }>('/api/studio/my-tracks').catch(() => ({ data: [] })),
      api<Stats>('/api/studio/stats').catch(() => emptyStats),
      api<{ data: GenerationJob[] }>('/api/generate/jobs').catch(() => ({ data: [] })),
    ]);
    setTracks(trackRes.data);
    setStats(statRes);
    setJobs(jobRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      setJobs(prev => {
        if (prev.some(job => job.status === 'generating' || job.status === 'queued')) load();
        return prev;
      });
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  const generate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Add a song idea first', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      await api('/api/generate', { method: 'POST', body: JSON.stringify({ prompt, style }) });
      toast({ title: 'Generation started', description: 'Your AI song will show up in the generation queue.' });
      await load();
    } catch (error: any) {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="rounded-xl border border-border bg-card/70 p-5 md:p-6 overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-grad text-white flex items-center justify-center glow">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Creator Studio</h1>
                <p className="text-muted-foreground">Generate, upload, publish and manage your AI music catalog.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-3 mt-5">
              <StatCard icon={Music} label="Tracks" value={stats.totalTracks} />
              <StatCard icon={Radio} label="Live" value={stats.published} />
              <StatCard icon={EyeOff} label="Drafts" value={stats.drafts} />
              <StatCard icon={BarChart3} label="Plays" value={stats.totalPlays} />
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 border border-border p-4 space-y-3">
            <Label className="flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" /> Quick AI Song</Label>
            <Textarea value={prompt} onChange={event => setPrompt(event.target.value)} rows={3} className="resize-none" />
            <div className="flex gap-2">
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GENRES.filter(item => item !== 'general').map(item => <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={generate} disabled={generating} className="bg-grad text-white min-w-28">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {IDEAS.map(idea => <button key={idea} onClick={() => setPrompt(idea)} className="text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground hover:text-foreground">{idea}</button>)}
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="generate">AI Generations</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Your Tracks</h2>
              <p className="text-sm text-muted-foreground">{published.length} live, {drafts.length} draft</p>
            </div>
            <Button onClick={() => playQueue(tracks)} disabled={!tracks.length} variant="outline"><Play className="w-4 h-4 mr-2" /> Play All</Button>
          </div>
          {loading ? <div className="h-40 rounded-xl bg-card animate-pulse" /> : tracks.length ? (
            <div className="space-y-2">{tracks.map(track => <StudioTrackRow key={track.id} track={track} onRefresh={load} />)}</div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Music className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No tracks yet. Generate or upload your first song.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-3">
          {jobs.length ? jobs.map(job => <GenerationRow key={job.id} job={job} onRefresh={load} />) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No AI generations yet. Use Quick AI Song or the Create page.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload">
          <div className="rounded-xl border border-border bg-card/70 p-5">
            <UploadForm onDone={load} />
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Performance</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total plays</span><span>{stats.totalPlays}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total likes</span><span>{stats.totalLikes}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Publish rate</span><span>{stats.totalTracks ? Math.round((stats.published / stats.totalTracks) * 100) : 0}%</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Top Track</h3>
                {stats.topTrack ? <StudioTrackRow track={stats.topTrack} onRefresh={load} /> : <p className="text-sm text-muted-foreground">No plays yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

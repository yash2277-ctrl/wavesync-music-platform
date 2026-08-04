import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Music, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(email, password, name);
        toast({ title: 'Welcome to WaveSync!', description: 'Your account is ready.' });
      } else {
        await login(email, password);
        toast({ title: 'Welcome back!' });
      }
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Authentication failed', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-grad opacity-20 blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full opacity-20 blur-[120px] animate-pulse-glow" style={{ background: 'hsl(var(--accent))', animationDelay: '1.5s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 md:p-10 border border-border shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-grad flex items-center justify-center mb-4 glow">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">WaveSync</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Create & stream AI music
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-secondary/50 rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-grad text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label>Username</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="artistname" required className="pl-10 h-11" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="pl-10 h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-10 pr-10 h-11" />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-grad text-white font-semibold gap-2 hover:brightness-110 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signin' ? "New here? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-primary font-medium hover:underline">
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

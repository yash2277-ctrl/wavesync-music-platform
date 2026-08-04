import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import WaveBackground from '../components/ui/WaveBackground';
import WaveSyncLogo from '../components/ui/WaveSyncLogo';
import { signIn, signUp } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      if (password !== confirm) {
        toast({ title: "Passwords don't match", variant: 'destructive' });
        return;
      }
      if (!agreed) {
        toast({ title: 'Please agree to the terms', variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    // Simulate a brief loading state for UX
    await new Promise(r => setTimeout(r, 800));

    try {
      if (mode === 'signup') {
        signUp(email, password, name);
        toast({ title: 'Welcome to WaveSync AI!', description: 'Your account has been created.' });
      } else {
        signIn(email, password);
        toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
      }
      navigate('/');
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setPassword(''); setConfirm('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <WaveBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0f1e28]/85 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <WaveSyncLogo />
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' ? 'Sign in to your AI music experience' : 'Join the future of music'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/5">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-cyan-500/50" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-cyan-500/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-cyan-500/50" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input type={showCf ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-cyan-500/50" />
                  <button type="button" onClick={() => setShowCf(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)}
                  className="mt-0.5 border-gray-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" />
                <Label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer leading-relaxed">
                  I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>
                </Label>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">Forgot password?</a>
              </div>
            )}

            <Button type="submit" disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-semibold rounded-xl gap-2 group shadow-lg shadow-cyan-500/20">
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={switchMode} className="text-cyan-400 hover:text-cyan-300 font-medium">
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

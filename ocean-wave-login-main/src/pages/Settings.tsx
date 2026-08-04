import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Monitor, LogOut, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { signOut, getStoredUser } from '../lib/auth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/use-toast';
import { useState, useEffect } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, themeLabel } = useTheme();
  const user = getStoredUser();

  const [autoplay, setAutoplay] = useState(true);
  const [normalise, setNormalise] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem('wavesync-settings');
    if (s) {
      const p = JSON.parse(s);
      setAutoplay(p.autoplay ?? true);
      setNormalise(p.normalise ?? true);
    }
  }, []);

  const save = (key: string, val: unknown) => {
    const s = JSON.parse(localStorage.getItem('wavesync-settings') || '{}');
    localStorage.setItem('wavesync-settings', JSON.stringify({ ...s, [key]: val }));
  };

  const handleLogout = () => {
    signOut();
    toast({ title: 'Logged out' });
    navigate('/login');
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5 text-cyan-400" /> {title}
      </h2>
      <div className="bg-card rounded-2xl p-5 space-y-4 border border-border">{children}</div>
    </div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">{label}</p>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl pb-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-cyan-400" /> Settings
      </h1>

      {/* Account */}
      <Section title="Account" icon={Monitor}>
        <Row label="Username" desc={user?.email}>
          <span className="font-semibold text-cyan-400">{user?.username}</span>
        </Row>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Moon}>
        <Row label="Theme" desc={`Current: ${themeLabel}`}>
          <Select value={theme} onValueChange={v => { document.documentElement.setAttribute('data-theme', v); localStorage.setItem('wavesync-theme', v); }}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ocean"><Sun className="w-4 h-4 inline mr-2" />Ocean</SelectItem>
              <SelectItem value="sunset"><Moon className="w-4 h-4 inline mr-2" />Sunset</SelectItem>
              <SelectItem value="midnight"><Monitor className="w-4 h-4 inline mr-2" />Midnight</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      {/* Playback */}
      <Section title="Playback" icon={SettingsIcon}>
        <Row label="Autoplay" desc="Continue playing similar tracks when queue ends">
          <Switch checked={autoplay} onCheckedChange={v => { setAutoplay(v); save('autoplay', v); }} />
        </Row>
        <Row label="Normalise Volume" desc="Keep consistent volume across all tracks">
          <Switch checked={normalise} onCheckedChange={v => { setNormalise(v); save('normalise', v); }} />
        </Row>
      </Section>

      {/* About */}
      <Section title="About" icon={Info}>
        <Row label="Version"><span className="text-muted-foreground">1.0.0</span></Row>
        <Row label="Music Source"><span className="text-cyan-400 text-sm">100% AI-Generated</span></Row>
        <Row label="Copyright"><span className="text-green-400 text-sm">None — freely deployable</span></Row>
      </Section>

      <Button onClick={handleLogout} variant="destructive" className="w-full gap-2">
        <LogOut className="w-4 h-4" /> Log Out
      </Button>
    </motion.div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, Music, X, Sparkles, Radio, Compass, Plus, TrendingUp, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/contexts/LibraryContext';
import { useState } from 'react';

interface Props { open: boolean; onClose: () => void; }

const MAIN = [
  { icon: Home,       label: 'Home',      to: '/' },
  { icon: Search,     label: 'Search',    to: '/search' },
  { icon: Compass,    label: 'Browse',    to: '/browse' },
  { icon: TrendingUp, label: 'Charts',    to: '/charts' },
];

const DISCOVER = [
  { icon: Radio,  label: 'AI Radio',  to: '/ai-radio' },
  { icon: Mic2,   label: 'Artists',   to: '/artists' },
  { icon: Heart,  label: 'Liked',     to: '/liked' },
  { icon: Library,label: 'Library',   to: '/library' },
];

export function Sidebar({ open, onClose }: Props) {
  const { playlists, createPlaylist } = useLibrary();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50'
    }`;

  const handleCreate = async () => {
    if (!name.trim()) return;
    const pl = await createPlaylist(name.trim());
    setName(''); setCreating(false);
    if (pl) navigate(`/playlist/${pl.id}`);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col border-r border-sidebar-border transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-grad flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">WaveSync</span>
          </button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        {/* Create button (Suno-style) */}
        <div className="px-3 mb-2">
          <Button onClick={() => { navigate('/create'); onClose(); }}
            className="w-full bg-grad text-white font-semibold gap-2 h-11 hover:brightness-110">
            <Sparkles className="w-4 h-4" /> Create Song
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {MAIN.map(i => (
            <NavLink key={i.to} to={i.to} end={i.to === '/'} onClick={onClose} className={link}>
              <i.icon className="w-5 h-5" /> {i.label}
            </NavLink>
          ))}

          <div className="pt-4 pb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discover</div>
          {DISCOVER.map(i => (
            <NavLink key={i.to} to={i.to} onClick={onClose} className={link}>
              <i.icon className="w-5 h-5" /> {i.label}
            </NavLink>
          ))}

          {/* Playlists */}
          <div className="flex items-center justify-between pt-4 pb-1 px-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Playlists</span>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setCreating(v => !v)}><Plus className="w-4 h-4" /></Button>
          </div>
          {creating && (
            <div className="px-2 pb-2 flex gap-1">
              <input autoFocus value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="Playlist name" className="flex-1 bg-input rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 ring-primary" />
            </div>
          )}
          {playlists.map(pl => (
            <NavLink key={pl.id} to={`/playlist/${pl.id}`} onClick={onClose} className={link}>
              <Music className="w-4 h-4 text-muted-foreground" /> <span className="truncate">{pl.name}</span>
            </NavLink>
          ))}
          {playlists.length === 0 && !creating && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No playlists yet.</p>
          )}
        </nav>
      </aside>
    </>
  );
}

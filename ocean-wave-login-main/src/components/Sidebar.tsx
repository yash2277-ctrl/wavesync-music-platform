import { NavLink } from 'react-router-dom';
import { Home, Search, Compass, Library, Heart, Sparkles, ListMusic, Settings, X, Music, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { usePlaylists } from '../contexts/PlaylistContext';
import WaveSyncLogo from './ui/WaveSyncLogo';
import { useState } from 'react';
import { Input } from './ui/input';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: Home,      label: 'Home',         path: '/' },
  { icon: Search,    label: 'Search',        path: '/search' },
  { icon: Compass,   label: 'Browse',        path: '/browse' },
  { icon: Library,   label: 'Your Library',  path: '/library' },
];

const EXTRA_ITEMS = [
  { icon: Sparkles,  label: 'AI Radio',      path: '/ai-radio' },
  { icon: Heart,     label: 'Liked Songs',   path: '/liked' },
  { icon: ListMusic, label: 'Queue',         path: '/queue' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { playlists, createPlaylist } = usePlaylists();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setCreating(false);
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-transparent'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-sidebar flex flex-col border-r border-sidebar-border
        transition-transform duration-300 ease-in-out overflow-hidden
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between">
          <WaveSyncLogo size="sm" />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose} className={linkClass}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

          <Separator className="my-3 bg-sidebar-border" />

          {EXTRA_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} onClick={onClose} className={linkClass}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

          <NavLink to="/settings" onClick={onClose} className={linkClass}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            Settings
          </NavLink>

          <Separator className="my-3 bg-sidebar-border" />

          {/* Playlists */}
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Playlists</span>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {creating && (
            <div className="px-1 space-y-1">
              <Input
                autoFocus
                placeholder="Playlist name…"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                className="h-8 text-sm bg-background/50 border-cyan-500/30"
              />
              <div className="flex gap-1">
                <Button size="sm" className="flex-1 h-7 text-xs bg-cyan-500 hover:bg-cyan-600 text-black" onClick={handleCreate}>Create</Button>
                <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {playlists.map(pl => (
            <NavLink key={pl.id} to={`/playlist/${pl.id}`} onClick={onClose} className={linkClass}>
              <Music className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{pl.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

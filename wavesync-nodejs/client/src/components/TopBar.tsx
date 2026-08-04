import { ChevronLeft, ChevronRight, Menu, User, LogOut, Settings, Palette, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 sticky top-0 z-30 glass border-b border-border">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}><Menu className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full bg-background/40" onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full bg-background/40" onClick={() => navigate(1)}><ChevronRight className="w-5 h-5" /></Button>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => navigate('/create')} size="sm" className="bg-grad text-white gap-1.5 hidden sm:flex hover:brightness-110">
          <Sparkles className="w-4 h-4" /> Create
        </Button>

        {/* Theme picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full"><Palette className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-border w-44">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {themes.map(t => (
              <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)} className="gap-2">
                <span className="w-4 h-4 rounded-full" style={{ background: t.swatch }} />
                {t.label}
                {theme === t.id && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-grad w-9 h-9 text-white">
              {user?.username?.charAt(0).toUpperCase() ?? <User className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-border w-52">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/studio')}><Sparkles className="w-4 h-4 mr-2" /> My Studio</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

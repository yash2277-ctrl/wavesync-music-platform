import { ChevronLeft, ChevronRight, Menu, User, LogOut, Settings, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { signOut, getStoredUser } from '../lib/auth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/use-toast';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { themeLabel, cycleTheme } = useTheme();
  const user = getStoredUser();

  const handleLogout = () => {
    signOut();
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/login');
  };

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 bg-background/90 backdrop-blur-sm border-b border-border flex-shrink-0">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full" onClick={() => navigate(1)}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={cycleTheme} title={`Theme: ${themeLabel}`}>
          <Palette className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 bg-cyan-500/10 hover:bg-cyan-500/20">
              <User className="w-4 h-4 text-cyan-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-cyan-500/20">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.username ?? 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

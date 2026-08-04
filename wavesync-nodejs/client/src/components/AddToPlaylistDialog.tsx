import { useState } from 'react';
import { Plus, Check, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlaylists } from '@/contexts/PlaylistContext';
import { CreatePlaylistDialog } from './CreatePlaylistDialog';
import { motion } from 'framer-motion';

interface AddToPlaylistDialogProps {
  trackId: string;
  trigger?: React.ReactNode;
}

export function AddToPlaylistDialog({ trackId, trigger }: AddToPlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = usePlaylists();

  const handleToggleTrack = async (playlistId: string, isInPlaylist: boolean) => {
    try {
      if (isInPlaylist) {
        await removeTrackFromPlaylist(playlistId, trackId);
      } else {
        await addTrackToPlaylist(playlistId, trackId);
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Plus className="w-4 h-4 mr-2" />
            Add to Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-cyan-400" />
            Add to Playlist
          </DialogTitle>
          <DialogDescription>
            Select playlists to add this track to
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-2">
            {playlists.length > 0 ? (
              playlists.map((playlist) => {
                const isInPlaylist = playlist.tracks.includes(trackId);
                
                return (
                  <motion.button
                    key={playlist.id}
                    onClick={() => handleToggleTrack(playlist.id, isInPlaylist)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      isInPlaylist
                        ? 'bg-cyan-500/20 border-2 border-cyan-500/50'
                        : 'bg-card/50 border-2 border-transparent hover:border-cyan-500/20 hover:bg-card/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        {playlist.name.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                        </p>
                      </div>
                    </div>
                    {isInPlaylist && (
                      <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                    )}
                  </motion.button>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No playlists yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-cyan-500/10">
          <CreatePlaylistDialog
            trigger={
              <Button
                variant="outline"
                className="w-full border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Playlist
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

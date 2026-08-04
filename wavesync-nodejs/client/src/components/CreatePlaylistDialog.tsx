import { useState } from 'react';
import { Plus, Music2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePlaylists } from '@/contexts/PlaylistContext';
import { motion } from 'framer-motion';

interface CreatePlaylistDialogProps {
  trigger?: React.ReactNode;
}

export function CreatePlaylistDialog({ trigger }: CreatePlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { createPlaylist } = usePlaylists();

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createPlaylist(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && name.trim()) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Playlist</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5, repeat: 0 }}
            >
              <Music2 className="w-6 h-6 text-cyan-400" />
            </motion.div>
            Create New Playlist
          </DialogTitle>
          <DialogDescription>
            Give your playlist a name and description. You can add songs later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Playlist Name *
            </Label>
            <Input
              id="name"
              placeholder="My Awesome Playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={50}
              className="bg-background/50 border-cyan-500/20 focus:border-cyan-500/50"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for your playlist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="bg-background/50 border-cyan-500/20 focus:border-cyan-500/50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/200 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-cyan-500/20 hover:bg-cyan-500/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Creating...
              </>
            ) : (
              'Create Playlist'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

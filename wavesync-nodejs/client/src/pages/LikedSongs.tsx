import { motion } from "framer-motion";
import { Heart, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import albumArt from "@/assets/album-art.jpg";

const likedSongs = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Echo", album: "Echoes", duration: "4:03", image: albumArt },
  { id: 2, title: "Neon Lights", artist: "Luna Echo", album: "Echoes", duration: "3:18", image: albumArt },
  { id: 3, title: "Digital Waves", artist: "Luna Echo", album: "Echoes", duration: "4:36", image: albumArt },
  { id: 4, title: "Ocean Breeze", artist: "Wave Riders", album: "Coastal", duration: "3:45", image: albumArt },
  { id: 5, title: "Sunset Drive", artist: "Chill Masters", album: "Vibes", duration: "4:12", image: albumArt },
  { id: 6, title: "Morning Coffee", artist: "Lofi Beats", album: "Daily", duration: "3:28", image: albumArt },
  { id: 7, title: "City Lights", artist: "Luna Echo", album: "Echoes", duration: "3:56", image: albumArt },
  { id: 8, title: "Rainy Day", artist: "Chill Masters", album: "Moods", duration: "4:24", image: albumArt },
];

export default function LikedSongs() {
  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end gap-6 mb-6"
      >
        <div className="w-52 h-52 bg-gradient-to-br from-purple-500 to-pink-500 rounded shadow-2xl flex items-center justify-center">
          <Heart className="w-24 h-24 text-white" fill="white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">Playlist</p>
          <h1 className="text-6xl font-bold mb-4">Liked Songs</h1>
          <p className="text-sm text-muted-foreground">{likedSongs.length} songs</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button size="lg" className="rounded-full w-14 h-14">
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </Button>
        <Button size="lg" variant="ghost">
          <Heart className="w-6 h-6" fill="currentColor" />
        </Button>
      </motion.div>

      {/* Song List */}
      <div className="space-y-1">
        {/* Header Row */}
        <div className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(60px,1fr)] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>Date added</span>
          <Clock className="w-4 h-4 ml-auto" />
        </div>

        {/* Song Rows */}
        {likedSongs.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(60px,1fr)] gap-4 px-4 py-2 rounded hover:bg-card-hover group cursor-pointer"
          >
            <span className="text-muted-foreground text-sm pt-1">{index + 1}</span>
            <div className="flex items-center gap-3 min-w-0">
              <img src={song.image} alt={song.title} className="w-10 h-10 rounded" />
              <div className="min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground pt-1 truncate">{song.album}</span>
            <span className="text-sm text-muted-foreground pt-1">2 days ago</span>
            <span className="text-sm text-muted-foreground pt-1 text-right">{song.duration}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

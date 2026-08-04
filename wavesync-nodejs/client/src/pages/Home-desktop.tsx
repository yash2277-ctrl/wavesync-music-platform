import { motion } from "framer-motion";
import albumArt from "@/assets/album-art.jpg";
import { useState, useEffect } from "react";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration?: number;
  path: string;
}

const madeForYou = [
  { id: 1, title: "Daily Mix 1", description: "Luna Echo, Wave Riders and more", image: albumArt },
  { id: 2, title: "Discover Weekly", description: "Your weekly mixtape of fresh music", image: albumArt },
  { id: 3, title: "Release Radar", description: "Catch all the latest music", image: albumArt },
  { id: 4, title: "Chill Vibes", description: "Kick back to the best new music", image: albumArt },
  { id: 5, title: "Focus Flow", description: "Music to help you concentrate", image: albumArt },
];

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, setPlaylist, currentTrack, isPlaying, togglePlay } = useMusicPlayer();

  useEffect(() => {
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        setTracks(data);
        setPlaylist(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tracks:', err);
        setLoading(false);
      });
  }, [setPlaylist]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="space-y-8 pb-8 relative">
      {/* Greeting with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent gradient-shift">
          Good evening
        </h1>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Music Library - Enhanced Empty State */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <span className="relative">
            Your Music Library
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          </span>
        </h2>
        {loading ? (
          <motion.div 
            className="text-center py-12 relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-cyan-500/10"
          >
            <div className="shimmer absolute inset-0" />
            <p className="text-muted-foreground text-lg">Loading tracks...</p>
          </motion.div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group flex items-center gap-4 bg-card/80 backdrop-blur-sm hover:bg-card-hover rounded-xl p-4 cursor-pointer transition-all border border-cyan-500/10 hover:border-cyan-500/30 relative overflow-hidden"
                onClick={() => handlePlayTrack(track)}
              >
                <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-100" />
                
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-3xl font-bold text-white shadow-lg relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100"
                    animate={{
                      background: [
                        "linear-gradient(135deg, rgba(103, 213, 232, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)",
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(103, 213, 232, 0.8) 100%)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="relative z-10">{track.title.charAt(0)}</span>
                </div>

                <div className="flex-1 min-w-0 relative z-10">
                  <p className="font-semibold truncate group-hover:text-cyan-300 transition-colors">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>

                <Button
                  size="icon"
                  className={`relative z-10 rounded-full shadow-lg transition-all ${
                    currentTrack?.id === track.id && isPlaying
                      ? 'bg-cyan-500 hover:bg-cyan-600'
                      : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center py-12 relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-cyan-500/10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="shimmer absolute inset-0" />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-xl"
            />
            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4"
              >
                🌊
              </motion.div>
              <p className="text-muted-foreground text-lg font-medium">No music available</p>
              <p className="text-sm text-muted-foreground/60 mt-2">Dive into the ocean of sound</p>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Made For You */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="relative">
              Made For You
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            </span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >
              ✨
            </motion.span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {madeForYou.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group bg-card/80 backdrop-blur-sm hover:bg-card-hover rounded-lg p-4 cursor-pointer transition-all relative overflow-hidden border border-cyan-500/5 hover:border-cyan-500/20"
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                
                <div className="relative mb-4 overflow-hidden rounded-md">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      background: [
                        "linear-gradient(135deg, rgba(103, 213, 232, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(103, 213, 232, 0.2) 100%)",
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-square object-cover rounded-md shadow-lg relative z-10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
                </div>
                
                <h3 className="font-semibold mb-1 truncate relative z-10 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Popular Playlists */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="relative">
              Popular Playlists
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            </span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >
              🎵
            </motion.span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {madeForYou.map((item, index) => (
              <motion.div
                key={`popular-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group bg-card/80 backdrop-blur-sm hover:bg-card-hover rounded-lg p-4 cursor-pointer transition-all relative overflow-hidden border border-blue-500/5 hover:border-blue-500/20 pulse-glow"
              >
                {/* Animated Background */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 50%, rgba(103, 213, 232, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 50%, rgba(103, 213, 232, 0.1) 0%, transparent 50%)",
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative mb-4 overflow-hidden rounded-md">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="font-semibold mb-1 truncate relative z-10 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

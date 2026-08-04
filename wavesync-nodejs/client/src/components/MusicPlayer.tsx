import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import albumArt from "@/assets/album-art.jpg";

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
}

const tracks: Track[] = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Echo", duration: 243, coverUrl: albumArt },
  { id: 2, title: "Neon Lights", artist: "Luna Echo", duration: 198, coverUrl: albumArt },
  { id: 3, title: "Digital Waves", artist: "Luna Echo", duration: 276, coverUrl: albumArt },
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = tracks[currentTrack];

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying && currentTime < track.duration) {
        setCurrentTime((prev) => prev + 1);
      } else if (currentTime >= track.duration) {
        handleNext();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentTime, track.duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
  };

  const handlePrevious = () => {
    if (currentTime > 5) {
      setCurrentTime(0);
    } else {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Ambient Background Glow */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row h-full p-4 md:p-8 gap-6">
        {/* Main Player */}
        <motion.div
          className="flex-1 flex flex-col justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Album Art */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTrack}
              className="relative mb-8"
              initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <motion.div
                  className="absolute inset-0 rounded-2xl glow-primary"
                  animate={isPlaying ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.img
                  src={track.coverUrl}
                  alt={track.title}
                  className="relative w-full h-full object-cover rounded-2xl shadow-2xl"
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Track Info */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-shadow">{track.title}</h2>
            <p className="text-lg text-muted-foreground">{track.artist}</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full max-w-2xl px-4 mb-6">
            <Slider
              value={[currentTime]}
              max={track.duration}
              step={1}
              onValueChange={handleProgressChange}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <motion.div
            className="flex items-center gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShuffle(!shuffle)}
              className={shuffle ? "text-primary" : "text-muted-foreground"}
            >
              <Shuffle className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="text-foreground hover:text-primary transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="icon"
                onClick={togglePlay}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </Button>
            </motion.div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="text-foreground hover:text-primary transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRepeat(!repeat)}
              className={repeat ? "text-primary" : "text-muted-foreground"}
            >
              <Repeat className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Volume and Like */}
          <motion.div
            className="flex items-center gap-6 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-primary" : "text-muted-foreground"}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </motion.div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Queue Sidebar */}
        <motion.div
          className="w-full lg:w-80 glass-card rounded-2xl p-6 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-4">Up Next</h3>
          <div className="space-y-3">
            {tracks.map((t, index) => (
              <motion.div
                key={t.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  index === currentTrack
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-card/50 hover:bg-card"
                }`}
                onClick={() => {
                  setCurrentTrack(index);
                  setCurrentTime(0);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={t.coverUrl}
                  alt={t.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{t.artist}</p>
                </div>
                <span className="text-sm text-muted-foreground">{formatTime(t.duration)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

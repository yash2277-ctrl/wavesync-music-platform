import { motion } from "framer-motion";
import { useQueue } from "@/contexts/QueueContext";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { Play, Pause, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Queue() {
  const { queue, currentIndex, removeFromQueue, moveToIndex, clearQueue } = useQueue();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();

  const handlePlayTrack = (index: number) => {
    if (index === currentIndex && currentTrack?.id === queue[index]?.id) {
      togglePlay();
    } else {
      moveToIndex(index);
      playTrack(queue[index]);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Queue</h1>
        {queue.length > 0 && (
          <Button variant="outline" onClick={clearQueue}>
            Clear Queue
          </Button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No tracks in queue</p>
          <p className="text-muted-foreground text-sm mt-2">
            Tracks will appear here as you play music
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
          {queue[currentIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border-2 border-primary"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500">
                  {queue[currentIndex].albumArt ? (
                    <img
                      src={queue[currentIndex].albumArt}
                      alt={queue[currentIndex].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                      🎵
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{queue[currentIndex].title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {queue[currentIndex].artist}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handlePlayTrack(currentIndex)}
                  className="flex-shrink-0"
                >
                  {isPlaying && currentTrack?.id === queue[currentIndex]?.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {queue.length > currentIndex + 1 && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">Next in Queue</h2>
              <div className="space-y-2">
                {queue.slice(currentIndex + 1).map((track, idx) => {
                  const actualIndex = currentIndex + 1 + idx;
                  return (
                    <motion.div
                      key={actualIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card/30 backdrop-blur-sm rounded-lg p-3 hover:bg-card/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-muted-foreground text-sm w-6">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-500">
                          {track.albumArt ? (
                            <img
                              src={track.albumArt}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              🎵
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePlayTrack(actualIndex)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromQueue(actualIndex)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

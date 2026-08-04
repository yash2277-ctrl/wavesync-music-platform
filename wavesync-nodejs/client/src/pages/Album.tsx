import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Album() {
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/albums/${id}`)
      .then(res => res.json())
      .then(data => setAlbum(data))
      .catch(() => {
        // Mock data
        setAlbum({
          id,
          title: "Midnight Dreams",
          artist: "Luna Echo",
          artistId: "1",
          year: 2024,
          cover: "https://picsum.photos/seed/album-main/400/400",
          totalTracks: 12,
          duration: 2847, // seconds
          tracks: [
            { id: "1", title: "Intro", duration: 45, trackNumber: 1 },
            { id: "2", title: "Midnight Dreams", duration: 245, trackNumber: 2 },
            { id: "3", title: "Ocean Waves", duration: 223, trackNumber: 3 },
            { id: "4", title: "Summer Nights", duration: 198, trackNumber: 4 },
            { id: "5", title: "City Lights", duration: 267, trackNumber: 5 },
            { id: "6", title: "Golden Hour", duration: 201, trackNumber: 6 },
            { id: "7", title: "Starlight", duration: 234, trackNumber: 7 },
            { id: "8", title: "Reflection", duration: 189, trackNumber: 8 },
            { id: "9", title: "Echoes", duration: 256, trackNumber: 9 },
            { id: "10", title: "Dawn", duration: 178, trackNumber: 10 },
            { id: "11", title: "Dreamscape", duration: 298, trackNumber: 11 },
            { id: "12", title: "Outro", duration: 513, trackNumber: 12 },
          ]
        });
      });
  }, [id]);

  if (!album) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const totalDuration = Math.floor(album.duration / 60);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 mb-8"
      >
        <img
          src={album.cover}
          alt={album.title}
          className="w-full md:w-64 aspect-square object-cover rounded-lg shadow-2xl"
        />
        <div className="flex flex-col justify-end">
          <p className="text-sm font-medium mb-2">ALBUM</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{album.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{album.artist}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{album.year}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{album.totalTracks} songs</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{totalDuration} min</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-8">
        <Button size="lg" className="rounded-full px-8">
          <Play className="w-5 h-5 mr-2" fill="currentColor" />
          Play
        </Button>
        <Button size="lg" variant="outline" className="rounded-full">
          <Heart className="w-5 h-5" />
        </Button>
        <Button size="lg" variant="ghost" className="rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Track List */}
      <div className="space-y-1">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span>#</span>
          <span>Title</span>
          <span><Clock className="w-4 h-4" /></span>
          <span className="w-10"></span>
        </div>
        {album.tracks.map((track: any, index: number) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-lg hover:bg-card/50 cursor-pointer"
          >
            <div className="flex items-center justify-center w-8">
              <span className="group-hover:hidden text-muted-foreground">
                {track.trackNumber}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="hidden group-hover:flex"
              >
                <Play className="w-4 h-4" fill="currentColor" />
              </Button>
            </div>
            <div>
              <p className="font-medium">{track.title}</p>
              <p className="text-sm text-muted-foreground">{album.artist}</p>
            </div>
            <span className="text-sm text-muted-foreground flex items-center">
              {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
            </span>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-sm text-muted-foreground">
        <p>© {album.year} {album.artist}</p>
        <p className="mt-1">Released: January 1, {album.year}</p>
      </div>
    </div>
  );
}

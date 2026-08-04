import { motion } from "framer-motion";
import { Mic2, Play, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Podcast {
  id: string;
  title: string;
  publisher: string;
  description: string;
  image: string;
  episodeCount: number;
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

  useEffect(() => {
    // Fetch podcasts from your backend
    fetch("/api/podcasts")
      .then(res => res.json())
      .then(data => setPodcasts(data))
      .catch(err => console.error("Failed to fetch podcasts:", err));
  }, []);

  const featuredPodcasts: Podcast[] = [
    {
      id: "1",
      title: "The Daily Tech",
      publisher: "TechNews",
      description: "Your daily dose of technology news",
      image: "https://picsum.photos/seed/podcast1/400/400",
      episodeCount: 150
    },
    {
      id: "2",
      title: "Code & Coffee",
      publisher: "DevTalks",
      description: "Programming discussions over coffee",
      image: "https://picsum.photos/seed/podcast2/400/400",
      episodeCount: 89
    },
    {
      id: "3",
      title: "Music Matters",
      publisher: "AudioWave",
      description: "Exploring the world of music",
      image: "https://picsum.photos/seed/podcast3/400/400",
      episodeCount: 200
    },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Mic2 className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Podcasts</h1>
          </div>
          <p className="text-white/90 text-lg">
            Discover stories, insights, and conversations
          </p>
        </div>
        <div className="absolute inset-0 bg-black/10"></div>
      </motion.div>

      {/* Featured Podcasts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Podcasts</h2>
          <Button variant="ghost">See all</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredPodcasts.map((podcast, index) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card hover:bg-card-hover rounded-lg p-4 cursor-pointer transition-all"
            >
              <div className="relative mb-4">
                <img
                  src={podcast.image}
                  alt={podcast.title}
                  className="w-full aspect-square object-cover rounded-lg shadow-lg"
                />
                <Button
                  size="icon"
                  className="absolute bottom-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                </Button>
              </div>
              <h3 className="font-bold text-lg mb-1 truncate">{podcast.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{podcast.publisher}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {podcast.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {podcast.episodeCount} episodes
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: "Technology", color: "from-blue-600 to-cyan-600" },
            { name: "Business", color: "from-green-600 to-emerald-600" },
            { name: "Comedy", color: "from-yellow-600 to-orange-600" },
            { name: "News", color: "from-red-600 to-pink-600" },
            { name: "Education", color: "from-purple-600 to-violet-600" },
            { name: "True Crime", color: "from-gray-600 to-slate-600" },
            { name: "Sports", color: "from-indigo-600 to-blue-600" },
            { name: "Health", color: "from-teal-600 to-green-600" },
          ].map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br ${category.color} rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform`}
            >
              <p className="text-white font-bold text-lg">{category.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Trending Now</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 bg-card hover:bg-card-hover rounded-lg p-3 cursor-pointer group"
            >
              <span className="text-2xl font-bold text-muted-foreground w-8">
                {i}
              </span>
              <img
                src={`https://picsum.photos/seed/trend${i}/80/80`}
                alt="Podcast"
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">Trending Podcast {i}</p>
                <p className="text-sm text-muted-foreground">Popular Publisher</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100"
              >
                <Play className="w-5 h-5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

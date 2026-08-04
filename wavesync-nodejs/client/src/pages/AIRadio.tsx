import { useState, useEffect } from 'react';
import { Play, Sparkles, Clock, Heart, Zap, Coffee, Moon, Sun, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useMusicPlayer } from '../components/MusicPlayerContext';
import { useQueue } from '../contexts/QueueContext';
import { aiEngine } from '../services/aiRecommendations';
import { useToast } from '../hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  path?: string;
}

export default function AIRadio() {
  const { playTrack, currentTrack } = useMusicPlayer();
  const { addToQueue, setQueue } = useQueue();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Track[]>([]);
  const [listeningStats, setListeningStats] = useState<any>(null);

  const userId = localStorage.getItem('userId') || 'guest';

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      // Load user profile
      aiEngine.loadProfile(userId);

      // Get local tracks
      const response = await fetch('/api/library');
      const data = await response.json();
      const tracks = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        genre: t.genre,
        duration: t.duration,
        path: `/api/stream/${t.id}`,
      }));

      // Get AI recommendations
      const recommendations = aiEngine.getRecommendations(userId, tracks, undefined, 10);
      setAiRecommendations(recommendations);

      // Get listening stats
      const profile = aiEngine.loadProfile(userId);
      if (profile) {
        setListeningStats({
          totalListens: profile.listeningHistory.length,
          topGenre: Object.entries(profile.favoriteGenres).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
          topArtist: Object.entries(profile.favoriteArtists).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
        });
      }
    } catch (error) {
      console.error('Failed to load AI data:', error);
    }
  };

  const startAIRadio = async (mood?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/library');
      const data = await response.json();
      const tracks = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        genre: t.genre,
        duration: t.duration,
        path: `/api/stream/${t.id}`,
      }));

      let playlist: Track[];
      if (mood) {
        playlist = aiEngine.getMoodPlaylist(mood, tracks, 20);
      } else {
        playlist = aiEngine.getRecommendations(userId, tracks, undefined, 20);
      }

      if (playlist.length > 0) {
        setQueue(playlist);
        playTrack(playlist[0]);
        toast({
          title: '🎵 AI Radio Started',
          description: `Playing ${mood ? mood : 'personalized'} mix with ${playlist.length} tracks`,
        });
      } else {
        toast({
          title: 'No tracks found',
          description: 'Try adding more music to your library',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to start AI Radio:', error);
      toast({
        title: 'Error',
        description: 'Failed to start AI Radio',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moodCards = [
    { mood: 'energetic', label: 'Energetic', icon: Zap, color: 'from-orange-500 to-red-500' },
    { mood: 'chill', label: 'Chill', icon: Coffee, color: 'from-blue-500 to-cyan-500' },
    { mood: 'focused', label: 'Focus', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { mood: 'party', label: 'Party', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
    { mood: 'sad', label: 'Melancholy', icon: Moon, color: 'from-slate-500 to-gray-600' },
    { mood: 'workout', label: 'Workout', icon: Sun, color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">AI Radio</h1>
            <p className="text-muted-foreground">Powered by intelligent recommendations</p>
          </div>
        </div>
      </div>

      {/* Listening Stats */}
      {listeningStats && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Listens</p>
                <p className="text-2xl font-bold">{listeningStats.totalListens}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top Genre</p>
                <p className="text-2xl font-bold capitalize">{listeningStats.topGenre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top Artist</p>
                <p className="text-2xl font-bold">{listeningStats.topArtist}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start AI Radio Button */}
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Sparkles className="w-16 h-16 mx-auto text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Start AI Radio</h2>
            <p className="text-muted-foreground">
              Let AI create a personalized mix based on your listening history
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => startAIRadio()}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? 'Loading...' : '🎵 Start AI Radio'}
          </Button>
        </CardContent>
      </Card>

      {/* Mood Playlists */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Choose Your Mood</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {moodCards.map((moodCard) => (
            <Card
              key={moodCard.mood}
              className="cursor-pointer hover:scale-105 transition-transform group"
              onClick={() => startAIRadio(moodCard.mood)}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${moodCard.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <moodCard.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-center font-semibold">{moodCard.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Recommended for You
          </h2>
          <div className="space-y-2">
            {aiRecommendations.slice(0, 5).map((track) => (
              <Card key={track.id} className="hover:bg-accent cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => playTrack(track)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <div>
                      <p className="font-semibold">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full">
                      {track.genre}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            How AI Radio Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2">📊 Learns Your Taste</div>
              <p className="text-muted-foreground">
                Tracks what you play, skip, and replay to understand your preferences
              </p>
            </div>
            <div>
              <div className="font-semibold mb-2">🎯 Context-Aware</div>
              <p className="text-muted-foreground">
                Considers time of day, mood, and listening patterns for better suggestions
              </p>
            </div>
            <div>
              <div className="font-semibold mb-2">🔄 Continuous Learning</div>
              <p className="text-muted-foreground">
                Gets better over time by learning from your listening habits and feedback
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

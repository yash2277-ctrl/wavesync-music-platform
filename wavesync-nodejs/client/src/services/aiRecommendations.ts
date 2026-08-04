// AI-Powered Music Recommendation Engine

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration?: number;
}

interface UserProfile {
  userId: string;
  favoriteGenres: { [genre: string]: number };
  favoriteArtists: { [artist: string]: number };
  listeningHistory: { trackId: string; timestamp: Date; completed: boolean }[];
  skipRate: number;
  averageSessionLength: number;
}

interface RecommendationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  mood?: 'energetic' | 'chill' | 'focused' | 'party' | 'sad';
  currentActivity?: string;
}

class AIRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private trackFeatures: Map<string, any> = new Map();

  // Initialize user profile
  initializeUser(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      const profile: UserProfile = {
        userId,
        favoriteGenres: {},
        favoriteArtists: {},
        listeningHistory: [],
        skipRate: 0,
        averageSessionLength: 0,
      };
      this.userProfiles.set(userId, profile);
    }
    return this.userProfiles.get(userId)!;
  }

  // Track user listening behavior
  trackListening(
    userId: string,
    track: Track,
    completed: boolean,
    listenDuration: number
  ) {
    const profile = this.initializeUser(userId);

    // Add to history
    profile.listeningHistory.push({
      trackId: track.id,
      timestamp: new Date(),
      completed,
    });

    // Update genre preferences
    if (!profile.favoriteGenres[track.genre]) {
      profile.favoriteGenres[track.genre] = 0;
    }
    profile.favoriteGenres[track.genre] += completed ? 1 : 0.3;

    // Update artist preferences
    if (!profile.favoriteArtists[track.artist]) {
      profile.favoriteArtists[track.artist] = 0;
    }
    profile.favoriteArtists[track.artist] += completed ? 1 : 0.3;

    // Update skip rate
    const recentTracks = profile.listeningHistory.slice(-20);
    const skipped = recentTracks.filter((t) => !t.completed).length;
    profile.skipRate = skipped / recentTracks.length;

    // Save to localStorage
    this.saveProfile(userId);
  }

  // Get personalized recommendations
  getRecommendations(
    userId: string,
    availableTracks: Track[],
    context?: RecommendationContext,
    count: number = 10
  ): Track[] {
    const profile = this.userProfiles.get(userId);
    if (!profile || profile.listeningHistory.length < 3) {
      // Cold start: return popular/diverse tracks
      return this.getColdStartRecommendations(availableTracks, count);
    }

    const scoredTracks = availableTracks.map((track) => ({
      track,
      score: this.calculateTrackScore(track, profile, context),
    }));

    // Sort by score and return top N
    scoredTracks.sort((a, b) => b.score - a.score);
    return scoredTracks.slice(0, count).map((st) => st.track);
  }

  // Calculate track recommendation score
  private calculateTrackScore(
    track: Track,
    profile: UserProfile,
    context?: RecommendationContext
  ): number {
    let score = 0;

    // Genre match (40% weight)
    const genreScore = profile.favoriteGenres[track.genre] || 0;
    const totalGenreListens = Object.values(profile.favoriteGenres).reduce(
      (a, b) => a + b,
      0
    );
    score += (genreScore / totalGenreListens) * 40;

    // Artist match (30% weight)
    const artistScore = profile.favoriteArtists[track.artist] || 0;
    const totalArtistListens = Object.values(profile.favoriteArtists).reduce(
      (a, b) => a + b,
      0
    );
    score += (artistScore / totalArtistListens) * 30;

    // Avoid recently played (15% weight)
    const recentTracks = profile.listeningHistory.slice(-10);
    const playedRecently = recentTracks.some((h) => h.trackId === track.id);
    score += playedRecently ? 0 : 15;

    // Context matching (15% weight)
    if (context) {
      score += this.getContextScore(track, context);
    }

    return score;
  }

  // Context-aware scoring
  private getContextScore(track: Track, context: RecommendationContext): number {
    let contextScore = 0;

    // Time of day matching
    const timePreferences: { [key: string]: string[] } = {
      morning: ['pop', 'indie', 'electronic'],
      afternoon: ['pop', 'rock', 'hiphop'],
      evening: ['indie', 'bollywood', 'pop'],
      night: ['indie', 'electronic', 'bollywood'],
    };

    if (timePreferences[context.timeOfDay]?.includes(track.genre)) {
      contextScore += 5;
    }

    // Mood matching
    if (context.mood) {
      const moodGenres: { [key: string]: string[] } = {
        energetic: ['pop', 'electronic', 'hiphop', 'rock'],
        chill: ['indie', 'bollywood', 'pop'],
        focused: ['indie', 'electronic'],
        party: ['pop', 'hiphop', 'electronic'],
        sad: ['indie', 'bollywood'],
      };

      if (moodGenres[context.mood]?.includes(track.genre)) {
        contextScore += 5;
      }
    }

    // Weekend vs weekday
    if (context.dayOfWeek === 'weekend') {
      if (['pop', 'hiphop', 'electronic'].includes(track.genre)) {
        contextScore += 3;
      }
    }

    return contextScore;
  }

  // Cold start recommendations for new users
  private getColdStartRecommendations(
    availableTracks: Track[],
    count: number
  ): Track[] {
    // Return diverse selection across genres
    const genreMap = new Map<string, Track[]>();

    availableTracks.forEach((track) => {
      if (!genreMap.has(track.genre)) {
        genreMap.set(track.genre, []);
      }
      genreMap.get(track.genre)!.push(track);
    });

    const recommendations: Track[] = [];
    const genres = Array.from(genreMap.keys());

    // Round-robin selection from each genre
    let genreIndex = 0;
    while (recommendations.length < count && recommendations.length < availableTracks.length) {
      const genre = genres[genreIndex % genres.length];
      const genreTracks = genreMap.get(genre)!;

      if (genreTracks.length > 0) {
        const track = genreTracks.shift()!;
        recommendations.push(track);
      }

      genreIndex++;
    }

    return recommendations;
  }

  // Get auto-play next track
  getNextAutoPlayTrack(
    userId: string,
    currentTrack: Track,
    availableTracks: Track[]
  ): Track | null {
    const profile = this.userProfiles.get(userId);

    // Get current context
    const context = this.getCurrentContext();

    // Get recommendations
    const recommendations = this.getRecommendations(
      userId,
      availableTracks.filter((t) => t.id !== currentTrack.id),
      context,
      5
    );

    // Prefer same artist or genre
    const sameArtist = recommendations.find((t) => t.artist === currentTrack.artist);
    if (sameArtist) return sameArtist;

    const sameGenre = recommendations.find((t) => t.genre === currentTrack.genre);
    if (sameGenre) return sameGenre;

    return recommendations[0] || null;
  }

  // Get current context based on time
  private getCurrentContext(): RecommendationContext {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let timeOfDay: RecommendationContext['timeOfDay'];
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      timeOfDay,
      dayOfWeek: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday',
    };
  }

  // Save profile to localStorage
  private saveProfile(userId: string) {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      try {
        localStorage.setItem(`aiProfile_${userId}`, JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to save AI profile:', error);
      }
    }
  }

  // Load profile from localStorage
  loadProfile(userId: string): UserProfile | null {
    try {
      const saved = localStorage.getItem(`aiProfile_${userId}`);
      if (saved) {
        const profile = JSON.parse(saved);
        this.userProfiles.set(userId, profile);
        return profile;
      }
    } catch (error) {
      console.error('Failed to load AI profile:', error);
    }
    return null;
  }

  // Get mood-based playlist
  getMoodPlaylist(mood: string, availableTracks: Track[], count: number = 20): Track[] {
    const moodGenres: { [key: string]: string[] } = {
      energetic: ['pop', 'electronic', 'hiphop', 'rock'],
      chill: ['indie', 'bollywood'],
      focused: ['indie', 'electronic'],
      party: ['pop', 'hiphop', 'electronic'],
      sad: ['indie', 'bollywood'],
      workout: ['pop', 'hiphop', 'electronic', 'rock'],
    };

    const genres = moodGenres[mood] || [];
    const moodTracks = availableTracks.filter((track) =>
      genres.includes(track.genre)
    );

    return moodTracks.slice(0, count);
  }
}

// Export singleton instance
export const aiEngine = new AIRecommendationEngine();

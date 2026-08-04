// Global Music & Podcast API Integrations

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  previewUrl?: string;
  source: 'spotify' | 'itunes' | 'lastfm' | 'listennotes';
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishDate: string;
  thumbnail: string;
}

interface Chart {
  id: string;
  name: string;
  tracks: SearchResult[];
}

// iTunes API (FREE - No API key needed!)
class iTunesAPI {
  private baseUrl = 'https://itunes.apple.com';

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}`
      );
      const data = await response.json();

      return data.results.map((track: any) => ({
        id: track.trackId.toString(),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        cover: track.artworkUrl100?.replace('100x100', '300x300'),
        previewUrl: track.previewUrl,
        source: 'itunes' as const,
      }));
    } catch (error) {
      console.error('iTunes API error:', error);
      return [];
    }
  }

  async getTopSongs(genre: string = 'all', limit: number = 50): Promise<SearchResult[]> {
    try {
      // iTunes doesn't have a direct "top songs" endpoint, but we can search popular terms
      const popularQueries = {
        pop: 'pop hits',
        rock: 'rock classics',
        hiphop: 'hip hop',
        indie: 'indie music',
        electronic: 'electronic music',
        bollywood: 'bollywood songs',
        all: 'top songs',
      };

      const query = popularQueries[genre as keyof typeof popularQueries] || 'top songs';
      return this.search(query, limit);
    } catch (error) {
      console.error('iTunes top songs error:', error);
      return [];
    }
  }

  async getArtistTopTracks(artistName: string, limit: number = 10): Promise<SearchResult[]> {
    return this.search(artistName, limit);
  }
}

// Spotify API (Requires API credentials)
class SpotifyAPI {
  private clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
  private clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl = 'https://api.spotify.com/v1';

  async authenticate(): Promise<boolean> {
    if (!this.clientId || !this.clientSecret) {
      console.warn('Spotify API credentials not configured');
      return false;
    }

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return true;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`),
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;
      return true;
    } catch (error) {
      console.error('Spotify authentication error:', error);
      return false;
    }
  }

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!(await this.authenticate())) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const data = await response.json();
      return data.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        source: 'spotify' as const,
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      return [];
    }
  }

  async getTopTracks(country: string = 'US'): Promise<SearchResult[]> {
    if (!(await this.authenticate())) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=50`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const data = await response.json();
      return data.items.map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        cover: item.track.album.images[0]?.url,
        previewUrl: item.track.preview_url,
        source: 'spotify' as const,
      }));
    } catch (error) {
      console.error('Spotify top tracks error:', error);
      return [];
    }
  }

  async getRecommendations(seedTracks: string[], limit: number = 20): Promise<SearchResult[]> {
    if (!(await this.authenticate())) return [];

    try {
      const seeds = seedTracks.slice(0, 5).join(',');
      const response = await fetch(
        `${this.baseUrl}/recommendations?seed_tracks=${seeds}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const data = await response.json();
      return data.tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        source: 'spotify' as const,
      }));
    } catch (error) {
      console.error('Spotify recommendations error:', error);
      return [];
    }
  }
}

// Last.fm API (Requires API key)
class LastFmAPI {
  private apiKey = import.meta.env.VITE_LASTFM_API_KEY || '';
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  async getTopTracks(limit: number = 50): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn('Last.fm API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?method=chart.gettoptracks&api_key=${this.apiKey}&format=json&limit=${limit}`
      );

      const data = await response.json();
      return data.tracks.track.map((track: any) => ({
        id: track.mbid || track.name,
        title: track.name,
        artist: track.artist.name,
        cover: track.image[3]?.['#text'],
        source: 'lastfm' as const,
      }));
    } catch (error) {
      console.error('Last.fm error:', error);
      return [];
    }
  }

  async getSimilarTracks(artist: string, track: string, limit: number = 20): Promise<SearchResult[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${this.apiKey}&format=json&limit=${limit}`
      );

      const data = await response.json();
      if (!data.similartracks?.track) return [];

      return data.similartracks.track.map((track: any) => ({
        id: track.mbid || track.name,
        title: track.name,
        artist: track.artist.name,
        cover: track.image[3]?.['#text'],
        source: 'lastfm' as const,
      }));
    } catch (error) {
      console.error('Last.fm similar tracks error:', error);
      return [];
    }
  }
}

// ListenNotes Podcast API
class ListenNotesAPI {
  private apiKey = import.meta.env.VITE_LISTENNOTES_API_KEY || '';
  private baseUrl = 'https://listen-api.listennotes.com/api/v2';

  async searchPodcasts(query: string, limit: number = 10): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('ListenNotes API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=podcast&limit=${limit}`,
        {
          headers: { 'X-ListenAPI-Key': this.apiKey },
        }
      );

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('ListenNotes error:', error);
      return [];
    }
  }

  async getBestPodcasts(genre?: string): Promise<any[]> {
    if (!this.apiKey) return [];

    try {
      const genreParam = genre ? `&genre_id=${genre}` : '';
      const response = await fetch(
        `${this.baseUrl}/best_podcasts?page=1${genreParam}`,
        {
          headers: { 'X-ListenAPI-Key': this.apiKey },
        }
      );

      const data = await response.json();
      return data.podcasts || [];
    } catch (error) {
      console.error('ListenNotes best podcasts error:', error);
      return [];
    }
  }

  async getPodcastEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}/podcasts/${podcastId}`,
        {
          headers: { 'X-ListenAPI-Key': this.apiKey },
        }
      );

      const data = await response.json();
      return data.episodes?.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audio,
        duration: ep.audio_length_sec,
        publishDate: ep.pub_date_ms,
        thumbnail: ep.thumbnail,
      })) || [];
    } catch (error) {
      console.error('ListenNotes episodes error:', error);
      return [];
    }
  }
}

// Global API Manager
class GlobalAPIManager {
  private itunes = new iTunesAPI();
  private spotify = new SpotifyAPI();
  private lastfm = new LastFmAPI();
  private listenNotes = new ListenNotesAPI();

  // Search across all available APIs
  async universalSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
    const results = await Promise.allSettled([
      this.itunes.search(query, limit),
      this.spotify.search(query, limit),
    ]);

    const allResults: SearchResult[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });

    // Deduplicate by title + artist
    const seen = new Set<string>();
    return allResults.filter((track) => {
      const key = `${track.title.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Get global charts
  async getGlobalCharts(): Promise<Chart[]> {
    const [itunesTop, spotifyTop, lastfmTop] = await Promise.allSettled([
      this.itunes.getTopSongs('all', 50),
      this.spotify.getTopTracks(),
      this.lastfm.getTopTracks(50),
    ]);

    const charts: Chart[] = [];

    if (itunesTop.status === 'fulfilled' && itunesTop.value.length > 0) {
      charts.push({ id: 'itunes-top', name: 'iTunes Top 50', tracks: itunesTop.value });
    }

    if (spotifyTop.status === 'fulfilled' && spotifyTop.value.length > 0) {
      charts.push({ id: 'spotify-top', name: 'Spotify Top 50', tracks: spotifyTop.value });
    }

    if (lastfmTop.status === 'fulfilled' && lastfmTop.value.length > 0) {
      charts.push({ id: 'lastfm-top', name: 'Last.fm Top 50', tracks: lastfmTop.value });
    }

    return charts;
  }

  // Get podcasts
  async searchPodcasts(query: string): Promise<any[]> {
    return this.listenNotes.searchPodcasts(query, 20);
  }

  async getTrendingPodcasts(): Promise<any[]> {
    return this.listenNotes.getBestPodcasts();
  }
}

// Export singleton instance
export const globalAPI = new GlobalAPIManager();
export type { SearchResult, PodcastEpisode, Chart };

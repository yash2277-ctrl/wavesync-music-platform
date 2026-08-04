import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Generate Spotify authorization URL
  getAuthUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-library-read',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code) {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'),
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error getting Spotify access token:', error.response?.data || error.message);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'),
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error refreshing Spotify token:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's playlists
  async getUserPlaylists(accessToken, limit = 50) {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting playlists:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get playlist tracks
  async getPlaylistTracks(accessToken, playlistId) {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting playlist tracks:', error.response?.data || error.message);
      throw error;
    }
  }

  // Search tracks
  async searchTracks(accessToken, query, limit = 20) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: 'track',
          limit: limit,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.tracks;
    } catch (error) {
      console.error('Error searching tracks:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's saved tracks
  async getSavedTracks(accessToken, limit = 50, offset = 0) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/tracks', {
        params: { limit, offset },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting saved tracks:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get track details
  async getTrack(accessToken, trackId) {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting track:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new SpotifyService();

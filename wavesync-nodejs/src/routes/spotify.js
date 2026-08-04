import express from 'express';
import spotifyService from '../services/spotifyService.js';

const router = express.Router();

// Get Spotify authorization URL
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = spotifyService.getAuthUrl();
    res.json({ success: true, authUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Spotify callback handler
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`http://localhost:8080/?error=${error}`);
  }

  try {
    const tokens = await spotifyService.getAccessToken(code);
    const profile = await spotifyService.getUserProfile(tokens.accessToken);

    // Store tokens in session or database here
    // For now, redirect with tokens in URL (not secure for production!)
    const params = new URLSearchParams({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user_id: profile.id,
      display_name: profile.display_name,
    });

    res.redirect(`http://localhost:8080/spotify-connected?${params.toString()}`);
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect(`http://localhost:8080/?error=auth_failed`);
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }

    const profile = await spotifyService.getUserProfile(accessToken);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's playlists
router.get('/playlists', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }

    const playlists = await spotifyService.getUserPlaylists(accessToken);
    res.json({ success: true, playlists: playlists.items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get playlist tracks
router.get('/playlist/:id/tracks', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }

    const tracks = await spotifyService.getPlaylistTracks(accessToken, req.params.id);
    res.json({ success: true, tracks: tracks.items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search tracks
router.get('/search', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const { q, limit } = req.query;

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }

    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = await spotifyService.searchTracks(accessToken, q, limit ? parseInt(limit) : 20);
    res.json({ success: true, tracks: results.items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get saved tracks (liked songs)
router.get('/saved-tracks', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const { limit, offset } = req.query;

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }

    const savedTracks = await spotifyService.getSavedTracks(
      accessToken,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0
    );
    res.json({ success: true, tracks: savedTracks.items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const tokens = await spotifyService.refreshAccessToken(refresh_token);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

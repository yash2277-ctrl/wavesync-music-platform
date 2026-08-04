/**
 * Artists API — profiles derived from users who have published tracks.
 *
 * GET  /api/artists                 List artists (with track counts)
 * GET  /api/artists/:id             Artist profile + their tracks
 * POST /api/artists/:id/follow      Follow / unfollow
 */
import { Router } from 'express';
import { param } from 'express-validator';
import { readDb, updateDb } from '../services/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

function trackCover(t, base) {
  return t.cover
    ? `${base}/uploads/covers/${t.cover}`
    : (t.coverSeed ? `https://picsum.photos/seed/${t.coverSeed}/600/600` : null);
}

function formatTrack(t, base) {
  return {
    id: t.id, title: t.title, artist: t.artist, album: t.album,
    genre: t.genre, mood: t.mood, plays: t.plays || 0, likes: t.likes || 0,
    isAI: t.isAI || false, cover: trackCover(t, base),
    streamUrl: `${base}/api/stream/${t.id}`, createdAt: t.createdAt,
  };
}

// ── GET /api/artists ──────────────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const db = readDb();
  const base = `${req.protocol}://${req.get('host')}`;

  // Build artist list from users who have published tracks
  const artists = db.users.map(u => {
    const tracks = db.tracks.filter(t => t.uploadedBy === u.id && t.isPublished !== false);
    const plays  = tracks.reduce((s, t) => s + (t.plays || 0), 0);
    const followers = db.follows.filter(f => f.artistId === u.id).length;
    return {
      id: u.id, username: u.username, bio: u.bio || '', avatar: u.avatar,
      trackCount: tracks.length, totalPlays: plays, followers,
    };
  }).filter(a => a.trackCount > 0)
    .sort((a, b) => b.totalPlays - a.totalPlays);

  res.json({ data: artists });
}));

// ── GET /api/artists/:id ──────────────────────────────────────────────────────
router.get('/:id', optionalAuth, [param('id').notEmpty()], validate, asyncHandler(async (req, res) => {
  const db = readDb();
  const base = `${req.protocol}://${req.get('host')}`;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Artist not found' });

  const tracks = db.tracks
    .filter(t => t.uploadedBy === user.id && t.isPublished !== false)
    .sort((a, b) => (b.plays || 0) - (a.plays || 0));

  const followers = db.follows.filter(f => f.artistId === user.id).length;
  const isFollowing = req.user
    ? db.follows.some(f => f.artistId === user.id && f.followerId === req.user.id)
    : false;

  res.json({
    artist: {
      id: user.id, username: user.username, bio: user.bio || '', avatar: user.avatar,
      followers, isFollowing,
      totalPlays: tracks.reduce((s, t) => s + (t.plays || 0), 0),
      trackCount: tracks.length,
      tracks: tracks.map(t => formatTrack(t, base)),
    },
  });
}));

// ── POST /api/artists/:id/follow ─────────────────────────────────────────────
router.post('/:id/follow', requireAuth, [param('id').notEmpty()], validate, asyncHandler(async (req, res) => {
  const db = readDb();
  const artist = db.users.find(u => u.id === req.params.id);
  if (!artist) return res.status(404).json({ error: 'Artist not found' });
  if (artist.id === req.user.id) return res.status(400).json({ error: "You can't follow yourself" });

  let following = false;
  updateDb(db => {
    const existing = db.follows.findIndex(f => f.artistId === req.params.id && f.followerId === req.user.id);
    if (existing === -1) {
      db.follows.push({ artistId: req.params.id, followerId: req.user.id, at: new Date().toISOString() });
      following = true;
    } else {
      db.follows.splice(existing, 1);
      following = false;
    }
  });

  res.json({ following });
}));

export default router;

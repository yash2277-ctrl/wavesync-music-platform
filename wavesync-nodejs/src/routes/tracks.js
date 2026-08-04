/**
 * Tracks CRUD + search + play-count + likes
 */
import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { readDb, updateDb } from '../services/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

function formatTrack(track, host, protocol) {
  const base = `${protocol}://${host}`;
  const cover = track.cover
    ? `${base}/uploads/covers/${track.cover}`
    : (track.coverSeed ? `https://picsum.photos/seed/${track.coverSeed}/600/600` : null);
  return {
    id:          track.id,
    title:       track.title,
    artist:      track.artist,
    album:       track.album,
    genre:       track.genre,
    mood:        track.mood,
    bpm:         track.bpm,
    duration:    track.duration || null,
    cover,
    streamUrl:   `${base}/api/stream/${track.id}`,
    plays:       track.plays || 0,
    likes:       track.likes || 0,
    lyrics:      track.lyrics || null,
    style:       track.style || null,
    isAI:        track.isAI || false,
    isPublished: track.isPublished !== false,
    uploadedBy:  track.uploadedBy || null,
    createdAt:   track.createdAt,
    updatedAt:   track.updatedAt || track.createdAt,
  };
}

// ── GET /api/tracks ───────────────────────────────────────────────────────────
router.get('/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('genre').optional().trim(),
    query('mood').optional().trim(),
    query('q').optional().trim(),
    query('sort').optional().isIn(['newest', 'oldest', 'plays', 'likes', 'title']),
    query('published').optional().isIn(['true', 'false', 'all']),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const page      = req.query.page  || 1;
    const limit     = req.query.limit || 20;
    const genre     = req.query.genre;
    const mood      = req.query.mood;
    const q         = (req.query.q || '').toLowerCase();
    const sort      = req.query.sort || 'newest';
    const published = req.query.published || 'true';

    const db = readDb();
    let tracks = db.tracks;

    // Filter by published status
    if (published === 'true')  tracks = tracks.filter(t => t.isPublished !== false);
    if (published === 'false') tracks = tracks.filter(t => t.isPublished === false);
    // 'all' — only allowed for the uploader or admin
    if (published === 'all' && req.user) {
      tracks = tracks.filter(t => t.uploadedBy === req.user.id || req.user.role === 'admin');
    }

    if (genre) tracks = tracks.filter(t => t.genre?.toLowerCase() === genre.toLowerCase());
    if (mood)  tracks = tracks.filter(t => t.mood?.toLowerCase()  === mood.toLowerCase());
    if (q)     tracks = tracks.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.artist?.toLowerCase().includes(q) ||
      t.album?.toLowerCase().includes(q) ||
      t.genre?.toLowerCase().includes(q)
    );

    // Sort
    const sorted = [...tracks].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'plays')  return (b.plays || 0) - (a.plays || 0);
      if (sort === 'likes')  return (b.likes || 0) - (a.likes || 0);
      if (sort === 'title')  return a.title.localeCompare(b.title);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

    const total  = sorted.length;
    const start  = (page - 1) * limit;
    const paged  = sorted.slice(start, start + limit);
    const host   = req.get('host');
    const proto  = req.protocol;

    res.json({
      data:       paged.map(t => formatTrack(t, host, proto)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

// ── GET /api/tracks/genres ────────────────────────────────────────────────────
router.get('/genres', asyncHandler(async (req, res) => {
  const db = readDb();
  const published = db.tracks.filter(t => t.isPublished !== false);
  const genres = [...new Set(published.map(t => t.genre).filter(Boolean))].sort();
  res.json({ genres });
}));

// ── GET /api/tracks/moods ─────────────────────────────────────────────────────
router.get('/moods', asyncHandler(async (req, res) => {
  const db = readDb();
  const published = db.tracks.filter(t => t.isPublished !== false);
  const moods = [...new Set(published.map(t => t.mood).filter(Boolean))].sort();
  res.json({ moods });
}));

// ── GET /api/tracks/recent ────────────────────────────────────────────────────
router.get('/recent', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const db = readDb();
  const byId = new Map(db.tracks.map(t => [t.id, t]));
  const host = req.get('host');
  const proto = req.protocol;

  const recent = db.recentPlays
    .slice(0, limit)
    .map(r => byId.get(r.id))
    .filter(Boolean)
    .filter(t => t.isPublished !== false)
    .map(t => formatTrack(t, host, proto));

  res.json({ data: recent });
}));

// ── GET /api/tracks/trending ──────────────────────────────────────────────────
router.get('/trending', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const db = readDb();
  const trending = db.tracks
    .filter(t => t.isPublished !== false)
    .sort((a, b) => ((b.plays || 0) + (b.likes || 0) * 2) - ((a.plays || 0) + (a.likes || 0) * 2))
    .slice(0, limit)
    .map(t => formatTrack(t, req.get('host'), req.protocol));
  res.json({ data: trending });
}));

// ── GET /api/tracks/:id ───────────────────────────────────────────────────────
router.get('/:id',
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const track = db.tracks.find(t => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json({ data: formatTrack(track, req.get('host'), req.protocol) });
  })
);

// ── PATCH /api/tracks/:id ─────────────────────────────────────────────────────
router.patch('/:id',
  requireAuth,
  [
    param('id').notEmpty(),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('artist').optional().trim().isLength({ max: 100 }),
    body('album').optional().trim().isLength({ max: 100 }),
    body('genre').optional().trim().isLength({ max: 50 }),
    body('mood').optional().trim().isLength({ max: 50 }),
    body('bpm').optional().isInt({ min: 1, max: 300 }).toInt(),
    body('isPublished').optional().isBoolean().toBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const track = db.tracks.find(t => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    if (track.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const allowed = ['title', 'artist', 'album', 'genre', 'mood', 'bpm', 'isPublished'];
    let updated;
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (!t) return;
      for (const key of allowed) {
        if (req.body[key] !== undefined) t[key] = req.body[key];
      }
      t.updatedAt = new Date().toISOString();
      updated = t;
    });

    res.json({ data: formatTrack(updated, req.get('host'), req.protocol) });
  })
);

// ── DELETE /api/tracks/:id ────────────────────────────────────────────────────
router.delete('/:id',
  requireAuth,
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const track = db.tracks.find(t => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    if (track.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    updateDb(db => {
      db.tracks = db.tracks.filter(t => t.id !== req.params.id);
    });

    // Optionally delete the audio file
    try {
      const { resolveFilePath } = await import('../services/audio.js');
      const fp = resolveFilePath(track.filePath);
      if (fp && (await import('fs')).default.existsSync(fp)) {
        (await import('fs')).default.unlinkSync(fp);
      }
    } catch { /* non-fatal */ }

    res.json({ message: 'Track deleted' });
  })
);

// ── POST /api/tracks/:id/play ─────────────────────────────────────────────────
router.post('/:id/play',
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (t) {
        t.plays = (t.plays || 0) + 1;
        db.recentPlays.unshift({ id: t.id, playedAt: new Date().toISOString() });
        db.recentPlays = db.recentPlays.slice(0, 100);
      }
    });
    res.json({ ok: true });
  })
);

// ── POST /api/tracks/:id/like ─────────────────────────────────────────────────
router.post('/:id/like',
  requireAuth,
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    let liked = false;
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (!t) return;
      if (!t.likedBy) t.likedBy = [];
      const idx = t.likedBy.indexOf(req.user.id);
      if (idx === -1) {
        t.likedBy.push(req.user.id);
        t.likes = (t.likes || 0) + 1;
        liked = true;
      } else {
        t.likedBy.splice(idx, 1);
        t.likes = Math.max(0, (t.likes || 1) - 1);
        liked = false;
      }
    });
    res.json({ liked });
  })
);

export default router;

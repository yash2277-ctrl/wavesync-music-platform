/**
 * Playlists — create, manage, share
 */
import { Router } from 'express';
import { body, param } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { readDb, updateDb } from '../services/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

function formatPlaylist(pl, db, host, protocol) {
  const base = `${protocol}://${host}`;
  const tracks = pl.trackIds
    .map(id => db.tracks.find(t => t.id === id))
    .filter(Boolean)
    .map(t => ({
      id: t.id, title: t.title, artist: t.artist,
      cover: t.cover ? `${base}/uploads/covers/${t.cover}` : null,
      streamUrl: `${base}/api/stream/${t.id}`,
      duration: t.duration || null,
    }));

  return {
    id:          pl.id,
    name:        pl.name,
    description: pl.description || '',
    isPublic:    pl.isPublic !== false,
    ownerId:     pl.ownerId,
    trackIds:    pl.trackIds,
    tracks,
    trackCount:  pl.trackIds.length,
    createdAt:   pl.createdAt,
    updatedAt:   pl.updatedAt || pl.createdAt,
  };
}

// ── GET /api/playlists ────────────────────────────────────────────────────────
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const db = readDb();
  let lists = db.playlists.filter(p => p.isPublic !== false);
  if (req.user) {
    // Also include private playlists owned by the user
    const myPrivate = db.playlists.filter(p => p.ownerId === req.user.id && p.isPublic === false);
    lists = [...lists, ...myPrivate];
  }
  res.json({ data: lists.map(p => formatPlaylist(p, db, req.get('host'), req.protocol)) });
}));

// ── GET /api/playlists/mine ───────────────────────────────────────────────────
router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const db = readDb();
  const mine = db.playlists.filter(p => p.ownerId === req.user.id);
  res.json({ data: mine.map(p => formatPlaylist(p, db, req.get('host'), req.protocol)) });
}));

// ── POST /api/playlists ───────────────────────────────────────────────────────
router.post('/',
  requireAuth,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name required (max 100 chars)'),
    body('description').optional().trim().isLength({ max: 300 }),
    body('isPublic').optional().isBoolean().toBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const pl = {
      id:          uuid(),
      name:        req.body.name,
      description: req.body.description || '',
      isPublic:    req.body.isPublic !== undefined ? req.body.isPublic : true,
      ownerId:     req.user.id,
      trackIds:    [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };
    updateDb(db => db.playlists.push(pl));
    const db = readDb();
    res.status(201).json({ playlist: formatPlaylist(pl, db, req.get('host'), req.protocol) });
  })
);

// ── GET /api/playlists/:id ────────────────────────────────────────────────────
router.get('/:id', optionalAuth, [param('id').notEmpty()], validate, asyncHandler(async (req, res) => {
  const db = readDb();
  const pl = db.playlists.find(p => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: 'Playlist not found' });
  if (!pl.isPublic && pl.ownerId !== req.user?.id) {
    return res.status(403).json({ error: 'This playlist is private' });
  }
  res.json({ playlist: formatPlaylist(pl, db, req.get('host'), req.protocol) });
}));

// ── PATCH /api/playlists/:id ──────────────────────────────────────────────────
router.patch('/:id',
  requireAuth,
  [
    param('id').notEmpty(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ max: 300 }),
    body('isPublic').optional().isBoolean().toBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const pl = db.playlists.find(p => p.id === req.params.id);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let updated;
    updateDb(db => {
      const p = db.playlists.find(p => p.id === req.params.id);
      if (!p) return;
      if (req.body.name        !== undefined) p.name        = req.body.name;
      if (req.body.description !== undefined) p.description = req.body.description;
      if (req.body.isPublic    !== undefined) p.isPublic    = req.body.isPublic;
      p.updatedAt = new Date().toISOString();
      updated = p;
    });

    const freshDb = readDb();
    res.json({ playlist: formatPlaylist(updated, freshDb, req.get('host'), req.protocol) });
  })
);

// ── POST /api/playlists/:id/tracks ────────────────────────────────────────────
router.post('/:id/tracks',
  requireAuth,
  [param('id').notEmpty(), body('trackId').notEmpty().withMessage('trackId required')],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const pl = db.playlists.find(p => p.id === req.params.id);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const track = db.tracks.find(t => t.id === req.body.trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    if (pl.trackIds.includes(req.body.trackId)) {
      return res.status(409).json({ error: 'Track already in playlist' });
    }

    let updated;
    updateDb(db => {
      const p = db.playlists.find(p => p.id === req.params.id);
      if (p) { p.trackIds.push(req.body.trackId); p.updatedAt = new Date().toISOString(); updated = p; }
    });

    const freshDb = readDb();
    res.json({ playlist: formatPlaylist(updated, freshDb, req.get('host'), req.protocol) });
  })
);

// ── DELETE /api/playlists/:id/tracks/:trackId ─────────────────────────────────
router.delete('/:id/tracks/:trackId',
  requireAuth,
  [param('id').notEmpty(), param('trackId').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const pl = db.playlists.find(p => p.id === req.params.id);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    let updated;
    updateDb(db => {
      const p = db.playlists.find(p => p.id === req.params.id);
      if (p) {
        p.trackIds = p.trackIds.filter(id => id !== req.params.trackId);
        p.updatedAt = new Date().toISOString();
        updated = p;
      }
    });

    const freshDb = readDb();
    res.json({ playlist: formatPlaylist(updated, freshDb, req.get('host'), req.protocol) });
  })
);

// ── DELETE /api/playlists/:id ─────────────────────────────────────────────────
router.delete('/:id',
  requireAuth,
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const pl = db.playlists.find(p => p.id === req.params.id);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    updateDb(db => { db.playlists = db.playlists.filter(p => p.id !== req.params.id); });
    res.json({ message: 'Playlist deleted' });
  })
);

export default router;

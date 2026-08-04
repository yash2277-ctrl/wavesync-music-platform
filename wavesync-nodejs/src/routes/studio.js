/**
 * Studio API — upload, manage, and publish your own tracks
 *
 * POST   /api/studio/upload          Upload audio + optional cover
 * GET    /api/studio/my-tracks       List your own tracks (all statuses)
 * GET    /api/studio/stats           Your studio stats
 * PATCH  /api/studio/tracks/:id      Edit metadata
 * POST   /api/studio/tracks/:id/publish    Publish a draft
 * POST   /api/studio/tracks/:id/unpublish  Unpublish
 * DELETE /api/studio/tracks/:id      Delete your track
 * POST   /api/studio/tracks/:id/cover  Replace cover art
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { body, param } from 'express-validator';
import { readDb, updateDb } from '../services/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AUDIO_DIR, COVERS_DIR, toRelativePath, detectGenre, resolveFilePath } from '../services/audio.js';

const router = Router();

// ── Multer config ─────────────────────────────────────────────────────────────

const audioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AUDIO_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${uuid()}${ext}`;
    cb(null, name);
  },
});

const coverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, COVERS_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/aac', 'audio/webm', 'audio/x-m4a'];
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const uploadAudio = multer({
  storage: audioStorage,
  limits:  { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    if (AUDIO_MIMES.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only audio files are allowed'), { status: 415 }));
    }
  },
});

const uploadCover = multer({
  storage: coverStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only image files are allowed for cover art'), { status: 415 }));
    }
  },
});

// Combined upload: audio (required) + cover (optional)
const uploadBoth = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      cb(null, file.fieldname === 'cover' ? COVERS_DIR : AUDIO_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || (file.fieldname === 'cover' ? '.jpg' : '.mp3');
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'audio' && (AUDIO_MIMES.includes(file.mimetype) || file.mimetype.startsWith('audio/'))) return cb(null, true);
    if (file.fieldname === 'cover' && IMAGE_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error(`Invalid file type for field "${file.fieldname}"`), { status: 415 }));
  },
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

function formatStudioTrack(track, host, protocol) {
  const base = `${protocol}://${host}`;
  return {
    id:          track.id,
    title:       track.title,
    artist:      track.artist,
    album:       track.album,
    genre:       track.genre,
    mood:        track.mood,
    bpm:         track.bpm,
    duration:    track.duration || null,
    cover:       track.cover
      ? `${base}/uploads/covers/${track.cover}`
      : (track.coverSeed ? `https://picsum.photos/seed/${track.coverSeed}/600/600` : null),
    streamUrl:   `${base}/api/stream/${track.id}`,
    plays:       track.plays || 0,
    likes:       track.likes || 0,
    lyrics:      track.lyrics || null,
    style:       track.style || null,
    isAI:        track.isAI || false,
    isPublished: track.isPublished !== false,
    uploadedBy:  track.uploadedBy,
    createdAt:   track.createdAt,
    updatedAt:   track.updatedAt || track.createdAt,
  };
}

// ── POST /api/studio/upload ───────────────────────────────────────────────────
router.post('/upload',
  requireAuth,
  (req, res, next) => {
    uploadBoth(req, res, err => {
      if (err) return next(err);
      next();
    });
  },
  [
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
    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required (field name: "audio")' });
    }

    const rawTitle = req.body.title || path.parse(audioFile.originalname).name;
    const genre    = req.body.genre || detectGenre(rawTitle);

    const track = {
      id:          uuid().replace(/-/g, '').slice(0, 12),
      title:       rawTitle,
      artist:      req.body.artist || req.user.username,
      album:       req.body.album  || 'Singles',
      genre,
      mood:        req.body.mood   || null,
      bpm:         req.body.bpm    || null,
      duration:    null,
      cover:       coverFile ? path.basename(coverFile.path) : null,
      filePath:    toRelativePath(audioFile.path),
      plays:       0,
      likes:       0,
      likedBy:     [],
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
      uploadedBy:  req.user.id,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    updateDb(db => db.tracks.push(track));

    res.status(201).json({
      message: 'Track uploaded successfully',
      track:   formatStudioTrack(track, req.get('host'), req.protocol),
    });
  })
);

// ── GET /api/studio/my-tracks ─────────────────────────────────────────────────
router.get('/my-tracks',
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const mine = db.tracks
      .filter(t => t.uploadedBy === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      data:  mine.map(t => formatStudioTrack(t, req.get('host'), req.protocol)),
      total: mine.length,
    });
  })
);

// ── GET /api/studio/stats ─────────────────────────────────────────────────────
router.get('/stats',
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const mine = db.tracks.filter(t => t.uploadedBy === req.user.id);

    const totalPlays  = mine.reduce((s, t) => s + (t.plays || 0), 0);
    const totalLikes  = mine.reduce((s, t) => s + (t.likes || 0), 0);
    const published   = mine.filter(t => t.isPublished !== false).length;
    const drafts      = mine.filter(t => t.isPublished === false).length;

    // Top track by plays
    const topTrack = mine.sort((a, b) => (b.plays || 0) - (a.plays || 0))[0] || null;

    res.json({
      totalTracks: mine.length,
      published,
      drafts,
      totalPlays,
      totalLikes,
      topTrack: topTrack ? formatStudioTrack(topTrack, req.get('host'), req.protocol) : null,
    });
  })
);

// ── PATCH /api/studio/tracks/:id ─────────────────────────────────────────────
router.patch('/tracks/:id',
  requireAuth,
  [
    param('id').notEmpty(),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('artist').optional().trim().isLength({ max: 100 }),
    body('album').optional().trim().isLength({ max: 100 }),
    body('genre').optional().trim().isLength({ max: 50 }),
    body('mood').optional().trim().isLength({ max: 50 }),
    body('bpm').optional().isInt({ min: 1, max: 300 }).toInt(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const track = db.tracks.find(t => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    if (track.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const editable = ['title', 'artist', 'album', 'genre', 'mood', 'bpm'];
    let updated;
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (!t) return;
      for (const key of editable) {
        if (req.body[key] !== undefined) t[key] = req.body[key];
      }
      t.updatedAt = new Date().toISOString();
      updated = t;
    });

    res.json({ track: formatStudioTrack(updated, req.get('host'), req.protocol) });
  })
);

// ── POST /api/studio/tracks/:id/publish ──────────────────────────────────────
router.post('/tracks/:id/publish',
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

    let updated;
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (t) { t.isPublished = true; t.updatedAt = new Date().toISOString(); updated = t; }
    });

    res.json({ message: 'Track published', track: formatStudioTrack(updated, req.get('host'), req.protocol) });
  })
);

// ── POST /api/studio/tracks/:id/unpublish ────────────────────────────────────
router.post('/tracks/:id/unpublish',
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

    let updated;
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (t) { t.isPublished = false; t.updatedAt = new Date().toISOString(); updated = t; }
    });

    res.json({ message: 'Track unpublished', track: formatStudioTrack(updated, req.get('host'), req.protocol) });
  })
);

// ── POST /api/studio/tracks/:id/cover ────────────────────────────────────────
router.post('/tracks/:id/cover',
  requireAuth,
  [param('id').notEmpty()],
  validate,
  (req, res, next) => uploadCover.single('cover')(req, res, next),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Cover image required (field: "cover")' });

    const db = readDb();
    const track = db.tracks.find(t => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    if (track.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete old cover if it exists
    if (track.cover) {
      const oldPath = path.join(COVERS_DIR, track.cover);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const coverFilename = path.basename(req.file.path);
    let updated;
    updateDb(db => {
      const t = db.tracks.find(t => t.id === req.params.id);
      if (t) { t.cover = coverFilename; t.updatedAt = new Date().toISOString(); updated = t; }
    });

    res.json({ message: 'Cover updated', track: formatStudioTrack(updated, req.get('host'), req.protocol) });
  })
);

// ── DELETE /api/studio/tracks/:id ────────────────────────────────────────────
router.delete('/tracks/:id',
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

    // Delete audio file
    try {
      const fp = resolveFilePath(track.filePath);
      if (fp && fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch { /* non-fatal */ }

    // Delete cover file
    try {
      if (track.cover) {
        const cp = path.join(COVERS_DIR, track.cover);
        if (fs.existsSync(cp)) fs.unlinkSync(cp);
      }
    } catch { /* non-fatal */ }

    updateDb(db => { db.tracks = db.tracks.filter(t => t.id !== req.params.id); });

    res.json({ message: 'Track deleted permanently' });
  })
);

export default router;

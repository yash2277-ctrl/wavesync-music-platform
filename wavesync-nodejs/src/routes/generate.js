/**
 * AI Generation API (Suno-style)
 *
 * POST   /api/generate              Start a generation job
 * GET    /api/generate/jobs         List my jobs
 * GET    /api/generate/jobs/:id     Poll a job's status
 * POST   /api/generate/jobs/:id/publish   Publish a finished generation to library
 * DELETE /api/generate/jobs/:id     Delete a job
 */
import { Router } from 'express';
import { body, param } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { readDb, updateDb } from '../services/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { synthesize, GENERATION_TIME_MS } from '../services/generator.js';

const router = Router();

function coverUrl(seed, host, protocol) {
  return `https://picsum.photos/seed/${seed}/600/600`;
}

function formatJob(job, host, protocol) {
  return {
    id:             job.id,
    status:         job.status,         // queued | generating | complete | failed
    prompt:         job.prompt,
    style:          job.style,
    title:          job.title,
    genre:          job.genre,
    mood:           job.mood,
    lyrics:         job.lyrics,
    isInstrumental: job.isInstrumental,
    bpm:            job.bpm,
    cover:          job.coverSeed ? coverUrl(job.coverSeed, host, protocol) : null,
    trackId:        job.trackId || null,
    streamUrl:      job.trackId ? `${protocol}://${host}/api/stream/${job.trackId}` : null,
    progress:       job.progress || 0,
    createdAt:      job.createdAt,
    completedAt:    job.completedAt || null,
  };
}

// ── POST /api/generate ────────────────────────────────────────────────────────
router.post('/',
  requireAuth,
  [
    body('prompt').optional().trim().isLength({ max: 500 }),
    body('style').optional().trim().isLength({ max: 200 }),
    body('title').optional().trim().isLength({ max: 200 }),
    body('lyrics').optional().trim().isLength({ max: 5000 }),
    body('genre').optional().trim().isLength({ max: 50 }),
    body('mood').optional().trim().isLength({ max: 50 }),
    body('isInstrumental').optional().isBoolean().toBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { prompt, style, title, lyrics, genre, mood, isInstrumental } = req.body;

    if (!prompt && !style && !lyrics) {
      return res.status(400).json({ error: 'Provide at least a prompt, style, or lyrics' });
    }

    // Synthesize metadata + pick playable audio
    const result = synthesize({ prompt, style, genre, mood, isInstrumental, title, lyrics });

    const jobId = uuid();
    const job = {
      id:             jobId,
      userId:         req.user.id,
      status:         'generating',
      progress:       5,
      prompt:         prompt || '',
      style:          result.style,
      title:          result.title,
      genre:          result.genre,
      mood:           result.mood,
      lyrics:         result.lyrics,
      isInstrumental: result.isInstrumental,
      bpm:            result.bpm,
      coverSeed:      result.coverSeed,
      filePath:       result.filePath,
      trackId:        null,
      createdAt:      new Date().toISOString(),
      completedAt:    null,
    };

    updateDb(db => db.generations.push(job));

    // Simulate async generation: after a delay, create the track and mark complete
    setTimeout(() => {
      try {
        const trackId = uuid().replace(/-/g, '').slice(0, 12);
        updateDb(db => {
          const j = db.generations.find(g => g.id === jobId);
          if (!j) return;
          j.status      = 'complete';
          j.progress    = 100;
          j.trackId     = trackId;
          j.completedAt = new Date().toISOString();

          // Create the actual track record (as a draft owned by the user)
          db.tracks.push({
            id:          trackId,
            title:       j.title,
            artist:      req.user.username,
            album:       'AI Singles',
            genre:       j.genre,
            mood:        j.mood,
            bpm:         j.bpm,
            duration:    null,
            cover:       null,           // uses coverSeed via picsum on the client
            coverSeed:   j.coverSeed,
            filePath:    j.filePath,
            lyrics:      j.lyrics,
            style:       j.style,
            plays:       0,
            likes:       0,
            likedBy:     [],
            isPublished: false,          // user decides to publish
            isAI:        true,
            uploadedBy:  req.user.id,
            createdAt:   new Date().toISOString(),
            updatedAt:   new Date().toISOString(),
          });
        });
      } catch (err) {
        updateDb(db => {
          const j = db.generations.find(g => g.id === jobId);
          if (j) { j.status = 'failed'; j.progress = 0; }
        });
      }
    }, GENERATION_TIME_MS);

    res.status(202).json({ job: formatJob(job, req.get('host'), req.protocol) });
  })
);

// ── GET /api/generate/jobs ────────────────────────────────────────────────────
router.get('/jobs', requireAuth, asyncHandler(async (req, res) => {
  const db = readDb();
  const mine = db.generations
    .filter(g => g.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ data: mine.map(j => formatJob(j, req.get('host'), req.protocol)) });
}));

// ── GET /api/generate/jobs/:id ────────────────────────────────────────────────
router.get('/jobs/:id', requireAuth, [param('id').notEmpty()], validate, asyncHandler(async (req, res) => {
  const db = readDb();
  const job = db.generations.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!job) return res.status(404).json({ error: 'Generation job not found' });
  res.json({ job: formatJob(job, req.get('host'), req.protocol) });
}));

// ── POST /api/generate/jobs/:id/publish ──────────────────────────────────────
router.post('/jobs/:id/publish', requireAuth, [param('id').notEmpty()], validate, asyncHandler(async (req, res) => {
  const db = readDb();
  const job = db.generations.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!job) return res.status(404).json({ error: 'Generation job not found' });
  if (job.status !== 'complete' || !job.trackId) {
    return res.status(400).json({ error: 'Generation not complete yet' });
  }

  updateDb(db => {
    const t = db.tracks.find(t => t.id === job.trackId);
    if (t) { t.isPublished = true; t.updatedAt = new Date().toISOString(); }
  });

  res.json({ message: 'Track published to library', trackId: job.trackId });
}));

// ── DELETE /api/generate/jobs/:id ────────────────────────────────────────────
router.delete('/jobs/:id', requireAuth, [param('id').notEmpty()], validate, asyncHandler(async (req, res) => {
  const db = readDb();
  const job = db.generations.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!job) return res.status(404).json({ error: 'Generation job not found' });

  updateDb(db => {
    db.generations = db.generations.filter(g => g.id !== req.params.id);
    // Also remove the unpublished track if it was never published
    if (job.trackId) {
      const t = db.tracks.find(t => t.id === job.trackId);
      if (t && !t.isPublished) db.tracks = db.tracks.filter(t => t.id !== job.trackId);
    }
  });

  res.json({ message: 'Generation deleted' });
}));

export default router;

/**
 * Audio streaming with range-request support
 */
import { Router } from 'express';
import { param } from 'express-validator';
import { readDb } from '../services/db.js';
import { resolveFilePath, streamAudio } from '../services/audio.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/:id',
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const track = db.tracks.find(t => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const filePath = resolveFilePath(track.filePath);
    if (!filePath) return res.status(404).json({ error: 'No audio file path stored' });

    streamAudio(req, res, filePath);
  })
);

export default router;

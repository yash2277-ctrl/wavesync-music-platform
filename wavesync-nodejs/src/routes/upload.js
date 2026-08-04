import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { readDb, writeDb } from '../services/db.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'samples');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const db = readDb();
    const id = crypto.createHash('md5').update(req.file.path).digest('hex').slice(0, 12);
    
    const relativeFilePath = path.relative(rootDir, req.file.path);

    const newTrack = {
      id,
      title: path.parse(req.file.originalname).name,
      artist: 'Unknown',
      album: 'Uploads',
      cover: null,
      // Persist project-relative paths so tracks remain streamable after deploy/move.
      filePath: relativeFilePath,
      createdAt: Date.now()
    };

    db.tracks.push(newTrack);
    writeDb(db);

    res.json({
      success: true,
      track: newTrack
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;

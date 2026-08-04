/**
 * WaveSync API Server
 * ─────────────────────────────────────────────────────────────────────────────
 * Robust Express backend with:
 *  - JWT auth (bcrypt passwords)
 *  - Full tracks CRUD + streaming with range requests
 *  - Studio: upload / manage / publish your own tracks
 *  - Playlists CRUD
 *  - Input validation on every endpoint
 *  - Global error handler
 *  - Rate limiting on auth routes
 *  - Static file serving for uploads (covers, audio)
 *  - SPA fallback for the built frontend
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Import routes ─────────────────────────────────────────────────────────────
import authRoutes      from './src/routes/auth.js';
import tracksRoutes    from './src/routes/tracks.js';
import streamRoutes    from './src/routes/stream.js';
import studioRoutes    from './src/routes/studio.js';
import playlistRoutes  from './src/routes/playlists.js';
import generateRoutes  from './src/routes/generate.js';
import artistRoutes    from './src/routes/artists.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { UPLOADS_DIR, AUDIO_DIR, COVERS_DIR } from './src/services/audio.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Global middleware ─────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter (generous — auth routes have their own tighter limit)
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down' },
}));

// ── Static file serving ───────────────────────────────────────────────────────
// Serve uploaded covers and audio files
app.use('/uploads/covers', express.static(COVERS_DIR));
app.use('/uploads/audio',  express.static(AUDIO_DIR));
// Legacy path support
app.use('/uploads', express.static(UPLOADS_DIR));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    ok:        true,
    timestamp: new Date().toISOString(),
    version:   '2.0.0',
    uptime:    process.uptime(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/tracks',    tracksRoutes);
app.use('/api/stream',    streamRoutes);
app.use('/api/studio',    studioRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/generate',  generateRoutes);
app.use('/api/artists',   artistRoutes);

// ── 404 for unknown /api routes ───────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── Serve built frontend (SPA) ────────────────────────────────────────────────
const clientDist = path.resolve(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  console.log(`[static] Serving frontend from ${clientDist}`);
}

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵  WaveSync API  v2.0.0`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n   Endpoints:`);
  console.log(`   POST   /api/auth/signup`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/tracks          (browse, search, filter)`);
  console.log(`   GET    /api/tracks/genres`);
  console.log(`   GET    /api/tracks/moods`);
  console.log(`   GET    /api/tracks/recent`);
  console.log(`   GET    /api/stream/:id      (range-request audio)`);
  console.log(`   POST   /api/studio/upload   (multipart: audio + cover)`);
  console.log(`   GET    /api/studio/my-tracks`);
  console.log(`   GET    /api/studio/stats`);
  console.log(`   PATCH  /api/studio/tracks/:id`);
  console.log(`   POST   /api/studio/tracks/:id/publish`);
  console.log(`   POST   /api/studio/tracks/:id/unpublish`);
  console.log(`   POST   /api/studio/tracks/:id/cover`);
  console.log(`   DELETE /api/studio/tracks/:id`);
  console.log(`   GET    /api/playlists`);
  console.log(`   POST   /api/playlists`);
  console.log(`   PATCH  /api/playlists/:id`);
  console.log(`   POST   /api/playlists/:id/tracks`);
  console.log(`   DELETE /api/playlists/:id/tracks/:trackId`);
  console.log(`\n   GET    /api/health\n`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully…`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('uncaughtException', err => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

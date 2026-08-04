/**
 * Atomic JSON database service.
 * Writes are done to a temp file then renamed to prevent corruption.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'db.json');
const TMP_FILE = path.join(DATA_DIR, 'db.tmp.json');

const SCHEMA = {
  users:       [],
  tracks:      [],
  recentPlays: [],
  releases:    [],   // studio releases
  playlists:   [],
  generations: [],   // AI generation jobs
  follows:     [],   // { followerId, artistId }
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function migrate(data) {
  // Add any missing top-level keys from SCHEMA
  for (const [key, def] of Object.entries(SCHEMA)) {
    if (data[key] === undefined) data[key] = def;
  }
  // Ensure every track has required fields
  data.tracks = data.tracks.map(t => ({
    genre:       'general',
    mood:        null,
    bpm:         null,
    plays:       0,
    likes:       0,
    likedBy:     [],
    isPublished: true,
    uploadedBy:  null,
    lyrics:      null,
    style:       null,
    coverSeed:   null,
    isAI:        false,
    ...t,
  }));
  return data;
}

export function readDb() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const fresh = { ...SCHEMA };
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return migrate(JSON.parse(raw));
  } catch {
    // Corrupted — return fresh schema
    return { ...SCHEMA };
  }
}

export function writeDb(data) {
  ensureDir();
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(TMP_FILE, json);
  fs.renameSync(TMP_FILE, DB_FILE);  // atomic on same filesystem
}

/** Convenience: read → mutate → write in one call */
export function updateDb(fn) {
  const db = readDb();
  fn(db);
  writeDb(db);
  return db;
}

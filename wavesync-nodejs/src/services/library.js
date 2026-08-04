import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { readDb, writeDb } from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplesDir = path.join(__dirname, '../../uploads/samples');
const rootDir = path.resolve(__dirname, '..', '..');

function toAbsoluteTrackPath(trackPath) {
  if (!trackPath) return null;
  return path.normalize(path.isAbsolute(trackPath) ? trackPath : path.join(rootDir, trackPath));
}

function toStoredTrackPath(absPath) {
  const relative = path.relative(rootDir, absPath);
  return relative.startsWith('..') ? absPath : relative;
}

function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// Detect genre from song title or filename
function detectGenre(title) {
  const lowerTitle = title.toLowerCase();
  
  // Genre keywords mapping
  if (lowerTitle.match(/chill|relax|calm|peaceful|ambient|lofi|lo-fi/)) return 'chill';
  if (lowerTitle.match(/love|romantic|romance|heart|kiss|together|saiyaara|tu|tere|dil/)) return 'romantic';
  if (lowerTitle.match(/party|dance|club|edm|beat|bass|trap/)) return 'party';
  if (lowerTitle.match(/ocean|wave|sea|beach|coastal|water|blue|breeze|dreams|rider/)) return 'ocean';
  if (lowerTitle.match(/mountain|peak|high|summit|nature|forest/)) return 'nature';
  if (lowerTitle.match(/summer|sun|warm|tropical|vibes/)) return 'summer';
  if (lowerTitle.match(/night|moon|dark|midnight|evening/)) return 'night';
  if (lowerTitle.match(/workout|gym|energy|power|pump/)) return 'workout';
  if (lowerTitle.match(/focus|study|concentrate|work/)) return 'focus';
  if (lowerTitle.match(/jazz|blues|soul/)) return 'jazz';
  if (lowerTitle.match(/rock|metal|punk/)) return 'rock';
  if (lowerTitle.match(/classical|piano|symphony/)) return 'classical';
  if (lowerTitle.match(/hip.?hop|rap/)) return 'hiphop';
  if (lowerTitle.match(/acoustic|folk/)) return 'acoustic';
  
  return 'general';
}

export function scanLibrary() {
  const db = readDb();
  if (!fs.existsSync(samplesDir)) return db;

  const files = fs.readdirSync(samplesDir).filter(f => f.toLowerCase().endsWith('.mp3'));

  // Migrate legacy absolute paths to relative when they are inside the project.
  for (const track of db.tracks) {
    const abs = toAbsoluteTrackPath(track.filePath);
    if (abs) {
      track.filePath = toStoredTrackPath(abs);
    }
  }

  const dedupedTracks = [];
  const existingByPath = new Map();
  for (const track of db.tracks) {
    const abs = toAbsoluteTrackPath(track.filePath);
    if (!abs) continue;
    const key = abs.toLowerCase();
    if (!existingByPath.has(key)) {
      dedupedTracks.push(track);
      existingByPath.set(key, track);
    }
  }
  db.tracks = dedupedTracks;

  for (const f of files) {
    const fullPath = path.normalize(path.join(samplesDir, f));
    const fullPathKey = fullPath.toLowerCase();
    if (!existingByPath.has(fullPathKey)) {
      const id = hash(fullPath).slice(0, 12);
      const title = path.parse(f).name;
      const genre = detectGenre(title);
      
      db.tracks.push({
        id,
        title,
        artist: 'Unknown',
        album: 'Samples',
        genre,
        cover: null,
        filePath: toStoredTrackPath(fullPath),
        createdAt: Date.now()
      });
    } else {
      // Update existing tracks with genre if missing
      const track = existingByPath.get(fullPathKey);
      if (!track.genre) {
        track.genre = detectGenre(track.title);
      }
    }
  }

  writeDb(db);
  return db;
}

export function searchTracks(q) {
  const { tracks } = readDb();
  const term = (q || '').toLowerCase();
  return tracks.filter(t =>
    t.title.toLowerCase().includes(term) ||
    (t.artist || '').toLowerCase().includes(term) ||
    (t.album || '').toLowerCase().includes(term)
  );
}

export function getAllTracks() {
  return readDb().tracks;
}

export function addRecentPlay(id) {
  const db = readDb();
  db.recentPlays.unshift({ id, playedAt: Date.now() });
  db.recentPlays = db.recentPlays.slice(0, 50);
  writeDb(db);
}

export function getRecentPlays() {
  const db = readDb();
  const ids = db.recentPlays.map(r => r.id);
  const byId = new Map(db.tracks.map(t => [t.id, t]));
  return ids.map(id => byId.get(id)).filter(Boolean);
}

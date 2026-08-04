/**
 * Audio file utilities — content-type detection, range streaming, metadata.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
export const ROOT_DIR    = path.resolve(__dirname, '..', '..');
export const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
export const COVERS_DIR  = path.join(UPLOADS_DIR, 'covers');
export const AUDIO_DIR   = path.join(UPLOADS_DIR, 'audio');

// Ensure upload directories exist
for (const dir of [UPLOADS_DIR, COVERS_DIR, AUDIO_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const MIME_MAP = {
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
  '.m4a':  'audio/mp4',
  '.mp4':  'audio/mp4',
  '.flac': 'audio/flac',
  '.aac':  'audio/aac',
  '.webm': 'audio/webm',
};

export function getAudioMime(filePath) {
  return MIME_MAP[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

export function resolveFilePath(storedPath) {
  if (!storedPath) return null;
  if (path.isAbsolute(storedPath)) return path.normalize(storedPath);
  return path.normalize(path.join(ROOT_DIR, storedPath));
}

export function toRelativePath(absPath) {
  const rel = path.relative(ROOT_DIR, absPath);
  return rel.startsWith('..') ? absPath : rel;
}

/**
 * Stream an audio file with proper range-request support.
 * Handles both full and partial content (206).
 */
export function streamAudio(req, res, filePath) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found on disk' });
  }

  const stat = fs.statSync(filePath);
  const size = stat.size;
  const mime = getAudioMime(filePath);
  const range = req.headers.range;

  if (range) {
    const [rawStart, rawEnd] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(rawStart, 10);
    const end   = rawEnd ? parseInt(rawEnd, 10) : size - 1;

    if (isNaN(start) || isNaN(end) || start > end || end >= size) {
      return res.status(416).set('Content-Range', `bytes */${size}`).end();
    }

    res.writeHead(206, {
      'Content-Range':  `bytes ${start}-${end}/${size}`,
      'Accept-Ranges':  'bytes',
      'Content-Length': end - start + 1,
      'Content-Type':   mime,
      'Cache-Control':  'no-cache',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Accept-Ranges':  'bytes',
      'Content-Length': size,
      'Content-Type':   mime,
      'Cache-Control':  'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

/** Detect genre from filename heuristics */
export function detectGenre(title = '') {
  const t = title.toLowerCase();
  if (/chill|relax|calm|ambient|lofi|lo-fi/.test(t))          return 'chill';
  if (/love|romantic|romance|heart|saiyaara|dil/.test(t))     return 'romantic';
  if (/party|dance|club|edm|trap/.test(t))                    return 'party';
  if (/ocean|wave|sea|beach|coastal/.test(t))                 return 'ocean';
  if (/nature|forest|mountain/.test(t))                       return 'nature';
  if (/summer|sun|tropical/.test(t))                          return 'summer';
  if (/night|moon|midnight/.test(t))                          return 'night';
  if (/workout|gym|energy|pump/.test(t))                      return 'workout';
  if (/focus|study|concentrate/.test(t))                      return 'focus';
  if (/jazz|blues|soul/.test(t))                              return 'jazz';
  if (/rock|metal|punk/.test(t))                              return 'rock';
  if (/classical|piano|symphony/.test(t))                     return 'classical';
  if (/hip.?hop|rap/.test(t))                                 return 'hiphop';
  if (/acoustic|folk/.test(t))                                return 'acoustic';
  return 'general';
}

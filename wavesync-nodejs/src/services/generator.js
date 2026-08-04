/**
 * AI Music Generation Engine (simulated).
 *
 * Real text-to-music models aren't run locally, so this engine:
 *  - Picks a real audio file from the sample pool as the playable source
 *  - Procedurally generates a title, lyrics, cover seed, genre & mood from the prompt
 *  - Simulates async processing (queued → generating → complete)
 *
 * Swap `pickAudioSource()` + the timing for a real model API later — the
 * route/contract stays identical.
 */
import fs from 'fs';
import path from 'path';
import { AUDIO_DIR, ROOT_DIR, toRelativePath, detectGenre } from './audio.js';

const SAMPLE_DIRS = [
  path.join(ROOT_DIR, 'uploads', 'samples'),
  AUDIO_DIR,
];

export function listAudioPool() {
  const pool = [];
  for (const dir of SAMPLE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (/\.(mp3|wav|ogg|m4a|flac)$/i.test(f)) {
        pool.push(path.join(dir, f));
      }
    }
  }
  return pool;
}

export function pickAudioSource() {
  const pool = listAudioPool();
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Procedural metadata generation ────────────────────────────────────────────

const TITLE_PREFIX = ['Neon', 'Midnight', 'Crystal', 'Electric', 'Velvet', 'Golden', 'Silent', 'Cosmic', 'Liquid', 'Frozen', 'Burning', 'Echo', 'Lunar', 'Solar', 'Phantom', 'Dream'];
const TITLE_NOUN   = ['Horizon', 'Pulse', 'Mirage', 'Cascade', 'Echoes', 'Reverie', 'Voltage', 'Tide', 'Ember', 'Static', 'Bloom', 'Drift', 'Halo', 'Vortex', 'Skyline', 'Aurora'];

const MOODS  = ['energetic', 'chill', 'focused', 'party', 'melancholy', 'workout', 'romantic', 'happy', 'dark', 'dreamy'];
const GENRES = ['electronic', 'pop', 'lo-fi', 'synthwave', 'hiphop', 'ambient', 'rock', 'jazz', 'cinematic', 'house'];

function titleFromPrompt(prompt) {
  const words = (prompt || '').split(/\s+/).filter(w => w.length > 3);
  if (words.length >= 2) {
    const cap = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    return `${cap(words[0])} ${cap(words[words.length - 1])}`;
  }
  const p = TITLE_PREFIX[Math.floor(Math.random() * TITLE_PREFIX.length)];
  const n = TITLE_NOUN[Math.floor(Math.random() * TITLE_NOUN.length)];
  return `${p} ${n}`;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/** Very simple structured lyric generator seeded by the prompt */
function generateLyrics(prompt, isInstrumental) {
  if (isInstrumental) return '[Instrumental]';
  const theme = (prompt || 'the night').trim();
  return [
    '[Verse 1]',
    `In the glow of ${theme}, I find my way`,
    `Every heartbeat echoes what I couldn't say`,
    `Chasing all the colors fading into grey`,
    `Holding on to moments that don't fade away`,
    '',
    '[Chorus]',
    `We rise, we fall, we burn so bright`,
    `Lost inside the rhythm of the night`,
    `Hold me close, don't let me go`,
    `In this sound, we're never alone`,
    '',
    '[Verse 2]',
    `Shadows dancing softly on the wall`,
    `Whispers of a feeling we recall`,
    `Through the static, hear the melody`,
    `This is who we're always meant to be`,
    '',
    '[Bridge]',
    `And when the world goes quiet`,
    `Our song will still remain`,
    '',
    '[Chorus]',
    `We rise, we fall, we burn so bright`,
    `Lost inside the rhythm of the night`,
  ].join('\n');
}

/**
 * Build a generation result object from a request.
 * Returns metadata + a real playable filePath.
 */
export function synthesize({ prompt, style, genre, mood, isInstrumental, title, lyrics }) {
  const source = pickAudioSource();
  const resolvedGenre = genre || (style ? detectGenre(style) : null) || pick(GENRES);
  const resolvedMood  = mood || pick(MOODS);
  const resolvedTitle = title || titleFromPrompt(prompt || style);

  return {
    title:      resolvedTitle,
    genre:      resolvedGenre,
    mood:       resolvedMood,
    style:      style || resolvedGenre,
    lyrics:     lyrics || generateLyrics(prompt, isInstrumental),
    isInstrumental: !!isInstrumental,
    filePath:   source ? toRelativePath(source) : null,
    coverSeed:  Math.random().toString(36).slice(2, 10),
    bpm:        60 + Math.floor(Math.random() * 100),
    duration:   null,
  };
}

/** Simulated processing time in ms (Suno-style ~ a few seconds) */
export const GENERATION_TIME_MS = 6000;

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function main() {
  const count = parseInt(process.argv[2] || '10000', 10);
  const sampleFile = process.argv[3] || 'uploads/samples/saiyaara.mp3';

  const repoRoot = path.resolve(process.cwd());
  const dbPath = path.join(repoRoot, 'data', 'db.json');

  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(raw);
    if (!Array.isArray(db.tracks)) db.tracks = [];

    const existing = new Set(db.tracks.map(t => t.title + '|' + t.filePath));

    console.log(`Current tracks: ${db.tracks.length}`);
    let added = 0;

    for (let i = 0; i < count; i++) {
      const title = `Mock Track ${db.tracks.length + 1}`;
      const id = crypto.createHash('md5').update(title + Date.now() + Math.random()).digest('hex').slice(0,12);
      const filePath = sampleFile; // reference existing sample to avoid huge disk usage

      const key = title + '|' + filePath;
      if (existing.has(key)) {
        // skip duplicates
        continue;
      }

      const track = {
        id,
        title,
        artist: 'Unknown',
        album: 'Mock Samples',
        genre: 'general',
        cover: null,
        filePath,
        duration: 200,
        createdAt: Date.now()
      };

      db.tracks.push(track);
      existing.add(key);
      added++;

      if (added % 500 === 0) {
        console.log(`Added ${added} mock tracks...`);
      }
    }

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Done. Added ${added} tracks. New total: ${db.tracks.length}`);
    console.log('You can verify with: curl http://localhost:3000/api/library | jq length');
  } catch (err) {
    console.error('Failed to generate mock tracks:', err);
    process.exit(1);
  }
}

main();

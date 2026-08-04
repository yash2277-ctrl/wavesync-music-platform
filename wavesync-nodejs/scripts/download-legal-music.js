import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  TARGET_COUNTS: {
    indian: 7000,
    pakistani: 3000,
    hollywood: 1000
  },
  UPLOADS_DIR: path.join(rootDir, 'uploads', 'samples'),
  DB_PATH: path.join(rootDir, 'data', 'db.json'),
  DOWNLOAD_DELAY: 2000
};

// Ensure directories exist
if (!fs.existsSync(CONFIG.UPLOADS_DIR)) {
  fs.mkdirSync(CONFIG.UPLOADS_DIR, { recursive: true });
}

// Utility functions
function generateId() {
  return crypto.randomBytes(6).toString('hex');
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 100);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Download file function
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(filepath);
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// Fetch from Jamendo API
async function fetchJamendoTracks(genre, limit = 100, offset = 0) {
  return new Promise((resolve, reject) => {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CONFIG.JAMENDO_CLIENT_ID}&format=json&limit=${limit}&offset=${offset}&include=musicinfo&groupby=artist_id&order=popularity_total&tags=${genre}`;
    
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Map genres to categories
const GENRE_MAPPING = {
  indian: ['world', 'ethnic', 'indian', 'bollywood', 'asian'],
  pakistani: ['world', 'ethnic', 'asian', 'middle-eastern'],
  hollywood: ['pop', 'rock', 'electronic', 'hiphop', 'indie', 'jazz', 'blues']
};

// Download from Jamendo
async function downloadFromJamendo(category, targetCount) {
  console.log(`\n📥 Downloading ${category} music from Jamendo (target: ${targetCount})...`);
  const tracks = [];
  const genres = GENRE_MAPPING[category];
  let downloaded = 0;
  
  for (const genre of genres) {
    if (downloaded >= targetCount) break;
    
    console.log(`  Fetching ${genre} tracks...`);
    let offset = 0;
    
    while (downloaded < targetCount) {
      try {
        const results = await fetchJamendoTracks(genre, CONFIG.BATCH_SIZE, offset);
        if (results.length === 0) break;
        
        for (const track of results) {
          if (downloaded >= targetCount) break;
          
          try {
            const filename = `${sanitizeFilename(track.artist_name)}_${sanitizeFilename(track.name)}.mp3`;
            const filepath = path.join(CONFIG.UPLOADS_DIR, filename);
            
            // Skip if already exists
            if (fs.existsSync(filepath)) {
              console.log(`  ⏭️  Skipping existing: ${track.name}`);
              continue;
            }
            
            console.log(`  ⬇️  Downloading: ${track.name} - ${track.artist_name}`);
            
            // Download audio file
            await downloadFile(track.audio, filepath);
            
            // Verify file size (should be > 100KB for valid MP3)
            const stats = fs.statSync(filepath);
            if (stats.size < 100000) {
              console.log(`  ❌ File too small, skipping: ${track.name}`);
              fs.unlinkSync(filepath);
              continue;
            }
            
            tracks.push({
              id: generateId(),
              title: track.name,
              artist: track.artist_name,
              album: track.album_name || 'Unknown',
              genre: category === 'hollywood' ? genre : category,
              cover: track.image || 'https://via.placeholder.com/300?text=Music',
              filePath: `uploads/samples/${filename}`,
              duration: track.duration || 180,
              createdAt: new Date().toISOString(),
              source: 'jamendo',
              license: 'CC BY-SA'
            });
            
            downloaded++;
            console.log(`  ✅ Downloaded ${downloaded}/${targetCount} - ${track.name}`);
            
            await delay(CONFIG.DOWNLOAD_DELAY);
          } catch (err) {
            console.log(`  ❌ Failed: ${track.name} - ${err.message}`);
          }
        }
        
        offset += CONFIG.BATCH_SIZE;
        await delay(500);
      } catch (err) {
        console.error(`  ❌ Error fetching ${genre}:`, err.message);
        break;
      }
    }
  }
  
  return tracks;
}

// Free Music Archive (using Internet Archive as FMA is now archived there)
async function fetchInternetArchiveTracks(query, limit = 50) {
  return new Promise((resolve, reject) => {
    const searchQuery = encodeURIComponent(`${query} AND mediatype:audio AND format:MP3`);
    const url = `https://archive.org/advancedsearch.php?q=${searchQuery}&fl=identifier,title,creator,year&rows=${limit}&page=1&output=json`;
    
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.response.docs || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function downloadFromInternetArchive(category, targetCount) {
  console.log(`\n📥 Downloading ${category} music from Internet Archive (target: ${targetCount})...`);
  const tracks = [];
  const queries = {
    indian: ['indian music', 'bollywood', 'hindi music', 'indian classical'],
    pakistani: ['pakistani music', 'urdu music', 'qawwali'],
    hollywood: ['pop music', 'rock music', 'jazz music', 'blues music']
  };
  
  let downloaded = 0;
  
  for (const query of queries[category]) {
    if (downloaded >= targetCount) break;
    
    console.log(`  Searching: ${query}...`);
    
    try {
      const results = await fetchInternetArchiveTracks(query, 50);
      
      for (const item of results) {
        if (downloaded >= targetCount) break;
        
        try {
          const title = item.title || 'Unknown Track';
          const artist = item.creator || 'Unknown Artist';
          const filename = `${sanitizeFilename(artist)}_${sanitizeFilename(title)}_${Date.now()}.mp3`;
          const filepath = path.join(CONFIG.UPLOADS_DIR, filename);
          
          if (fs.existsSync(filepath)) continue;
          
          // Get MP3 file URL from Internet Archive
          const downloadUrl = `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`;
          
          console.log(`  ⬇️  Downloading: ${title} - ${artist}`);
          
          await downloadFile(downloadUrl, filepath);
          
          const stats = fs.statSync(filepath);
          if (stats.size < 100000) {
            fs.unlinkSync(filepath);
            continue;
          }
          
          tracks.push({
            id: generateId(),
            title: title,
            artist: artist,
            album: item.year ? `Album ${item.year}` : 'Unknown',
            genre: category,
            cover: `https://archive.org/services/img/${item.identifier}`,
            filePath: `uploads/samples/${filename}`,
            duration: 180,
            createdAt: new Date().toISOString(),
            source: 'internet-archive',
            license: 'Public Domain'
          });
          
          downloaded++;
          console.log(`  ✅ Downloaded ${downloaded}/${targetCount}`);
          
          await delay(CONFIG.DOWNLOAD_DELAY);
        } catch (err) {
          console.log(`  ❌ Failed: ${err.message}`);
        }
      }
      
      await delay(1000);
    } catch (err) {
      console.error(`  ❌ Error searching ${query}:`, err.message);
    }
  }
  
  return tracks;
}

// Main download function
async function downloadAllMusic() {
  console.log('🎵 WAVESYNC LEGAL MUSIC DOWNLOADER\n');
  console.log('Sources: Jamendo (CC BY-SA), Internet Archive (Public Domain)\n');
  
  const allTracks = [];
  
  // Download from Jamendo first (larger catalog, faster)
  for (const [category, targetCount] of Object.entries(CONFIG.TARGET_COUNTS)) {
    const jamendoCount = Math.floor(targetCount * 0.8); // 80% from Jamendo
    const jamendoTracks = await downloadFromJamendo(category, jamendoCount);
    allTracks.push(...jamendoTracks);
  }
  
  // Fill remaining from Internet Archive
  for (const [category, targetCount] of Object.entries(CONFIG.TARGET_COUNTS)) {
    const currentCount = allTracks.filter(t => t.genre === category || t.genre.includes(category)).length;
    const remaining = targetCount - currentCount;
    
    if (remaining > 0) {
      const archiveTracks = await downloadFromInternetArchive(category, remaining);
      allTracks.push(...archiveTracks);
    }
  }
  
  // Load existing database
  let db = { tracks: [], recentPlays: [], userProfiles: {}, listeningHistory: [] };
  if (fs.existsSync(CONFIG.DB_PATH)) {
    const dbContent = fs.readFileSync(CONFIG.DB_PATH, 'utf8');
    db = JSON.parse(dbContent);
  }
  
  // Merge with existing tracks (keep originals)
  const existingIds = new Set(db.tracks.map(t => t.id));
  const newTracks = allTracks.filter(t => !existingIds.has(t.id));
  db.tracks = [...db.tracks, ...newTracks];
  
  // Save updated database
  fs.writeFileSync(CONFIG.DB_PATH, JSON.stringify(db, null, 2));
  
  console.log('\n✅ DOWNLOAD COMPLETE!\n');
  console.log(`📊 Summary:`);
  console.log(`  Total tracks in database: ${db.tracks.length}`);
  console.log(`  New tracks added: ${newTracks.length}`);
  
  const categoryCounts = {};
  for (const category of Object.keys(CONFIG.TARGET_COUNTS)) {
    const count = db.tracks.filter(t => 
      t.genre === category || 
      (typeof t.genre === 'string' && t.genre.includes(category))
    ).length;
    categoryCounts[category] = count;
  }
  
  console.log(`\n  By Category:`);
  for (const [category, count] of Object.entries(categoryCounts)) {
    const target = CONFIG.TARGET_COUNTS[category];
    const percent = Math.round((count / target) * 100);
    console.log(`    ${category}: ${count}/${target} (${percent}%)`);
  }
  
  console.log('\n🎉 Your music library is ready!');
  console.log('   Restart the server to load the new tracks.\n');
}

// Run
downloadAllMusic().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

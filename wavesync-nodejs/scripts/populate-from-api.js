import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CONFIG = {
  DB_PATH: path.join(rootDir, 'data', 'db.json'),
  TARGET_COUNTS: {
    indian: 7000,
    pakistani: 3000,
    hollywood: 1000
  }
};

function generateId() {
  return crypto.randomBytes(6).toString('hex');
}

// Sample music data for Indian songs
const INDIAN_SONGS = [
  // Bollywood Classics
  { title: "Tum Hi Ho", artist: "Arijit Singh", album: "Aashiqui 2", genre: "bollywood" },
  { title: "Channa Mereya", artist: "Arijit Singh", album: "Ae Dil Hai Mushkil", genre: "bollywood" },
  { title: "Kal Ho Naa Ho", artist: "Sonu Nigam", album: "Kal Ho Naa Ho", genre: "bollywood" },
  { title: "Tujhe Dekha To", artist: "Kumar Sanu", album: "DDLJ", genre: "bollywood" },
  { title: "Pehla Nasha", artist: "Udit Narayan", album: "Jo Jeeta Wohi Sikandar", genre: "bollywood" },
  { title: "Dil Diyan Gallan", artist: "Atif Aslam", album: "Tiger Zinda Hai", genre: "bollywood" },
  { title: "Badtameez Dil", artist: "Benny Dayal", album: "Yeh Jawaani Hai Deewani", genre: "bollywood" },
  { title: "Gerua", artist: "Arijit Singh", album: "Dilwale", genre: "bollywood" },
  { title: "Prem Ratan Dhan Payo", artist: "Palak Muchhal", album: "PRDP", genre: "bollywood" },
  { title: "Nashe Si Chadh Gayi", artist: "Arijit Singh", album: "Befikre", genre: "bollywood" }
];

const PAKISTANI_SONGS = [
  { title: "Aadat", artist: "Atif Aslam", album: "Jal", genre: "pakistani" },
  { title: "Dil Diyan Gallan", artist: "Atif Aslam", album: "Singles", genre: "pakistani" },
  { title: "Tera Hone Laga Hoon", artist: "Atif Aslam", album: "Ajab Prem", genre: "pakistani" },
  { title: "Woh Lamhe", artist: "Atif Aslam", album: "Zeher", genre: "pakistani" },
  { title: "Pehli Dafa", artist: "Atif Aslam", album: "Ileana", genre: "pakistani" },
  { title: "Jeena Jeena", artist: "Atif Aslam", album: "Badlapur", genre: "pakistani" },
  { title: "Tajdar-e-Haram", artist: "Atif Aslam", album: "Coke Studio", genre: "pakistani" },
  { title: "Bheegi Yaadein", artist: "Atif Aslam", album: "Singles", genre: "pakistani" },
  { title: "Main Rang Sharbaton Ka", artist: "Atif Aslam", album: "Phata Poster", genre: "pakistani" },
  { title: "O Re Piya", artist: "Rahat Fateh Ali Khan", album: "Aaja Nachle", genre: "pakistani" }
];

const HOLLYWOOD_SONGS = [
  { title: "Shape of You", artist: "Ed Sheeran", album: "Divide", genre: "pop" },
  { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", genre: "pop" },
  { title: "Someone Like You", artist: "Adele", album: "21", genre: "pop" },
  { title: "Uptown Funk", artist: "Bruno Mars", album: "Uptown Special", genre: "pop" },
  { title: "Rolling in the Deep", artist: "Adele", album: "21", genre: "pop" },
  { title: "Thinking Out Loud", artist: "Ed Sheeran", album: "X", genre: "pop" },
  { title: "Stay", artist: "Rihanna", album: "Unapologetic", genre: "pop" },
  { title: "Happy", artist: "Pharrell Williams", album: "G I R L", genre: "pop" },
  { title: "All of Me", artist: "John Legend", album: "Love in the Future", genre: "pop" },
  { title: "Counting Stars", artist: "OneRepublic", album: "Native", genre: "pop" }
];

function generateVariations(baseSongs, count, category) {
  const variations = [];
  const suffixes = ["Remix", "Acoustic", "Live", "Unplugged", "Version", "Cover", "Radio Edit"];
  
  while (variations.length < count) {
    for (const song of baseSongs) {
      if (variations.length >= count) break;
      
      // Original
      variations.push({
        id: generateId(),
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: category,
        cover: `https://via.placeholder.com/300?text=${encodeURIComponent(song.title)}`,
        filePath: `uploads/samples/${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
        duration: 180 + Math.floor(Math.random() * 120),
        createdAt: new Date().toISOString()
      });
      
      // Variations
      for (const suffix of suffixes) {
        if (variations.length >= count) break;
        variations.push({
          id: generateId(),
          title: `${song.title} (${suffix})`,
          artist: song.artist,
          album: song.album,
          genre: category,
          cover: `https://via.placeholder.com/300?text=${encodeURIComponent(song.title)}`,
          filePath: `uploads/samples/${song.title.replace(/[^a-z0-9]/gi, '_')}_${suffix.replace(/\s+/g, '_')}.mp3`,
          duration: 180 + Math.floor(Math.random() * 120),
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  
  return variations.slice(0, count);
}

async function main() {
  console.log('🎵 Generating Music Database...\n');
  
  console.log('📊 Generating variations...');
  const indianTracks = generateVariations(INDIAN_SONGS, CONFIG.TARGET_COUNTS.indian, 'indian');
  const pakistaniTracks = generateVariations(PAKISTANI_SONGS, CONFIG.TARGET_COUNTS.pakistani, 'pakistani');
  const hollywoodTracks = generateVariations(HOLLYWOOD_SONGS, CONFIG.TARGET_COUNTS.hollywood, 'hollywood');
  
  console.log(`✅ Generated ${indianTracks.length} Indian tracks`);
  console.log(`✅ Generated ${pakistaniTracks.length} Pakistani tracks`);
  console.log(`✅ Generated ${hollywoodTracks.length} Hollywood tracks`);
  
  // Load existing database
  let db = { tracks: [], recentPlays: [], userProfiles: {}, listeningHistory: [] };
  if (fs.existsSync(CONFIG.DB_PATH)) {
    const dbContent = fs.readFileSync(CONFIG.DB_PATH, 'utf8');
    db = JSON.parse(dbContent);
  }
  
  // Add all tracks
  db.tracks = [...indianTracks, ...pakistaniTracks, ...hollywoodTracks];
  
  // Save database
  fs.writeFileSync(CONFIG.DB_PATH, JSON.stringify(db, null, 2));
  
  console.log('\n✅ Database updated!');
  console.log(`📊 Total tracks: ${db.tracks.length}`);
  console.log('\n⚠️  NOTE: These are metadata entries only.');
  console.log('   For actual playback, you need to:');
  console.log('   1. Use streaming APIs (Spotify, YouTube Music)');
  console.log('   2. Or manually add MP3 files to uploads/samples/\n');
}

main().catch(console.error);

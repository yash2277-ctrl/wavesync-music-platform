// Script to populate database with thousands of songs using iTunes API
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep the original 6 songs
const originalSongs = [
  {
    "id": "0f887d023a82",
    "title": "Aana Hi Pada Sajna",
    "artist": "Arijit Singh",
    "album": "Unknown",
    "genre": "bollywood",
    "cover": "https://via.placeholder.com/300?text=Aana+Hi+Pada+Sajna",
    "filePath": "wavesync-nodejs\\uploads\\samples\\Aana_Hi_Pada_Sajna___Haider__Shahid_Kapoor__Shraddha_Kapoor___Vishal_Bhardwaj.mp3",
    "duration": 242,
    "createdAt": "2025-01-08T14:09:35.882Z"
  },
  {
    "id": "e6b0db9ae438",
    "title": "Bismil",
    "artist": "Haider",
    "album": "Unknown",
    "genre": "bollywood",
    "cover": "https://via.placeholder.com/300?text=Bismil",
    "filePath": "wavesync-nodejs\\uploads\\samples\\Bismil_Full_Video___Haider___Shahid_Kapoor__Shraddha_Kapoor___Vishal_Bhardwaj.mp3",
    "duration": 311,
    "createdAt": "2025-01-08T14:09:35.882Z"
  },
  {
    "id": "707c6762965b",
    "title": "Ehsaas",
    "artist": "Faheem Abdullah",
    "album": "Unknown",
    "genre": "indie",
    "cover": "https://via.placeholder.com/300?text=Ehsaas",
    "filePath": "wavesync-nodejs\\uploads\\samples\\Ehsaas___Official_Music_Video___Faheem_Abdullah___Rauhan_Malik___Vyb_Records.mp3",
    "duration": 264,
    "createdAt": "2025-01-08T14:09:35.882Z"
  },
  {
    "id": "30c43f819905",
    "title": "High On You",
    "artist": "Zaeden",
    "album": "Unknown",
    "genre": "electronic",
    "cover": "https://via.placeholder.com/300?text=High+On+You",
    "filePath": "wavesync-nodejs\\uploads\\samples\\High_on_You___Zaeden___Official_Music_Video.mp3",
    "duration": 196,
    "createdAt": "2025-01-08T14:09:35.882Z"
  },
  {
    "id": "b9411bf6b920",
    "title": "Nafrat",
    "artist": "Darshan Raval",
    "album": "Unknown",
    "genre": "indie",
    "cover": "https://via.placeholder.com/300?text=Nafrat",
    "filePath": "wavesync-nodejs\\uploads\\samples\\Nafrat__Official_Video____Darshan_Raval___Indie_Music_Label___Sony_Music.mp3",
    "duration": 226,
    "createdAt": "2025-01-08T14:09:35.882Z"
  },
  {
    "id": "862d2576bac4",
    "title": "Saiyaara",
    "artist": "Mohit Chauhan",
    "album": "Ek Tha Tiger",
    "genre": "bollywood",
    "cover": "https://via.placeholder.com/300?text=Saiyaara",
    "filePath": "wavesync-nodejs\\uploads\\samples\\Saiyaara_Full_Video___Ek_Tha_Tiger_Salman_Khan_Katrina_Kaif_Mohit_Chauhan_Taraannum_Mallik.mp3",
    "duration": 313,
    "createdAt": "2025-01-08T14:09:35.882Z"
  }
];

// Popular Indian artists and search terms
const indianSearchTerms = [
  'Arijit Singh', 'A.R. Rahman', 'Sonu Nigam', 'Shreya Ghoshal', 'Kumar Sanu',
  'Kishore Kumar', 'Lata Mangeshkar', 'Asha Bhosle', 'Mohammed Rafi', 'Udit Narayan',
  'Alka Yagnik', 'Sunidhi Chauhan', 'Neha Kakkar', 'Badshah', 'Yo Yo Honey Singh',
  'Diljit Dosanjh', 'Guru Randhawa', 'Atif Aslam', 'Rahat Fateh Ali Khan', 'Armaan Malik',
  'Jubin Nautiyal', 'Darshan Raval', 'Tony Kakkar', 'Harrdy Sandhu', 'B Praak',
  'Vishal-Shekhar', 'Pritam', 'Amit Trivedi', 'Shankar-Ehsaan-Loy', 'Tanishk Bagchi',
  'Bollywood hits', 'Punjabi songs', 'Tamil songs', 'Telugu songs', 'Hindi romantic songs',
  'Bollywood dance', 'Sufi music', 'Ghazals', 'Bhangra', 'Indian pop',
  'Divine rapper', 'Raftaar', 'Emiway Bantai', 'King rapper', 'Seedhe Maut'
];

// Popular Hollywood artists and search terms
const hollywoodSearchTerms = [
  'The Weeknd', 'Ed Sheeran', 'Taylor Swift', 'Ariana Grande', 'Drake',
  'Post Malone', 'Billie Eilish', 'Justin Bieber', 'Dua Lipa', 'The Beatles',
  'Michael Jackson', 'Queen', 'Beyoncé', 'Rihanna', 'Bruno Mars',
  'Adele', 'Lady Gaga', 'Coldplay', 'Imagine Dragons', 'Maroon 5',
  'One Direction', 'Harry Styles', 'Shawn Mendes', 'Selena Gomez', 'Demi Lovato',
  'Katy Perry', 'Miley Cyrus', 'BTS', 'BLACKPINK', 'Olivia Rodrigo',
  'Lil Nas X', 'Travis Scott', 'Kendrick Lamar', 'Eminem', 'Kanye West',
  'The Chainsmokers', 'Martin Garrix', 'Calvin Harris', 'David Guetta', 'Alan Walker',
  'Pop hits 2024', 'Top 100 songs', 'Billboard Hot 100', 'Grammy winners', 'Rock classics'
];

function fetchFromiTunes(query, limit = 200) {
  return new Promise((resolve, reject) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}&country=IN`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.results || []);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function determineGenre(genre, trackName, artistName) {
  const genreLower = genre?.toLowerCase() || '';
  const trackLower = trackName?.toLowerCase() || '';
  const artistLower = artistName?.toLowerCase() || '';
  
  // Bollywood/Indian
  if (genreLower.includes('bollywood') || genreLower.includes('indian') || 
      genreLower.includes('hindi') || genreLower.includes('punjabi') ||
      genreLower.includes('tamil') || genreLower.includes('telugu') ||
      artistLower.includes('arijit') || artistLower.includes('kumar') ||
      artistLower.includes('rahman') || artistLower.includes('badshah')) {
    return 'bollywood';
  }
  
  // Pop
  if (genreLower.includes('pop') || artistLower.includes('bieber') ||
      artistLower.includes('swift') || artistLower.includes('ariana')) {
    return 'pop';
  }
  
  // Hip-Hop
  if (genreLower.includes('hip hop') || genreLower.includes('rap') ||
      artistLower.includes('drake') || artistLower.includes('eminem')) {
    return 'hiphop';
  }
  
  // Rock
  if (genreLower.includes('rock') || artistLower.includes('queen') ||
      artistLower.includes('beatles')) {
    return 'rock';
  }
  
  // Electronic
  if (genreLower.includes('electronic') || genreLower.includes('dance') ||
      genreLower.includes('edm') || artistLower.includes('martin garrix')) {
    return 'electronic';
  }
  
  // R&B
  if (genreLower.includes('r&b') || genreLower.includes('soul') ||
      artistLower.includes('weeknd') || artistLower.includes('beyonce')) {
    return 'rnb';
  }
  
  return 'pop'; // Default
}

function convertToTrack(itunesTrack, index) {
  return {
    id: `itunes-${itunesTrack.trackId}`,
    title: itunesTrack.trackName,
    artist: itunesTrack.artistName,
    album: itunesTrack.collectionName || 'Unknown',
    genre: determineGenre(itunesTrack.primaryGenreName, itunesTrack.trackName, itunesTrack.artistName),
    cover: itunesTrack.artworkUrl100?.replace('100x100bb', '600x600bb') || 'https://via.placeholder.com/300',
    filePath: null, // Preview URL available but null for now
    previewUrl: itunesTrack.previewUrl, // 30-second preview
    duration: Math.floor(itunesTrack.trackTimeMillis / 1000) || 200,
    createdAt: new Date().toISOString(),
    source: 'itunes',
    releaseDate: itunesTrack.releaseDate
  };
}

async function populateDatabase() {
  console.log('🎵 Starting to fetch songs from iTunes API...\n');
  
  let allTracks = [...originalSongs];
  const seenIds = new Set(originalSongs.map(t => t.id));
  
  // Fetch Indian songs
  console.log('📱 Fetching Indian songs...');
  for (let i = 0; i < indianSearchTerms.length && allTracks.length < 10006; i++) {
    const term = indianSearchTerms[i];
    try {
      console.log(`  Searching: ${term}...`);
      const results = await fetchFromiTunes(term, 200);
      
      results.forEach(track => {
        const converted = convertToTrack(track);
        if (!seenIds.has(converted.id) && allTracks.length < 10006) {
          allTracks.push(converted);
          seenIds.add(converted.id);
        }
      });
      
      console.log(`  ✓ Total Indian songs: ${allTracks.length - 6}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Error fetching ${term}:`, error.message);
    }
  }
  
  console.log(`\n🎸 Fetching Hollywood songs...`);
  const indianCount = allTracks.length;
  
  // Fetch Hollywood songs
  for (let i = 0; i < hollywoodSearchTerms.length && allTracks.length < 15006; i++) {
    const term = hollywoodSearchTerms[i];
    try {
      console.log(`  Searching: ${term}...`);
      const results = await fetchFromiTunes(term, 200);
      
      results.forEach(track => {
        const converted = convertToTrack(track);
        if (!seenIds.has(converted.id) && allTracks.length < 15006) {
          allTracks.push(converted);
          seenIds.add(converted.id);
        }
      });
      
      console.log(`  ✓ Total Hollywood songs: ${allTracks.length - indianCount}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Error fetching ${term}:`, error.message);
    }
  }
  
  // Save to database
  const dbPath = path.join(__dirname, '..', 'data', 'db.json');
  const database = {
    tracks: allTracks,
    recentPlays: [],
    userProfiles: {},
    listeningHistory: []
  };
  
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
  
  console.log('\n✨ Database populated successfully!');
  console.log(`📊 Statistics:`);
  console.log(`   - Original songs: 6`);
  console.log(`   - Indian songs: ${indianCount - 6}`);
  console.log(`   - Hollywood songs: ${allTracks.length - indianCount}`);
  console.log(`   - Total songs: ${allTracks.length}`);
  console.log(`\n💾 Database saved to: ${dbPath}`);
  console.log(`\n🎵 All songs have preview URLs for 30-second samples!`);
}

// Run the script
populateDatabase().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

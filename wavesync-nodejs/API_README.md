# WaveSync Public API Documentation

A RESTful API for browsing, searching, and streaming music from the WaveSync music streaming platform.

## Base URL

```
http://localhost:3000
```

## Interactive Documentation

Visit the interactive API documentation page:
```
http://localhost:3000/api-docs.html
```

## Endpoints

### 1. Browse All Songs

Get a paginated list of all available songs with optional genre filtering.

**Endpoint:** `GET /api/public/browse`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Results per page (default: 20)
- `genre` (optional) - Filter by genre (e.g., ocean, romantic, chill)

**Example Request:**
```bash
curl "http://localhost:3000/api/public/browse?page=1&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "24485f634987",
      "title": "Coastal-Breeze",
      "artist": "Unknown",
      "album": "Samples",
      "genre": "ocean",
      "streamUrl": "http://localhost:3000/api/stream/24485f634987",
      "playUrl": "http://localhost:3000/api/public/play/24485f634987"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2. Search Songs

Search for songs by title, artist, album, or genre.

**Endpoint:** `GET /api/public/search`

**Query Parameters:**
- `q` (required) - Search query string

**Example Request:**
```bash
curl "http://localhost:3000/api/public/search?q=ocean"
```

**Example Response:**
```json
{
  "success": true,
  "query": "ocean",
  "results": [
    {
      "id": "c395313f1525",
      "title": "Ocean-Dreams",
      "artist": "Unknown",
      "album": "Samples",
      "genre": "ocean",
      "streamUrl": "http://localhost:3000/api/stream/c395313f1525",
      "playUrl": "http://localhost:3000/api/public/play/c395313f1525"
    }
  ],
  "count": 1
}
```

### 3. Get Track Details

Get detailed information about a specific track.

**Endpoint:** `GET /api/public/track/:id`

**Path Parameters:**
- `id` (required) - Track ID

**Example Request:**
```bash
curl "http://localhost:3000/api/public/track/c395313f1525"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "c395313f1525",
    "title": "Ocean-Dreams",
    "artist": "Unknown",
    "album": "Samples",
    "genre": "ocean",
    "streamUrl": "http://localhost:3000/api/stream/c395313f1525",
    "playUrl": "http://localhost:3000/api/public/play/c395313f1525",
    "createdAt": 1764541875763
  }
}
```

### 4. Play/Stream Song

Stream the audio file for a specific track. Supports HTTP range requests for seeking.

**Endpoint:** `GET /api/public/play/:id`

**Path Parameters:**
- `id` (required) - Track ID

**Returns:** Audio stream (audio/mpeg)

**Example Request:**
```bash
curl "http://localhost:3000/api/public/play/c395313f1525" --output song.mp3
```

**HTML5 Audio Player Example:**
```html
<audio controls>
  <source src="http://localhost:3000/api/public/play/c395313f1525" type="audio/mpeg">
</audio>
```

**JavaScript Example:**
```javascript
const audio = new Audio('http://localhost:3000/api/public/play/c395313f1525');
audio.play();
```

### 5. Get Available Genres

Get a list of all available genres in the music library.

**Endpoint:** `GET /api/public/genres`

**Example Request:**
```bash
curl "http://localhost:3000/api/public/genres"
```

**Example Response:**
```json
{
  "success": true,
  "genres": ["chill", "general", "ocean", "romantic"]
}
```

### 6. Get Recently Played

Get a list of recently played tracks.

**Endpoint:** `GET /api/public/recent`

**Query Parameters:**
- `limit` (optional) - Number of tracks to return (default: 10)

**Example Request:**
```bash
curl "http://localhost:3000/api/public/recent?limit=5"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "c395313f1525",
      "title": "Ocean-Dreams",
      "artist": "Unknown",
      "album": "Samples",
      "genre": "ocean",
      "streamUrl": "http://localhost:3000/api/stream/c395313f1525",
      "playUrl": "http://localhost:3000/api/public/play/c395313f1525"
    }
  ]
}
```

## Available Genres

- `ocean` - Ocean, wave, sea, beach themed music
- `romantic` - Love and romantic songs
- `chill` - Calm and relaxing music
- `party` - Dance and party music
- `nature` - Nature and outdoor themed music
- `summer` - Summer vibes
- `night` - Night and evening music
- `workout` - Fitness and workout music
- `focus` - Study and concentration music
- `jazz` - Jazz and blues
- `rock` - Rock music
- `classical` - Classical music
- `hiphop` - Hip-hop and rap
- `acoustic` - Acoustic music
- `general` - General music

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `404` - Track not found
- `500` - Internal server error

## Usage Examples

### Browse by Genre
```bash
curl "http://localhost:3000/api/public/browse?genre=ocean&limit=5"
```

### Search and Play
```bash
# 1. Search for a song
curl "http://localhost:3000/api/public/search?q=ocean"

# 2. Use the track ID to play
curl "http://localhost:3000/api/public/play/c395313f1525" --output ocean-dreams.mp3
```

### Integration Example (JavaScript)
```javascript
// Fetch and display all songs
async function loadSongs() {
  const response = await fetch('http://localhost:3000/api/public/browse?limit=20');
  const data = await response.json();
  
  data.data.forEach(track => {
    console.log(`${track.title} by ${track.artist}`);
    // Play URL: track.playUrl
  });
}

// Search for songs
async function searchSongs(query) {
  const response = await fetch(`http://localhost:3000/api/public/search?q=${query}`);
  const data = await response.json();
  return data.results;
}

// Play a song
function playSong(trackId) {
  const audio = new Audio(`http://localhost:3000/api/public/play/${trackId}`);
  audio.play();
}
```

## CORS

The API has CORS enabled, allowing requests from any origin. This makes it easy to integrate with web applications.

## Rate Limiting

Currently, there is no rate limiting implemented. Use responsibly.

## Support

For issues or questions, please refer to the main project documentation.

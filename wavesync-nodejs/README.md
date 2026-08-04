# WaveSync - Music Streaming Application

Full-stack music streaming application with Node.js backend and React frontend. All-in-one folder structure with backend and frontend together.

## Endpoints
- `GET /api/tracks` — list all tracks
- `GET /api/library` — alias for all tracks
- `GET /api/search?q=term` — search by title/artist/album
- `GET /api/tracks/recent` — recently played (last 50)
- `POST /api/tracks/:id/play` — record a play
- `GET /api/stream/:id` — stream MP3 with HTTP range support

## File locations
- Audio: `uploads/samples` under the workspace root
- Data: `music-stream-node/data/db.json` auto-created

## Run
```powershell
cd "c:\Users\sahu4\OneDrive\Pictures\Screenshots\zeus\music-stream-node"
npm install
npm run dev
```
Server starts on `http://localhost:8080`.

## Notes
- On first run, the library scans `uploads/samples` and indexes any `.mp3` files.
- The server also serves the existing static frontend from `music-stream/src/main/resources/static` if present.

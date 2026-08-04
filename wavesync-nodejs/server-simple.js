import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Node server!');
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}`);
});

// Keep alive
setInterval(() => {
  console.log('Server still running...');
}, 30000);

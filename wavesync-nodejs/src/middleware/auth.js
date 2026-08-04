import jwt from 'jsonwebtoken';
import { readDb } from '../services/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'wavesync-dev-secret-change-in-prod';

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Middleware: require valid JWT. Attaches req.user */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    const db = readDb();
    const user = db.users.find(u => u.id === payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, email: user.email, username: user.username, role: user.role || 'user' };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Middleware: optional auth — attaches req.user if token present, continues either way */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    const db = readDb();
    const user = db.users.find(u => u.id === payload.userId);
    if (user) req.user = { id: user.id, email: user.email, username: user.username, role: user.role || 'user' };
  } catch { /* ignore */ }
  next();
}

/** Middleware: require ownership of a resource */
export function requireOwner(getOwnerId) {
  return (req, res, next) => {
    const ownerId = getOwnerId(req);
    if (!ownerId) return res.status(404).json({ error: 'Resource not found' });
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

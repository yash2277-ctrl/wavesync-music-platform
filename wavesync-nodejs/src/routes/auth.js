/**
 * Auth routes — signup, login, logout, me, refresh
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { readDb, updateDb } from '../services/db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').trim().isLength({ min: 2, max: 32 }).withMessage('Username must be 2–32 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    const db = readDb();

    if (db.users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = {
      id:        uuid(),
      email,
      username,
      password:  hashed,
      role:      'user',
      bio:       '',
      avatar:    null,
      createdAt: new Date().toISOString(),
    };

    updateDb(db => db.users.push(user));

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  })
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  })
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: { id: user.id, email: user.email, username: user.username, role: user.role, bio: user.bio, avatar: user.avatar, createdAt: user.createdAt },
  });
}));

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
router.patch('/profile',
  requireAuth,
  [
    body('username').optional().trim().isLength({ min: 2, max: 32 }),
    body('bio').optional().trim().isLength({ max: 300 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { username, bio } = req.body;
    let updated;
    updateDb(db => {
      const idx = db.users.findIndex(u => u.id === req.user.id);
      if (idx === -1) return;
      if (username) db.users[idx].username = username;
      if (bio !== undefined) db.users[idx].bio = bio;
      updated = db.users[idx];
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: updated.id, email: updated.email, username: updated.username, bio: updated.bio } });
  })
);

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post('/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    updateDb(db => {
      const u = db.users.find(u => u.id === req.user.id);
      if (u) u.password = hashed;
    });
    res.json({ message: 'Password updated successfully' });
  })
);

export default router;

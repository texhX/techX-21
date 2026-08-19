import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const users = db.getCollection('users');
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  // Remove password from response
  const { password: _, ...userProfile } = user;
  res.json({
    user: userProfile,
    session: {
      access_token: `token-${user.id}-${Date.now()}`,
      user: userProfile,
    },
  });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { email, password, full_name, college_id, phone, role } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  const users = db.getCollection('users');
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.toLowerCase(),
    password: password || 'password123',
    full_name,
    college_id: college_id || '',
    phone: phone || '',
    role: role === 'admin' ? 'admin' : 'student',
    avatar_url: null,
    created_at: new Date().toISOString(),
  };

  db.insert('users', newUser);

  const { password: _, ...userProfile } = newUser;
  res.status(201).json({
    user: userProfile,
    session: {
      access_token: `token-${newUser.id}-${Date.now()}`,
      user: userProfile,
    },
  });
});

// GET /api/auth/users (for admin listing)
router.get('/users', (req, res) => {
  const users = db.getCollection('users').map(({ password, ...rest }) => rest);
  res.json(users);
});

export default router;

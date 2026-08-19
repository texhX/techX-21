import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/notifications?user_id=...
router.get('/', (req, res) => {
  const { user_id } = req.query;
  const notifs = db.getCollection('notifications');
  if (user_id) {
    return res.json(notifs.filter((n) => n.user_id === user_id));
  }
  res.json(notifs);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res) => {
  const { id } = req.params;
  const updated = db.update('notifications', id, { is_read: true });
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json(updated);
});

// POST /api/notifications/read-all
router.post('/read-all', (req, res) => {
  const { user_id } = req.body;
  const notifs = db.getCollection('notifications');
  const updated = notifs.map((n) => {
    if (!user_id || n.user_id === user_id) {
      return { ...n, is_read: true };
    }
    return n;
  });
  db.setCollection('notifications', updated);
  res.json({ success: true });
});

export default router;

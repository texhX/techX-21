import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/matches
router.get('/', (req, res) => {
  const matches = db.getCollection('matches');
  const lostItems = db.getCollection('lost_items');
  const foundItems = db.getCollection('found_items');
  const users = db.getCollection('users');

  const populated = matches.map((match) => {
    const lostItem = lostItems.find((i) => i.id === match.lost_item_id);
    const foundItem = foundItems.find((i) => i.id === match.found_item_id);
    const lostUser = lostItem ? users.find((u) => u.id === lostItem.user_id) : null;
    const foundUser = foundItem ? users.find((u) => u.id === foundItem.user_id) : null;

    return {
      ...match,
      lost_item: lostItem
        ? { ...lostItem, profiles: lostUser ? { full_name: lostUser.full_name, email: lostUser.email } : null }
        : null,
      found_item: foundItem
        ? { ...foundItem, profiles: foundUser ? { full_name: foundUser.full_name, email: foundUser.email } : null }
        : null,
    };
  });

  res.json(populated);
});

// GET /api/matches/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const matches = db.getCollection('matches');
  const match = matches.find((m) => m.id === id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const lostItem = db.getCollection('lost_items').find((i) => i.id === match.lost_item_id);
  const foundItem = db.getCollection('found_items').find((i) => i.id === match.found_item_id);

  res.json({
    ...match,
    lost_item: lostItem || null,
    found_item: foundItem || null,
  });
});

export default router;

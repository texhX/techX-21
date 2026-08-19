import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { calculateMatchScore } from '../services/matchingEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer disk storage for local uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /api/items/upload-image
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({ url: publicUrl });
});

// GET /api/items/lost
router.get('/lost', (req, res) => {
  const items = db.getCollection('lost_items');
  const users = db.getCollection('users');

  const populated = items.map((item) => {
    const user = users.find((u) => u.id === item.user_id);
    return {
      ...item,
      profiles: user ? { full_name: user.full_name, email: user.email } : null,
    };
  });

  res.json(populated);
});

// POST /api/items/lost
router.post('/lost', (req, res) => {
  const { user_id, title, description, category, subcategory, color, location, lost_date, lost_time, image_url } = req.body;
  if (!title || !category || !location || !lost_date) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  const newLostItem = {
    id: `lost-${Date.now()}`,
    user_id: user_id || 'usr-student-1',
    title,
    description: description || '',
    category,
    subcategory: subcategory || '',
    color: color || 'Other',
    location,
    lost_date,
    lost_time: lost_time || '',
    image_url: image_url || null,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  db.insert('lost_items', newLostItem);

  // Run backend matching against all active found items
  const foundItems = db.getCollection('found_items');
  foundItems.forEach((foundItem) => {
    const matchMetrics = calculateMatchScore(newLostItem, foundItem);
    if (matchMetrics && matchMetrics.match_score >= 70) {
      const matchRecord = {
        id: `match-${newLostItem.id}-${foundItem.id}`,
        lost_item_id: newLostItem.id,
        found_item_id: foundItem.id,
        ...matchMetrics,
        status: 'suggested',
        created_at: new Date().toISOString(),
      };
      db.insert('matches', matchRecord);

      // Create notification for lost item owner
      if (newLostItem.user_id) {
        db.insert('notifications', {
          id: `notif-${Date.now()}`,
          user_id: newLostItem.user_id,
          title: `Possible Match Found (${matchMetrics.match_score}%)!`,
          message: `A "${foundItem.title}" found at ${foundItem.location} may match your lost item.`,
          type: 'match_found',
          reference_id: `/matches?id=${matchRecord.id}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  });

  res.status(201).json(newLostItem);
});

// GET /api/items/found
router.get('/found', (req, res) => {
  const items = db.getCollection('found_items');
  const users = db.getCollection('users');

  const populated = items.map((item) => {
    const user = users.find((u) => u.id === item.user_id);
    return {
      ...item,
      profiles: user ? { full_name: user.full_name, email: user.email } : null,
    };
  });

  res.json(populated);
});

// POST /api/items/found
router.post('/found', (req, res) => {
  const { user_id, title, description, category, subcategory, color, location, custody, found_date, found_time, image_url } = req.body;
  if (!title || !category || !location || !found_date) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  const newFoundItem = {
    id: `found-${Date.now()}`,
    user_id: user_id || 'usr-admin-1',
    title,
    description: description || '',
    category,
    subcategory: subcategory || '',
    color: color || 'Other',
    location,
    custody: custody || 'Security Main Desk',
    found_date,
    found_time: found_time || '',
    image_url: image_url || null,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  db.insert('found_items', newFoundItem);

  // Run backend matching against all active lost items
  const lostItems = db.getCollection('lost_items');
  lostItems.forEach((lostItem) => {
    const matchMetrics = calculateMatchScore(lostItem, newFoundItem);
    if (matchMetrics && matchMetrics.match_score >= 70) {
      const matchRecord = {
        id: `match-${lostItem.id}-${newFoundItem.id}`,
        lost_item_id: lostItem.id,
        found_item_id: newFoundItem.id,
        ...matchMetrics,
        status: 'suggested',
        created_at: new Date().toISOString(),
      };
      db.insert('matches', matchRecord);

      // Create notification for lost item owner
      if (lostItem.user_id) {
        db.insert('notifications', {
          id: `notif-${Date.now()}`,
          user_id: lostItem.user_id,
          title: `High-Confidence Match (${matchMetrics.match_score}%) Found!`,
          message: `A "${newFoundItem.title}" found at ${newFoundItem.location} matches your lost report.`,
          type: 'match_found',
          reference_id: `/matches?id=${matchRecord.id}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  });

  res.status(201).json(newFoundItem);
});

// PATCH /api/items/:type/:id/status
router.patch('/:type/:id/status', (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;
  const collection = type === 'lost' ? 'lost_items' : 'found_items';
  const updated = db.update(collection, id, { status });
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

// DELETE /api/items/:type/:id
router.delete('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const collection = type === 'lost' ? 'lost_items' : 'found_items';
  const deleted = db.delete(collection, id);
  if (!deleted) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, message: 'Item deleted' });
});

export default router;

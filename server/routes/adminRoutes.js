import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const users = db.getCollection('users');
  const lost = db.getCollection('lost_items');
  const found = db.getCollection('found_items');
  const matches = db.getCollection('matches');
  const claims = db.getCollection('claims');

  const pendingClaims = claims.filter((c) => c.status === 'pending').length;
  const returnedItems = found.filter((f) => f.status === 'returned').length + 
                        claims.filter((c) => c.status === 'approved').length;

  res.json({
    total_users: users.length,
    lost_reports: lost.length,
    found_reports: found.length,
    active_matches: matches.length,
    pending_claims: pendingClaims,
    returned_items: Math.max(1, returnedItems),
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req, res) => {
  const logs = db.getCollection('admin_actions');
  res.json(logs);
});

export default router;

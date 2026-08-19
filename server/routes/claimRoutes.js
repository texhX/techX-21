import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/claims
router.get('/', (req, res) => {
  const claims = db.getCollection('claims');
  const foundItems = db.getCollection('found_items');
  const users = db.getCollection('users');

  const populated = claims.map((claim) => {
    const item = foundItems.find((i) => i.id === claim.found_item_id) || null;
    const claimant = users.find((u) => u.id === claim.claimant_id) || null;

    return {
      ...claim,
      item: item || {
        title: 'Reported Property',
        location: 'Campus Security',
        category: 'Property',
        image_url: null,
      },
      item_title: item ? item.title : 'Reported Property',
      location: item ? item.location : 'Campus Security',
      category: item ? item.category : 'Property',
      image_url: item ? item.image_url : null,
      claimant: claimant
        ? { full_name: claimant.full_name, email: claimant.email, college_id: claimant.college_id, phone: claimant.phone }
        : null,
    };
  });

  res.json(populated);
});

// POST /api/claims
router.post('/', (req, res) => {
  const { match_id, found_item_id, claimant_id, proof_message, proof_image_url } = req.body;
  if (!proof_message) {
    return res.status(400).json({ error: 'Proof message is required' });
  }

  const newClaim = {
    id: `claim-${Date.now()}`,
    match_id: match_id || null,
    found_item_id: found_item_id || 'found-item-1',
    claimant_id: claimant_id || 'usr-student-1',
    proof_message,
    proof_image_url: proof_image_url || null,
    status: 'pending',
    admin_note: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
  };

  db.insert('claims', newClaim);

  // Notify claimant
  db.insert('notifications', {
    id: `notif-${Date.now()}`,
    user_id: newClaim.claimant_id,
    title: 'Claim Submitted Successfully',
    message: 'Your ownership verification request is under review by Campus Security.',
    type: 'claim_submitted',
    reference_id: '/claims',
    is_read: false,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(newClaim);
});

// PATCH /api/claims/:id/review (Adjudicate Claim)
router.patch('/:id/review', (req, res) => {
  const { id } = req.params;
  const { status, admin_note, admin_id, admin_name } = req.body; // status: 'approved' | 'rejected'

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
  }

  const claim = db.getCollection('claims').find((c) => c.id === id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const updatedClaim = db.update('claims', id, {
    status,
    admin_note: admin_note || (status === 'approved' ? 'Ownership verified.' : 'Proof insufficient.'),
    reviewed_by: admin_id || 'usr-admin-1',
    reviewed_at: new Date().toISOString(),
  });

  // If approved, update target item status to returned
  if (status === 'approved' && claim.found_item_id) {
    db.update('found_items', claim.found_item_id, { status: 'returned' });
  }

  // Insert Audit Log
  db.insert('admin_actions', {
    id: `log-${Date.now()}`,
    admin_id: admin_id || 'usr-admin-1',
    admin_name: admin_name || 'Dr. Sarah Mitchell',
    action: status === 'approved' ? 'APPROVE_CLAIM' : 'REJECT_CLAIM',
    target_type: 'claim',
    target_id: id,
    description: `${status === 'approved' ? 'Approved' : 'Rejected'} claim #${id}. Admin Note: "${admin_note || 'None'}"`,
    timestamp: new Date().toISOString(),
  });

  // Dispatch Notification to Claimant
  db.insert('notifications', {
    id: `notif-${Date.now()}`,
    user_id: claim.claimant_id,
    title: status === 'approved' ? 'Claim Verification Approved! 🎉' : 'Claim Verification Update',
    message: status === 'approved'
      ? 'Your ownership claim was verified by Campus Security! Please collect your item from the Security Main Desk.'
      : `Your claim could not be approved: ${admin_note || 'Insufficient identifying proof.'}`,
    type: status === 'approved' ? 'claim_approved' : 'claim_rejected',
    reference_id: '/claims',
    is_read: false,
    created_at: new Date().toISOString(),
  });

  res.json(updatedClaim);
});

export default router;

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { clientStorage } from './clientStorage';

export const claimService = {
  // Submit a claim
  async submitClaim({ matchId, foundItemId, claimantId, proofMessage, proofImageUrl }) {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          found_item_id: foundItemId,
          claimant_id: claimantId,
          proof_message: proofMessage,
          proof_image_url: proofImageUrl,
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('claims')
          .insert([
            {
              match_id: matchId,
              claimant_id: claimantId,
              proof_message: proofMessage,
              proof_image_url: proofImageUrl,
              status: 'pending',
            },
          ])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }

    return clientStorage.addClaim({
      match_id: matchId,
      found_item_id: foundItemId,
      claimant_id: claimantId,
      proof_message: proofMessage,
      proof_image_url: proofImageUrl,
      item_title: 'Found Belonging',
      location: 'Central Campus Library',
      category: 'Wallets & Bags',
    });
  },

  // Get user's claims
  async getUserClaims(userId) {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        let claims = await res.json();
        if (userId) claims = claims.filter((c) => c.claimant_id === userId);
        if (claims.length > 0) return claims;
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            match:match_id (
              *,
              lost_item:lost_item_id (*),
              found_item:found_item_id (*)
            )
          `)
          .eq('claimant_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // Fallback
      }
    }

    return clientStorage.getClaims();
  },

  // Admin: Get all claims
  async getAllClaims({ status = 'all' } = {}) {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        let claims = await res.json();
        if (status && status !== 'all') claims = claims.filter((c) => c.status === status);
        if (claims.length > 0) return claims;
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('claims')
          .select(`
            *,
            claimant:claimant_id (full_name, email, college_id, phone),
            match:match_id (
              *,
              lost_item:lost_item_id (*, profiles:user_id(full_name, email)),
              found_item:found_item_id (*, profiles:user_id(full_name, email))
            )
          `)
          .order('created_at', { ascending: false });

        if (status && status !== 'all') query = query.eq('status', status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // Fallback
      }
    }

    let claims = clientStorage.getClaims();
    if (status && status !== 'all') claims = claims.filter((c) => c.status === status);
    return claims;
  },

  // Admin: Review a claim
  async reviewClaim(claimId, { status, adminNote, adminId, adminName }) {
    try {
      const res = await fetch(`/api/claims/${claimId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_note: adminNote,
          admin_id: adminId,
          admin_name: adminName,
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('claims')
          .update({
            status,
            admin_note: adminNote,
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', claimId)
          .select()
          .single();

        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }

    return clientStorage.reviewClaim(claimId, status, adminNote);
  },
};

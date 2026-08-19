import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const claimService = {
  // Submit a claim for a match or found item
  async submitClaim({ matchId, claimantId, proofMessage, proofImageUrl }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

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

    if (error) throw error;
    return data;
  },

  // Get user's claims
  async getUserClaims(userId) {
    if (!isSupabaseConfigured || !userId) return [];

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

    if (error) throw error;
    return data || [];
  },

  // Admin: Get all claims
  async getAllClaims({ status = 'all' } = {}) {
    if (!isSupabaseConfigured) return [];

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

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Admin: Review a claim (approve / reject)
  async reviewClaim(claimId, { status, adminNote, adminId }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

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

    if (error) throw error;
    return data;
  },
};

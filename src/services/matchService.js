import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const matchService = {
  // Fetch matches for a specific user (either as lost item owner or found item reporter)
  async getUserMatches(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        lost_item:lost_item_id (*, profiles:user_id(full_name, email)),
        found_item:found_item_id (*, profiles:user_id(full_name, email))
      `)
      .order('match_score', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Save or update a match record in DB
  async createOrUpdateMatch(matchData) {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('matches')
      .upsert(matchData, { onConflict: 'lost_item_id,found_item_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update match status (accepted, rejected, expired)
  async updateMatchStatus(matchId, status) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

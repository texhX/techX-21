import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const matchService = {
  // Fetch matches for a specific user
  async getUserMatches(userId) {
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured && userId) {
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
    }

    return [];
  },

  // Save or update match record
  async createOrUpdateMatch(matchData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('matches')
        .upsert(matchData, { onConflict: 'lost_item_id,found_item_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return matchData;
  },

  // Update match status
  async updateMatchStatus(matchId, status) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { id: matchId, status };
  },
};

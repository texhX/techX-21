import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const authService = {
  // Sign up a new user with profile metadata
  async signUp({ email, password, fullName, collegeId, phone, role = 'student' }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please check .env.local.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          college_id: collegeId,
          phone,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Log in with email and password
  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please check .env.local.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current active session
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Fetch current user's profile from database
  async getCurrentProfile(userId) {
    if (!isSupabaseConfigured || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  // Update current user's profile
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

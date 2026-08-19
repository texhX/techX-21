import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const itemService = {
  // Upload image to 'item-images' Supabase Storage bucket
  async uploadImage(file, folder = 'items') {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    if (!file) return null;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be less than 5MB.');
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Supported image formats: JPG, PNG, WEBP, GIF.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Create a lost item record
  async createLostItem(itemData) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('lost_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create a found item record
  async createFoundItem(itemData) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('found_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch lost items with optional filters
  async getLostItems({ status = 'active', category, location, query, limit = 50 } = {}) {
    if (!isSupabaseConfigured) return [];

    let queryBuilder = supabase
      .from('lost_items')
      .select('*, profiles:user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('category', category);
    }
    if (location && location !== 'all') {
      queryBuilder = queryBuilder.eq('location', location);
    }
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data || [];
  },

  // Fetch found items with optional filters
  async getFoundItems({ status = 'active', category, location, query, limit = 50 } = {}) {
    if (!isSupabaseConfigured) return [];

    let queryBuilder = supabase
      .from('found_items')
      .select('*, profiles:user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('category', category);
    }
    if (location && location !== 'all') {
      queryBuilder = queryBuilder.eq('location', location);
    }
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data || [];
  },

  // Get single item by type and ID
  async getItemById(type, id) {
    if (!isSupabaseConfigured) return null;
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const { data, error } = await supabase
      .from(table)
      .select('*, profiles:user_id(full_name, email, phone, college_id)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update item status
  async updateItemStatus(type, id, status) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const { data, error } = await supabase
      .from(table)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

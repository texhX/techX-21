import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const itemService = {
  // Upload image: uses Express Backend or Supabase Storage
  async uploadImage(file, folder = 'items') {
    if (!file) return null;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be less than 5MB.');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Supported image formats: JPG, PNG, WEBP, GIF.');
    }

    // Try Express Backend API first
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/items/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) return json.url;
      }
    } catch (e) {
      // Backend not running or failed, fallback to Supabase
    }

    if (isSupabaseConfigured) {
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
    }

    return URL.createObjectURL(file);
  },

  // Create lost item
  async createLostItem(itemData) {
    try {
      const res = await fetch('/api/items/lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('lost_items')
        .insert([itemData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    return { id: `lost-${Date.now()}`, ...itemData, status: 'active', created_at: new Date().toISOString() };
  },

  // Create found item
  async createFoundItem(itemData) {
    try {
      const res = await fetch('/api/items/found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('found_items')
        .insert([itemData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    return { id: `found-${Date.now()}`, ...itemData, status: 'active', created_at: new Date().toISOString() };
  },

  // Fetch lost items
  async getLostItems({ status = 'active', category, location, query } = {}) {
    try {
      const res = await fetch('/api/items/lost');
      if (res.ok) {
        let list = await res.json();
        if (status && status !== 'all') list = list.filter((i) => i.status === status);
        if (category && category !== 'all') list = list.filter((i) => i.category === category);
        if (location && location !== 'all') list = list.filter((i) => i.location === location);
        if (query) {
          const q = query.toLowerCase();
          list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
        }
        return list;
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      let queryBuilder = supabase
        .from('lost_items')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') queryBuilder = queryBuilder.eq('status', status);
      if (category && category !== 'all') queryBuilder = queryBuilder.eq('category', category);
      if (location && location !== 'all') queryBuilder = queryBuilder.eq('location', location);
      if (query) queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    }

    return [];
  },

  // Fetch found items
  async getFoundItems({ status = 'active', category, location, query } = {}) {
    try {
      const res = await fetch('/api/items/found');
      if (res.ok) {
        let list = await res.json();
        if (status && status !== 'all') list = list.filter((i) => i.status === status);
        if (category && category !== 'all') list = list.filter((i) => i.category === category);
        if (location && location !== 'all') list = list.filter((i) => i.location === location);
        if (query) {
          const q = query.toLowerCase();
          list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
        }
        return list;
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      let queryBuilder = supabase
        .from('found_items')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') queryBuilder = queryBuilder.eq('status', status);
      if (category && category !== 'all') queryBuilder = queryBuilder.eq('category', category);
      if (location && location !== 'all') queryBuilder = queryBuilder.eq('location', location);
      if (query) queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    }

    return [];
  },

  // Update item status
  async updateItemStatus(type, id, status) {
    try {
      const res = await fetch(`/api/items/${type}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      const table = type === 'lost' ? 'lost_items' : 'found_items';
      const { data, error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    return { id, status };
  },
};

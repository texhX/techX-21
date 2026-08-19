import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { clientStorage } from './clientStorage';

export const itemService = {
  // Upload image
  async uploadImage(file, folder = 'items') {
    if (!file) return null;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be less than 5MB.');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Supported image formats: JPG, PNG, WEBP, GIF.');
    }

    // Try Express Backend API
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
      // Backend not running
    }

    // Try Supabase Storage
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('item-images')
            .getPublicUrl(fileName);
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, using local reader:', err);
      }
    }

    // Fallback: Read as base64 data URL so image persists in browser database
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
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
      try {
        const { data, error } = await supabase
          .from('lost_items')
          .insert([itemData])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }

    // Persistent in browser database
    return clientStorage.addLostItem(itemData);
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
      try {
        const { data, error } = await supabase
          .from('found_items')
          .insert([itemData])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }

    // Persistent in browser database
    return clientStorage.addFoundItem(itemData);
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
        if (list.length > 0) return list;
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      try {
        let queryBuilder = supabase
          .from('lost_items')
          .select('*, profiles:user_id(full_name, email)')
          .order('created_at', { ascending: false });

        if (status && status !== 'all') queryBuilder = queryBuilder.eq('status', status);
        if (category && category !== 'all') queryBuilder = queryBuilder.eq('category', category);
        if (location && location !== 'all') queryBuilder = queryBuilder.eq('location', location);
        if (query) queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

        const { data, error } = await queryBuilder;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // Fallback
      }
    }

    // Fallback to client browser storage
    let list = clientStorage.getLostItems();
    if (status && status !== 'all') list = list.filter((i) => i.status === status);
    if (category && category !== 'all') list = list.filter((i) => i.category === category);
    if (location && location !== 'all') list = list.filter((i) => i.location === location);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    return list;
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
        if (list.length > 0) return list;
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      try {
        let queryBuilder = supabase
          .from('found_items')
          .select('*, profiles:user_id(full_name, email)')
          .order('created_at', { ascending: false });

        if (status && status !== 'all') queryBuilder = queryBuilder.eq('status', status);
        if (category && category !== 'all') queryBuilder = queryBuilder.eq('category', category);
        if (location && location !== 'all') queryBuilder = queryBuilder.eq('location', location);
        if (query) queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

        const { data, error } = await queryBuilder;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // Fallback
      }
    }

    // Fallback to client browser storage
    let list = clientStorage.getFoundItems();
    if (status && status !== 'all') list = list.filter((i) => i.status === status);
    if (category && category !== 'all') list = list.filter((i) => i.category === category);
    if (location && location !== 'all') list = list.filter((i) => i.location === location);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    return list;
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
      try {
        const table = type === 'lost' ? 'lost_items' : 'found_items';
        const { data, error } = await supabase
          .from(table)
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }

    return { id, status };
  },
};

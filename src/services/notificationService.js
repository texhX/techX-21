import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const notificationService = {
  // Get notifications for user
  async getUserNotifications(userId) {
    try {
      const url = userId ? `/api/notifications?user_id=${userId}` : '/api/notifications';
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    }

    return [];
  },

  // Mark a notification as read
  async markAsRead(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (e) {
      // Fallback
    }

    if (isSupabaseConfigured && userId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    }
  },
};

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const notificationService = {
  // Get notifications for user
  async getUserNotifications(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data || [];
  },

  // Mark a notification as read
  async markAsRead(notificationId) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all notifications for user as read
  async markAllAsRead(userId) {
    if (!isSupabaseConfigured || !userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Send / create a notification
  async createNotification({ userId, title, message, type, referenceId }) {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          reference_id: referenceId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

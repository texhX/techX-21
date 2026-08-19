import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'High-Confidence Match (94%) Found!',
    message: 'A Black Leather Wallet found at Central Campus Library matches your lost report.',
    type: 'match_found',
    reference_id: '/matches?id=demo-match-1',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Claim Verification Approved!',
    message: 'Your claim for Silver Dell XPS Charger was approved by Campus Security. Ready for collection.',
    type: 'claim_approved',
    reference_id: '/claims',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Claim Submitted Successfully',
    message: 'Your claim for Black Leather Wallet is currently under administrative review.',
    type: 'claim_submitted',
    reference_id: '/claims',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  }
];

export default function NotificationBell() {
  const { user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchNotifs() {
      if (!isSupabaseConfigured || !user) return;
      try {
        const data = await notificationService.getUserNotifications(user.id);
        if (data && data.length > 0) {
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }

    fetchNotifs();
  }, [isSupabaseConfigured, user]);

  // Handle outside click to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkAsRead(notifId, e) {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    if (isSupabaseConfigured) {
      await notificationService.markAsRead(notifId);
    }
  }

  async function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (isSupabaseConfigured && user) {
      await notificationService.markAllAsRead(user.id);
    }
  }

  function handleNotificationClick(notif) {
    handleMarkAsRead(notif.id);
    setIsOpen(false);
    if (notif.reference_id) {
      navigate(notif.reference_id);
    }
  }

  const filteredNotifs = filter === 'unread' 
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'match_found':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'claim_approved':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'claim_submitted':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'claim_rejected':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-glow animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl glass-card border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex items-start gap-3 transition cursor-pointer ${
                    notif.is_read
                      ? 'bg-transparent hover:bg-slate-900/40'
                      : 'bg-indigo-950/20 hover:bg-indigo-950/40 border-l-2 border-indigo-500'
                  }`}
                >
                  {getNotifIcon(notif.type)}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 pt-0.5">
                      <span>View details</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No notifications to display
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

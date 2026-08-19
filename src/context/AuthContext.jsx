import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  student: {
    id: 'usr-student-1',
    email: 'alex@campus.edu',
    user_metadata: {
      full_name: 'Alex Johnson',
      college_id: 'CS-2024-042',
      phone: '+1 (555) 019-2834',
      role: 'student',
    },
  },
  admin: {
    id: 'usr-admin-1',
    email: 'admin@campus.edu',
    user_metadata: {
      full_name: 'Dr. Sarah Mitchell (Campus Security Admin)',
      college_id: 'STAFF-ADMIN-01',
      phone: '+1 (555) 010-9900',
      role: 'admin',
    },
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          // Check active session from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user);
          }
        } else {
          // Check localStorage for saved demo session
          const savedDemoUser = localStorage.getItem('campusfind_demo_user');
          if (savedDemoUser && mounted) {
            const parsed = JSON.parse(savedDemoUser);
            setUser(parsed);
            setProfile({
              id: parsed.id,
              full_name: parsed.user_metadata.full_name,
              email: parsed.email,
              college_id: parsed.user_metadata.college_id,
              phone: parsed.user_metadata.phone,
              role: parsed.user_metadata.role || 'student',
            });
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes if configured
    let subscription = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Helper to fetch user profile from DB or construct from metadata
  async function fetchProfile(userId, authUser) {
    try {
      const dbProfile = await authService.getCurrentProfile(userId);
      if (dbProfile) {
        setProfile(dbProfile);
      } else if (authUser) {
        // Fallback to metadata
        setProfile({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || 'Campus Member',
          email: authUser.email,
          college_id: authUser.user_metadata?.college_id || '',
          phone: authUser.user_metadata?.phone || '',
          role: authUser.user_metadata?.role || 'student',
        });
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  }

  // Sign in with email and password
  async function signIn({ email, password }) {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { user: signedInUser } = await authService.signIn({ email, password });
        setUser(signedInUser);
        await fetchProfile(signedInUser.id, signedInUser);
        return signedInUser;
      } else {
        // Demo login mode
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'student';
        const demoUser = {
          id: `demo-${role}-${Date.now()}`,
          email,
          user_metadata: {
            full_name: role === 'admin' ? 'Security Admin' : 'Demo Student',
            college_id: role === 'admin' ? 'STAFF-ADMIN-01' : 'CS-2024-001',
            phone: '+1 (555) 019-2834',
            role,
          },
        };
        localStorage.setItem('campusfind_demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setProfile({
          id: demoUser.id,
          full_name: demoUser.user_metadata.full_name,
          email: demoUser.email,
          college_id: demoUser.user_metadata.college_id,
          phone: demoUser.user_metadata.phone,
          role,
        });
        return demoUser;
      }
    } finally {
      setLoading(false);
    }
  }

  // Quick Demo Login helper (for testing & hackathon demonstration)
  async function quickDemoLogin(role = 'student') {
    setLoading(true);
    try {
      const demoUser = DEMO_USERS[role] || DEMO_USERS.student;
      localStorage.setItem('campusfind_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setProfile({
        id: demoUser.id,
        full_name: demoUser.user_metadata.full_name,
        email: demoUser.email,
        college_id: demoUser.user_metadata.college_id,
        phone: demoUser.user_metadata.phone,
        role: demoUser.user_metadata.role,
      });
      return demoUser;
    } finally {
      setLoading(false);
    }
  }

  // Sign up
  async function signUp({ email, password, fullName, collegeId, phone, role = 'student' }) {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { user: newUser } = await authService.signUp({
          email,
          password,
          fullName,
          collegeId,
          phone,
          role,
        });
        if (newUser) {
          setUser(newUser);
          await fetchProfile(newUser.id, newUser);
        }
        return newUser;
      } else {
        const demoUser = {
          id: `user-${Date.now()}`,
          email,
          user_metadata: {
            full_name: fullName,
            college_id: collegeId,
            phone,
            role,
          },
        };
        localStorage.setItem('campusfind_demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setProfile({
          id: demoUser.id,
          full_name: fullName,
          email,
          college_id: collegeId,
          phone,
          role,
        });
        return demoUser;
      }
    } finally {
      setLoading(false);
    }
  }

  // Sign out
  async function signOut() {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await authService.signOut();
      }
      localStorage.removeItem('campusfind_demo_user');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  // Refresh current user profile
  async function refreshProfile() {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }

  const role = profile?.role || user?.user_metadata?.role || 'student';
  const isAdmin = role === 'admin';

  const value = {
    user,
    profile,
    role,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    quickDemoLogin,
    refreshProfile,
    isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

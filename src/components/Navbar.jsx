import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Search, 
  LogIn, 
  UserPlus, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  User, 
  ChevronDown,
  Layers,
  FileQuestion,
  Gift,
  GitCompare,
  FileCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                CampusFind<span className="text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">Smart Campus Lost & Found</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                Dashboard
              </Link>
            )}

            <Link
              to="/lost-items"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/lost-items'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Lost Items
            </Link>
            <Link
              to="/found-items"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/found-items'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Found Items
            </Link>
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/search'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Search className="w-4 h-4 text-indigo-400" />
              Search
            </Link>

            {user && (
              <>
                <Link
                  to="/matches"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/matches'
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <GitCompare className="w-4 h-4 text-pink-400" />
                  Matches
                </Link>
                <Link
                  to="/claims"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/claims'
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Claims
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ml-1 ${
                  location.pathname === '/admin'
                    ? 'text-purple-200 bg-purple-900/50 border border-purple-500/50'
                    : 'text-purple-300 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Action / User Profile Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide">
                      {isAdmin ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-purple-300 hover:text-purple-200 hover:bg-purple-950/40"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-800/80" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

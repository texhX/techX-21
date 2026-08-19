import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import Search from './pages/Search';
import Matches from './pages/Matches';
import Claims from './pages/Claims';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Placeholder views for subsequent phases
function PlaceholderPage({ title, phase }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
        Phase {phase} Module
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-slate-400 max-w-md text-sm">
        This view is authenticated and ready to be connected during Phase {phase} of development.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/lost-items" element={<LostItems />} />
            <Route path="/found-items" element={<FoundItems />} />
            <Route path="/search" element={<Search />} />

            {/* Protected Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute>
                  <ReportLost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-found"
              element={
                <ProtectedRoute>
                  <ReportFound />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims"
              element={
                <ProtectedRoute>
                  <Claims />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <PlaceholderPage title="Administrator Control Dashboard" phase="12 (Admin)" />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

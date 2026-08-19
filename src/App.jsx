import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Placeholder views for subsequent phases
function PlaceholderPage({ title, phase, badgeColor = 'indigo' }) {
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
            <Route path="/lost-items" element={<PlaceholderPage title="Lost Items Directory" phase="5 (Lost Items)" />} />
            <Route path="/found-items" element={<PlaceholderPage title="Found Items Directory" phase="6 (Found Items)" />} />
            <Route path="/search" element={<PlaceholderPage title="Search & Filter Items" phase="7 (Search)" />} />

            {/* Protected Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Student Dashboard" phase="4 (Dashboard)" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Report Lost Item" phase="5 (Lost Items)" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-found"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Report Found Item" phase="6 (Found Items)" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Match Suggestions" phase="8 (Matching Engine)" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Claim Tracking" phase="10 (Claims)" />
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

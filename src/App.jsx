import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';

// Placeholder views for subsequent phases
function PlaceholderPage({ title, phase }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
        Phase {phase} Module
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-slate-400 max-w-md text-sm">
        This view is structured and ready to be connected during Phase {phase} of development.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PlaceholderPage title="User Login" phase="3 (Authentication)" />} />
          <Route path="/signup" element={<PlaceholderPage title="Create Account" phase="3 (Authentication)" />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Student Dashboard" phase="4 (Dashboard)" />} />
          <Route path="/report-lost" element={<PlaceholderPage title="Report Lost Item" phase="5 (Lost Items)" />} />
          <Route path="/report-found" element={<PlaceholderPage title="Report Found Item" phase="6 (Found Items)" />} />
          <Route path="/lost-items" element={<PlaceholderPage title="Lost Items Directory" phase="5 (Lost Items)" />} />
          <Route path="/found-items" element={<PlaceholderPage title="Found Items Directory" phase="6 (Found Items)" />} />
          <Route path="/search" element={<PlaceholderPage title="Search & Filter Items" phase="7 (Search)" />} />
          <Route path="/matches" element={<PlaceholderPage title="Match Suggestions" phase="8 (Matching Engine)" />} />
          <Route path="/claims" element={<PlaceholderPage title="Claim Tracking" phase="10 (Claims)" />} />
          <Route path="/admin" element={<PlaceholderPage title="Administrator Dashboard" phase="12 (Admin)" />} />
        </Routes>
      </main>
    </div>
  );
}

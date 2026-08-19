import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { claimService } from '../services/claimService';
import { itemService } from '../services/itemService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  FileQuestion, 
  Gift, 
  Sparkles, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  History, 
  CheckCheck,
  ChevronRight,
  Eye,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';

const DEMO_ADMIN_DATA = {
  users: [
    { id: 'u-1', full_name: 'Alex Johnson', email: 'alex@campus.edu', college_id: 'CS-2024-042', role: 'student', created_at: '2026-08-10' },
    { id: 'u-2', full_name: 'Dr. Sarah Mitchell', email: 'admin@campus.edu', college_id: 'STAFF-ADMIN-01', role: 'admin', created_at: '2026-08-01' },
    { id: 'u-3', full_name: 'Emily Davis', email: 'emily@campus.edu', college_id: 'BIO-2023-119', role: 'student', created_at: '2026-08-12' },
    { id: 'u-4', full_name: 'Jessica Taylor (Staff)', email: 'jessica@campus.edu', college_id: 'LIB-STAFF-04', role: 'student', created_at: '2026-08-05' },
    { id: 'u-5', full_name: 'David Chen', email: 'david@campus.edu', college_id: 'ENG-2025-088', role: 'student', created_at: '2026-08-14' },
  ],
  lostItems: [
    { id: 'lost-1', title: 'Black Leather Bifold Wallet', category: 'Wallets & Bags', location: 'Central Campus Library', status: 'matched', user_name: 'Alex Johnson', date: '2026-08-18' },
    { id: 'lost-2', title: 'Apple AirPods Pro (2nd Gen)', category: 'Electronics & Gadgets', location: 'Science Block (Room 302)', status: 'active', user_name: 'Emily Davis', date: '2026-08-17' },
    { id: 'lost-3', title: 'Silver Dell XPS 15 Charger', category: 'Electronics & Gadgets', location: 'Engineering Wing', status: 'claimed', user_name: 'David Chen', date: '2026-08-16' },
  ],
  foundItems: [
    { id: 'found-1', title: 'Black Leather Wallet with Student ID', category: 'Wallets & Bags', location: 'Central Campus Library', status: 'matched', custody: 'Library Front Desk', finder: 'Jessica Taylor', date: '2026-08-19' },
    { id: 'found-2', title: 'Cobalt Blue Hydro Flask 32oz', category: 'Water Bottles & Flasks', location: 'Campus Sports Complex', status: 'active', custody: 'Security Main Desk', finder: 'Coach Miller', date: '2026-08-18' },
    { id: 'found-3', title: 'TI-84 Plus CE Graphing Calculator', category: 'Electronics & Gadgets', location: 'Science Block', status: 'active', custody: 'Department Office', finder: 'Prof. Raymond', date: '2026-08-17' },
  ],
  claims: [
    {
      id: 'claim-1',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      proof_message: 'The black leather wallet contains an active university student ID with name Alex Johnson and roll number CS-2024-042, along with a transit card.',
      proof_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
      claimant: { full_name: 'Alex Johnson', email: 'alex@campus.edu', college_id: 'CS-2024-042', phone: '+1 (555) 019-2834' },
      item: { id: 'found-1', title: 'Black Leather Wallet with Student ID', location: 'Central Campus Library', category: 'Wallets & Bags', image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60' }
    },
    {
      id: 'claim-2',
      status: 'approved',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000).toISOString(),
      proof_message: 'Silver Dell XPS 15 Charger has a small blue tape marked with room 302 on the power brick.',
      proof_image_url: null,
      admin_note: 'Verified ownership via serial marking. Handed off to student.',
      claimant: { full_name: 'David Chen', email: 'david@campus.edu', college_id: 'ENG-2025-088', phone: '+1 (555) 018-4491' },
      item: { id: 'found-target-x', title: 'Silver Dell XPS 15 Laptop Charger', location: 'Engineering Wing', category: 'Electronics & Gadgets', image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60' }
    }
  ],
  auditLogs: [
    { id: 'log-1', admin_name: 'Dr. Sarah Mitchell', action: 'APPROVE_CLAIM', target_type: 'claim', target_id: 'claim-2', description: 'Approved claim for Dell XPS Charger (Claimant: David Chen). Item marked as returned.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'log-2', admin_name: 'Dr. Sarah Mitchell', action: 'CREATE_RECORD', target_type: 'found_item', target_id: 'found-1', description: 'Logged found Black Leather Wallet turned in by library staff.', timestamp: new Date(Date.now() - 12000000).toISOString() }
  ]
};

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('claims');

  const [claims, setClaims] = useState(DEMO_ADMIN_DATA.claims);
  const [lostItems, setLostItems] = useState(DEMO_ADMIN_DATA.lostItems);
  const [foundItems, setFoundItems] = useState(DEMO_ADMIN_DATA.foundItems);
  const [users, setUsers] = useState(DEMO_ADMIN_DATA.users);
  const [auditLogs, setAuditLogs] = useState(DEMO_ADMIN_DATA.auditLogs);

  // Review Claim Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve' | 'reject'
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;
  const returnedCount = claims.filter((c) => c.status === 'approved').length;

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!selectedClaim) return;

    setProcessing(true);
    const newStatus = reviewAction === 'approve' ? 'approved' : 'rejected';
    const adminName = profile?.full_name || 'Campus Security Admin';

    // 1. Update claim in state
    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id
          ? {
              ...c,
              status: newStatus,
              admin_note: adminNote || (newStatus === 'approved' ? 'Ownership verified by admin.' : 'Proof insufficient.'),
              reviewed_at: new Date().toISOString(),
            }
          : c
      )
    );

    // 2. If approved, mark the corresponding lost & found item as returned/claimed
    if (newStatus === 'approved') {
      setFoundItems((prev) =>
        prev.map((item) =>
          item.id === selectedClaim.item?.id ? { ...item, status: 'returned' } : item
        )
      );
      setLostItems((prev) =>
        prev.map((item) =>
          item.title === selectedClaim.item?.title ? { ...item, status: 'returned' } : item
        )
      );
    }

    // 3. Append to Audit Logs
    const newLog = {
      id: `log-${Date.now()}`,
      admin_name: adminName,
      action: newStatus === 'approved' ? 'APPROVE_CLAIM' : 'REJECT_CLAIM',
      target_type: 'claim',
      target_id: selectedClaim.id,
      description: `${newStatus === 'approved' ? 'Approved' : 'Rejected'} claim for "${selectedClaim.item?.title}" by ${selectedClaim.claimant?.full_name}. Note: ${adminNote || 'None'}`,
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    setProcessing(false);
    setSelectedClaim(null);
    setAdminNote('');
  }

  function handleMarkItemReturned(type, itemId) {
    const adminName = profile?.full_name || 'Campus Security Admin';
    if (type === 'found') {
      setFoundItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: 'returned' } : i))
      );
    } else {
      setLostItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: 'returned' } : i))
      );
    }

    const newLog = {
      id: `log-${Date.now()}`,
      admin_name: adminName,
      action: 'MARK_RETURNED',
      target_type: type,
      target_id: itemId,
      description: `Manually updated ${type} report #${itemId} status to "returned".`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }

  function handleDeleteReport(type, itemId, itemTitle) {
    const adminName = profile?.full_name || 'Campus Security Admin';
    if (type === 'lost') {
      setLostItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setFoundItems((prev) => prev.filter((i) => i.id !== itemId));
    }

    const newLog = {
      id: `log-${Date.now()}`,
      admin_name: adminName,
      action: 'DELETE_SPAM_REPORT',
      target_type: type,
      target_id: itemId,
      description: `Moderated & removed suspicious report: "${itemTitle}".`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Admin Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-glow">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Campus Security Administration
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Moderator Console
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Centralized platform governance, verified ownership approvals, and compliance audit trail.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Claims Queue</span>
              <span className="text-lg font-black text-amber-400">{pendingClaimsCount} Awaiting Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Counter Cards (6 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{users.length}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Lost Reports</span>
            <FileQuestion className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">{lostItems.length}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Found Property</span>
            <Gift className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{foundItems.length}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Matches</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">2</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-amber-300 uppercase">Pending Claims</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{pendingClaimsCount}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase">Items Returned</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300">{returnedCount}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Claims Review ({pendingClaimsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lost')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'lost'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Lost Reports ({lostItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('found')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'found'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Found Turn-Ins ({foundItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Action Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CLAIMS REVIEW */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pending & Processed Claim Applications</h3>
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className={`glass-card p-6 rounded-3xl border transition ${
                  claim.status === 'pending'
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Item and Claimant Details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {claim.item?.image_url && (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <img
                          src={claim.item.image_url}
                          alt={claim.item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {claim.status === 'pending' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Verification
                          </span>
                        ) : claim.status === 'approved' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Rejected
                          </span>
                        )}

                        <span className="text-xs text-slate-500">
                          Submitted {new Date(claim.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">
                        {claim.item?.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          Claimant: <strong className="text-slate-200">{claim.claimant?.full_name}</strong> (Roll: {claim.claimant?.college_id})
                        </span>
                        <span>•</span>
                        <span>{claim.claimant?.email}</span>
                      </div>

                      {/* Proof Statement */}
                      <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                          Claimant Confidential Proof Statement:
                        </span>
                        <p className="italic">"{claim.proof_message}"</p>
                      </div>

                      {claim.admin_note && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                          <strong>Admin Note:</strong> {claim.admin_note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                    {claim.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setReviewAction('approve');
                          setAdminNote('Verified student identification card roll number in wallet.');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-600/25 transition cursor-pointer"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Review & Decide</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                        Decision Finalized
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LOST ITEMS MODERATION */}
      {activeTab === 'lost' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Lost Incident Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {lostItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-bold text-white">{item.title}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4">{item.location}</td>
                    <td className="p-4">{item.user_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                        item.status === 'returned' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {item.status !== 'returned' && (
                        <button
                          type="button"
                          onClick={() => handleMarkItemReturned('lost', item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 transition cursor-pointer font-medium"
                        >
                          Mark Returned
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteReport('lost', item.id, item.title)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/30 transition cursor-pointer font-medium"
                      >
                        Remove Spam
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FOUND ITEMS MODERATION */}
      {activeTab === 'found' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Found Property & Custody Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Custody Point</th>
                  <th className="p-4">Finder</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {foundItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-bold text-white">{item.title}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 text-indigo-300">{item.custody || 'Security Desk'}</td>
                    <td className="p-4">{item.finder}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                        item.status === 'returned' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {item.status !== 'returned' && (
                        <button
                          type="button"
                          onClick={() => handleMarkItemReturned('found', item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 transition cursor-pointer font-medium"
                        >
                          Mark Returned
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteReport('found', item.id, item.title)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/30 transition cursor-pointer font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Registered Campus Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Campus Email</th>
                  <th className="p-4">College / Staff ID</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-bold text-white">{u.full_name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 font-mono text-indigo-300">{u.college_id}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT ACTION LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Administrative Audit Trail</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every claim resolution, item disposition change, and moderation event is logged for security.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-slate-900/40 transition">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <History className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {log.admin_name} • <span className="text-indigo-400 uppercase">{log.action}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {log.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Claim Modal */}
      <Modal
        isOpen={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        title="Admin Claim Adjudication"
        maxWidth="max-w-2xl"
      >
        {selectedClaim && (
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            {/* Claimant and Item Summary */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{selectedClaim.item?.title}</span>
                <span className="text-xs text-indigo-400 font-semibold">{selectedClaim.item?.category}</span>
              </div>
              <p className="text-xs text-slate-400">
                Claimant: <strong className="text-slate-200">{selectedClaim.claimant?.full_name}</strong> (Roll: {selectedClaim.claimant?.college_id})
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">Submitted Proof:</span>
                <p className="italic">"{selectedClaim.proof_message}"</p>
              </div>
            </div>

            {/* Decision Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Adjudication Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('approve')}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Claim (Verified Owner)
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('reject')}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                    reviewAction === 'reject'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/25'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Reject Claim (Insufficient Proof)
                </button>
              </div>
            </div>

            {/* Admin Note Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Official Review Note / Reason *
              </label>
              <textarea
                required
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter note for the claimant and audit log..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-100 outline-none transition resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition disabled:opacity-50 cursor-pointer ${
                  reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processing ? (
                  <span>Saving Decision...</span>
                ) : (
                  <>
                    <span>Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

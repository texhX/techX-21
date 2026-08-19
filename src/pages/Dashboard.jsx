import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { matchService } from '../services/matchService';
import { claimService } from '../services/claimService';
import ItemCard from '../components/ItemCard';
import MatchCard from '../components/MatchCard';
import Loading from '../components/Loading';
import { 
  PlusCircle, 
  Search, 
  GitCompare, 
  FileCheck, 
  FileQuestion, 
  Gift, 
  Sparkles, 
  Bell, 
  AlertCircle,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

// Sample demonstration dataset for initial hackathon walkthrough
const DEMO_DASHBOARD_DATA = {
  lostItems: [
    {
      id: 'demo-lost-1',
      title: 'Black Leather Bifold Wallet',
      description: 'Contains university student card, driver license, and metro pass.',
      category: 'Wallets & Bags',
      color: 'Black',
      location: 'Central Campus Library (2nd Floor)',
      lost_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      status: 'matched',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'demo-lost-2',
      title: 'Apple AirPods Pro Gen 2',
      description: 'White charging case with small red silicone carabiner clip.',
      category: 'Electronics',
      color: 'White',
      location: 'Science Building - Room 302',
      lost_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      status: 'active',
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
    }
  ],
  foundItems: [
    {
      id: 'demo-found-1',
      title: 'Hydro Flask 32oz Water Bottle',
      description: 'Cobalt blue color with university stickers.',
      category: 'Personal Accessories',
      color: 'Blue',
      location: 'Student Recreation Center',
      found_date: new Date().toISOString().split('T')[0],
      status: 'active',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    }
  ],
  matches: [
    {
      id: 'demo-match-1',
      match_score: 94,
      match_reason: ['Identical Category', 'Nearby Library Location', 'Dates align (Yesterday/Today)', 'Matching Black Color', 'Textual description correlation'],
      status: 'suggested',
      lost_item: {
        id: 'demo-lost-1',
        title: 'Black Leather Bifold Wallet',
        location: 'Central Campus Library (2nd Floor)',
        category: 'Wallets & Bags',
      },
      found_item: {
        id: 'demo-found-target-1',
        title: 'Black Leather Wallet with Student ID',
        location: 'Library Information Desk',
        category: 'Wallets & Bags',
      }
    }
  ],
  claims: [
    {
      id: 'demo-claim-1',
      status: 'pending',
      created_at: new Date().toISOString(),
      proof_message: 'ID inside wallet has name Alex Johnson and roll number CS-2024-042.',
      match: {
        lost_item: { title: 'Black Leather Bifold Wallet' },
        found_item: { title: 'Black Leather Wallet with Student ID' }
      }
    }
  ]
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('lost');
  const [loading, setLoading] = useState(false);

  const [lostItems, setLostItems] = useState(DEMO_DASHBOARD_DATA.lostItems);
  const [foundItems, setFoundItems] = useState(DEMO_DASHBOARD_DATA.foundItems);
  const [matches, setMatches] = useState(DEMO_DASHBOARD_DATA.matches);
  const [claims, setClaims] = useState(DEMO_DASHBOARD_DATA.claims);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Campus Student';
  const collegeId = profile?.college_id || user?.user_metadata?.college_id || 'ID Pending';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome, {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student
                </span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-500" />
                  {collegeId}
                </span>
                <span>•</span>
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/report-lost"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition"
            >
              <FileQuestion className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition"
            >
              <Gift className="w-4 h-4" />
              Report Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Metric 1 */}
        <div 
          onClick={() => setActiveTab('lost')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === 'lost' ? 'border-indigo-500/60 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Lost Items</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{lostItems.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active reports</span>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setActiveTab('found')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === 'found' ? 'border-indigo-500/60 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Found Items</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{foundItems.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Items handed in</span>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setActiveTab('matches')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === 'matches' ? 'border-indigo-500/60 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Match Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{matches.length}</p>
          <span className="text-[11px] text-purple-400 mt-1 block font-medium">94% Top Match</span>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setActiveTab('claims')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === 'claims' ? 'border-indigo-500/60 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Claims</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{claims.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">In review</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('lost')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'lost'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileQuestion className="w-4 h-4 text-rose-400" />
          <span>My Lost Reports ({lostItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('found')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'found'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Gift className="w-4 h-4 text-emerald-400" />
          <span>My Found Items ({foundItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <GitCompare className="w-4 h-4 text-purple-400" />
          <span>Suggested Matches ({matches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileCheck className="w-4 h-4 text-amber-400" />
          <span>My Claims ({claims.length})</span>
        </button>
      </div>

      {/* Tab Content Areas */}
      {loading ? (
        <Loading message="Fetching campus records..." />
      ) : (
        <div>
          {/* TAB 1: My Lost Items */}
          {activeTab === 'lost' && (
            <div>
              {lostItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lostItems.map((item) => (
                    <ItemCard key={item.id} item={item} type="lost" />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
                  <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Lost Item Reports</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                    Haven't lost anything? Great! If you misplace an item, log it here to trigger automated matching.
                  </p>
                  <Link
                    to="/report-lost"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report a Lost Item
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: My Found Items */}
          {activeTab === 'found' && (
            <div>
              {foundItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foundItems.map((item) => (
                    <ItemCard key={item.id} item={item} type="found" />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
                  <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Found Items Logged</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                    Found something unattended on campus? Report it so we can alert the rightful owner.
                  </p>
                  <Link
                    to="/report-found"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report a Found Item
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Matches */}
          {activeTab === 'matches' && (
            <div>
              {matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
                  <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Active Match Suggestions</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    The matching algorithm is actively scanning campus logs. When an item matching your description is reported, an alert will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Claims */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <div key={claim.id} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          {claim.status === 'pending' ? 'Under Admin Review' : claim.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Submitted {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">
                        {claim.match?.lost_item?.title || 'Claimed Item'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xl">
                        <span className="font-semibold text-slate-300">Proof submitted:</span> "{claim.proof_message}"
                      </p>
                    </div>

                    <Link
                      to="/claims"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 shrink-0 self-start sm:self-center"
                    >
                      <span>Track Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
                  <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Active Claims</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    When you locate your item in the matches or directory, you can submit an ownership claim to initiate handoff.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

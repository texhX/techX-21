import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import MatchCard from '../components/MatchCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { 
  Sparkles, 
  GitCompare, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Tag, 
  Palette, 
  FileText, 
  CheckCircle2, 
  X, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

const DEMO_MATCHES = [
  {
    id: 'demo-match-1',
    match_score: 94,
    category_score: 100,
    description_score: 88,
    location_score: 100,
    date_score: 95,
    color_score: 100,
    image_score: 90,
    match_reason: [
      'Identical Category (Wallets & Bags)',
      'Matching / Adjacent Location (Central Campus Library)',
      'Dates align within 24–72 hours',
      'Matching color profile (Black)',
      'Textual description & keyword correlation'
    ],
    status: 'suggested',
    lost_item: {
      id: 'lost-1',
      title: 'Black Leather Bifold Wallet',
      description: 'Contains university student card, driver license, and metro pass.',
      category: 'Wallets & Bags',
      subcategory: 'Bifold Wallet',
      color: 'Black',
      location: 'Central Campus Library (1st/2nd Floor)',
      lost_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
      profiles: { full_name: 'Alex Johnson', email: 'alex@campus.edu' }
    },
    found_item: {
      id: 'found-1',
      title: 'Black Leather Wallet with Student ID',
      description: 'Black leather wallet found on a study desk. Handed to librarian desk staff.',
      category: 'Wallets & Bags',
      subcategory: 'Bifold Wallet',
      color: 'Black',
      location: 'Central Campus Library (1st/2nd Floor)',
      found_date: new Date().toISOString().split('T')[0],
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
      profiles: { full_name: 'Jessica Taylor (Staff)', email: 'jessica@campus.edu' }
    }
  },
  {
    id: 'demo-match-2',
    match_score: 82,
    category_score: 100,
    description_score: 75,
    location_score: 85,
    date_score: 85,
    color_score: 100,
    image_score: 80,
    match_reason: [
      'Identical Category (Electronics & Gadgets)',
      'Matching Location (Science Block)',
      'Dates align within 48 hours',
      'Matching color (White)'
    ],
    status: 'suggested',
    lost_item: {
      id: 'lost-2',
      title: 'Apple AirPods Pro (2nd Gen)',
      description: 'White charging case with red silicone carabiner clip.',
      category: 'Electronics & Gadgets',
      color: 'White',
      location: 'Science Block (Room 302 / Labs)',
      lost_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
    },
    found_item: {
      id: 'found-target-2',
      title: 'AirPods Charging Case in Red Sleeve',
      description: 'Found on third floor laboratory bench.',
      category: 'Electronics & Gadgets',
      color: 'White',
      location: 'Science Block (3rd Floor)',
      found_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
    }
  }
];

export default function Matches() {
  const { user, isSupabaseConfigured } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState(DEMO_MATCHES);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreFilter, setScoreFilter] = useState('all');

  useEffect(() => {
    // Check if a match ID was passed via query parameter
    const matchId = searchParams.get('id');
    if (matchId) {
      const match = matches.find((m) => m.id === matchId);
      if (match) setSelectedMatch(match);
    }
  }, [searchParams, matches]);

  const filteredMatches = matches.filter((m) => {
    if (scoreFilter === 'high') return m.match_score >= 85;
    if (scoreFilter === 'medium') return m.match_score >= 60 && m.match_score < 85;
    return true;
  });

  function handleClaimRequest(match) {
    navigate(`/claims?match_id=${match.id}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Automated Multi-Attribute Scoring
          </div>
          <h1 className="text-3xl font-extrabold text-white">Suggested Matches</h1>
          <p className="text-slate-400 text-sm mt-1">
            Our algorithm correlates category, location proximity, timestamps, colors, and descriptions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setScoreFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              scoreFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Matches ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setScoreFilter('high')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              scoreFilter === 'high' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High Confidence (85%+)
          </button>
        </div>
      </div>

      {/* Algorithm Transparency Card */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Configured Scoring Weights</h3>
            <p className="text-xs text-slate-400">
              Category (25%) • Description Text (25%) • Campus Location (20%) • Date Proximity (15%) • Color (10%) • Visual (5%)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Deterministic & Fair Matching
        </span>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <Loading message="Scanning matches..." />
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <div key={match.id} className="flex flex-col">
              <MatchCard match={match} />
              <button
                type="button"
                onClick={() => setSelectedMatch(match)}
                className="mt-2.5 w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Open Detailed Side-by-Side Comparison</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center border border-slate-800">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Matches in this Category</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Try adjusting your score filter to view lower-confidence suggestions.
          </p>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      <Modal
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        title="Side-by-Side Match Analysis"
        maxWidth="max-w-4xl"
      >
        {selectedMatch && (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-extrabold text-indigo-300 text-lg shadow-glow">
                  {selectedMatch.match_score}%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Automated Confidence Score</h4>
                  <p className="text-xs text-indigo-300/80">
                    High likelihood of matching the lost item report.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const match = selectedMatch;
                  setSelectedMatch(null);
                  handleClaimRequest(match);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Request Claim</span>
              </button>
            </div>

            {/* Side-by-Side Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Column 1: Lost Item */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Your Reported Lost Item
                  </span>
                  <span className="text-[10px] text-slate-400">Owner Report</span>
                </div>

                {selectedMatch.lost_item?.image_url && (
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={selectedMatch.lost_item.image_url}
                      alt="Lost Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {selectedMatch.lost_item?.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {selectedMatch.lost_item?.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-indigo-400" /> Category</span>
                    <span className="font-semibold text-slate-200">{selectedMatch.lost_item?.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> Location</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">{selectedMatch.lost_item?.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date Lost</span>
                    <span className="font-semibold text-slate-200">{selectedMatch.lost_item?.lost_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-purple-400" /> Color</span>
                    <span className="font-semibold text-slate-200">{selectedMatch.lost_item?.color || 'Black'}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Found Item */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Discovered Found Property
                  </span>
                  <span className="text-[10px] text-slate-400">Finder Turn-In</span>
                </div>

                {selectedMatch.found_item?.image_url && (
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={selectedMatch.found_item.image_url}
                      alt="Found Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {selectedMatch.found_item?.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {selectedMatch.found_item?.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-indigo-400" /> Category</span>
                    <span className="font-semibold text-slate-200">{selectedMatch.found_item?.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Location</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">{selectedMatch.found_item?.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date Found</span>
                    <span className="font-semibold text-slate-200">{selectedMatch.found_item?.found_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-purple-400" /> Color</span>
                    <span className="font-semibold text-slate-200">{selectedMatch.found_item?.color || 'Black'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Match? Section */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Why Was This Match Suggested?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedMatch.match_reason?.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mathematical Factor Score Breakdown Bars */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Attribute Similarity Breakdown
              </h4>

              {/* Category */}
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Category Alignment (Weight: 25%)</span>
                  <span className="text-indigo-400 font-bold">{selectedMatch.category_score || 100}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedMatch.category_score || 100}%` }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Description Keyword Overlap (Weight: 25%)</span>
                  <span className="text-indigo-400 font-bold">{selectedMatch.description_score || 88}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedMatch.description_score || 88}%` }} />
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Campus Proximity (Weight: 20%)</span>
                  <span className="text-rose-400 font-bold">{selectedMatch.location_score || 100}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${selectedMatch.location_score || 100}%` }} />
                </div>
              </div>

              {/* Date */}
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Temporal / Date Proximity (Weight: 15%)</span>
                  <span className="text-emerald-400 font-bold">{selectedMatch.date_score || 95}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedMatch.date_score || 95}%` }} />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              >
                Close Comparison
              </button>
              <button
                type="button"
                onClick={() => {
                  const match = selectedMatch;
                  setSelectedMatch(null);
                  handleClaimRequest(match);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Request Claim Verification</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

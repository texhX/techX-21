import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MatchCard({ match, onClaimClick }) {
  if (!match) return null;

  const score = Math.round(match.match_score || 0);
  const lostItem = match.lost_item;
  const foundItem = match.found_item;
  const reasons = match.match_reason || [];

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 65) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      <div>
        {/* Top Header with Score */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Automated Match</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Multi-Attribute Scoring</span>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(score)}`}>
            <span>{score}% Match</span>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          {/* Lost Item */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">Your Lost Report</span>
            <h4 className="text-xs font-semibold text-slate-100 truncate">{lostItem?.title || 'Reported Lost Item'}</h4>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{lostItem?.location || 'Unknown'}</span>
            </p>
          </div>

          {/* Found Item */}
          <div className="flex flex-col border-l border-slate-800 pl-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Found Candidate</span>
            <h4 className="text-xs font-semibold text-slate-100 truncate">{foundItem?.title || 'Reported Found Item'}</h4>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{foundItem?.location || 'Unknown'}</span>
            </p>
          </div>
        </div>

        {/* Why this match? */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">Why this match?</span>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        {onClaimClick ? (
          <button
            type="button"
            onClick={() => onClaimClick(match)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Request Claim Verification</span>
          </button>
        ) : (
          <Link
            to={`/matches?id=${match.id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
          >
            <span>Review Full Match Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

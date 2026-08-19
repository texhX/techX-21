import React from 'react';
import { MapPin, Calendar, Tag, Clock, ArrowUpRight, Image as ImageIcon } from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Active', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  matched: { label: 'Match Found', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  claimed: { label: 'Claim Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  returned: { label: 'Returned', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  closed: { label: 'Closed', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function ItemCard({ item, type = 'lost', onAction, actionLabel = 'View Details' }) {
  if (!item) return null;

  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
  const dateValue = item.lost_date || item.found_date || item.created_at;
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group border border-slate-800">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs font-medium">No Image Uploaded</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border} backdrop-blur-md`}>
            {status.label}
          </span>
        </div>

        {/* Type Tag */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
            type === 'lost' ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
          } shadow-sm`}>
            {type === 'lost' ? 'Lost' : 'Found'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Color */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {item.category}
            </span>
            {item.color && (
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                {item.color}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-3">
            <div className="flex items-center gap-1.5 truncate max-w-[130px]" title={item.location}>
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Action Trigger */}
          {onAction && (
            <button
              type="button"
              onClick={() => onAction(item)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

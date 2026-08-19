import React from 'react';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  'Wallet',
  'AirPods',
  'Library',
  'Keys',
  'Student ID',
  'Hydro Flask',
  'Charger'
];

export default function SearchBar({ value, onChange, placeholder = 'Search across all lost and found campus reports...', onSelectSuggestion }) {
  return (
    <div className="w-full space-y-3">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <SearchIcon className="w-5 h-5 text-indigo-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none transition shadow-inner"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4 p-0.5 rounded-full bg-slate-800 hover:bg-slate-700" />
          </button>
        )}
      </div>

      {/* Quick Search Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium mr-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Quick Filters:
        </span>
        {QUICK_SUGGESTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              if (onSelectSuggestion) onSelectSuggestion(tag);
              else onChange(tag);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition shrink-0 cursor-pointer text-[11px]"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

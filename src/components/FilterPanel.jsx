import React from 'react';
import { Filter, RotateCcw, Tag, MapPin, Palette, CheckCircle, Layers } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Wallets & Bags',
  'Electronics & Gadgets',
  'IDs, Cards & Passports',
  'Keys & Keychains',
  'Books & Stationery',
  'Clothing & Apparel',
  'Eyewear & Accessories',
  'Water Bottles & Flasks',
  'Other Items'
];

const LOCATIONS = [
  'All Locations',
  'Central Campus Library (1st/2nd Floor)',
  'Main Cafeteria & Food Court',
  'Science Block (Room 302 / Labs)',
  'Engineering Wing (East Block)',
  'Student Hostel A / B',
  'Campus Sports Complex & Gym',
  'Auditorium & Student Center',
  'Campus Bus Stop / Parking Lot',
  'Administration Block'
];

const COLORS = [
  'All Colors',
  'Black',
  'White',
  'Blue',
  'Red',
  'Brown',
  'Gray/Silver',
  'Gold',
  'Green',
  'Yellow/Orange'
];

export default function FilterPanel({ filters, onFilterChange, onReset }) {
  return (
    <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* 1. Item Type Toggle */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Report Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          {['all', 'lost', 'found'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onFilterChange('type', t)}
              className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                filters.type === t
                  ? t === 'lost'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : t === 'found'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Location Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          Campus Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc === 'All Locations' ? 'all' : loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Color Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          Color
        </label>
        <select
          value={filters.color}
          onChange={(e) => onFilterChange('color', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
        >
          {COLORS.map((col) => (
            <option key={col} value={col === 'All Colors' ? 'all' : col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Status Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Report Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="matched">Matched</option>
          <option value="claimed">Claimed</option>
          <option value="returned">Returned</option>
        </select>
      </div>
    </div>
  );
}

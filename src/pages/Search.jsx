import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Calendar, 
  X, 
  Layers, 
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Comprehensive catalog sample data
const ALL_CATALOG_ITEMS = [
  {
    id: 'lost-1',
    type: 'lost',
    title: 'Black Leather Bifold Wallet',
    description: 'Black leather wallet with university ID card, driver license, and metro pass inside.',
    category: 'Wallets & Bags',
    subcategory: 'Bifold Wallet',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    lost_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    lost_time: '14:30',
    status: 'matched',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Alex Johnson', email: 'alex@campus.edu' }
  },
  {
    id: 'found-1',
    type: 'found',
    title: 'Black Leather Wallet with Student ID',
    description: 'Black leather wallet found on a study desk. Handed to librarian desk staff.',
    category: 'Wallets & Bags',
    subcategory: 'Bifold Wallet',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    found_date: new Date().toISOString().split('T')[0],
    found_time: '15:10',
    status: 'matched',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Jessica Taylor (Campus Staff)', email: 'jessica@campus.edu' }
  },
  {
    id: 'lost-2',
    type: 'lost',
    title: 'Apple AirPods Pro (2nd Gen)',
    description: 'White charging case with a red silicone carabiner clip. Left earbud has tiny scratch.',
    category: 'Electronics & Gadgets',
    subcategory: 'Wireless Earbuds',
    color: 'White',
    location: 'Science Block (Room 302 / Labs)',
    lost_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    lost_time: '11:15',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Emily Davis', email: 'emily@campus.edu' }
  },
  {
    id: 'found-2',
    type: 'found',
    title: 'Cobalt Blue Hydro Flask 32oz',
    description: 'Stainless steel water bottle with campus sports stickers on the back.',
    category: 'Water Bottles & Flasks',
    subcategory: 'Flask',
    color: 'Blue',
    location: 'Campus Sports Complex & Gym',
    found_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    found_time: '18:20',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Coach Miller', email: 'sports@campus.edu' }
  },
  {
    id: 'lost-3',
    type: 'lost',
    title: 'Silver Dell XPS 15 Laptop Charger',
    description: '130W USB-C black braided power brick with small blue tape tag.',
    category: 'Electronics & Gadgets',
    subcategory: 'Charger',
    color: 'Gray/Silver',
    location: 'Engineering Wing (East Block)',
    lost_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    lost_time: '16:45',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'David Chen', email: 'david@campus.edu' }
  },
  {
    id: 'found-3',
    type: 'found',
    title: 'TI-84 Plus CE Graphing Calculator',
    description: 'Black calculator with slider case. Has small gold star sticker on reverse.',
    category: 'Electronics & Gadgets',
    subcategory: 'Calculator',
    color: 'Black',
    location: 'Science Block (Room 302 / Labs)',
    found_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    found_time: '12:00',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Prof. Raymond', email: 'raymond@campus.edu' }
  }
];

export default function Search() {
  const { isSupabaseConfigured } = useAuth();
  const [items, setItems] = useState(ALL_CATALOG_ITEMS);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    location: 'all',
    color: 'all',
    status: 'all',
  });
  const [sortOrder, setSortOrder] = useState('newest');

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleResetFilters() {
    setSearchQuery('');
    setFilters({
      type: 'all',
      category: 'all',
      location: 'all',
      color: 'all',
      status: 'all',
    });
  }

  // Active filter count
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== 'all').length + (searchQuery ? 1 : 0);

  // Filter & Sort Logic
  const filteredResults = items
    .filter((item) => {
      // 1. Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        const locMatch = item.location?.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        const colorMatch = item.color?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !locMatch && !catMatch && !colorMatch) return false;
      }

      // 2. Type
      if (filters.type !== 'all' && item.type !== filters.type) return false;

      // 3. Category
      if (filters.category !== 'all' && item.category !== filters.category) return false;

      // 4. Location
      if (filters.location !== 'all' && item.location !== filters.location) return false;

      // 5. Color
      if (filters.color !== 'all' && item.color !== filters.color) return false;

      // 6. Status
      if (filters.status !== 'all' && item.status !== filters.status) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      const dateA = new Date(a.lost_date || a.found_date || a.created_at);
      const dateB = new Date(b.lost_date || b.found_date || b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <SearchIcon className="w-3.5 h-3.5" />
          Campus-Wide Search & Discovery
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Search Campus Directory</h1>
        <p className="text-slate-400 text-sm">
          Instantly query lost belongings and discovered property across all departments and campus zones.
        </p>
      </div>

      {/* Global Search Bar */}
      <div className="max-w-3xl mx-auto mb-10">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSelectSuggestion={(tag) => setSearchQuery(tag)}
        />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex lg:hidden items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Filters ({activeFilterCount})</span>
        </button>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Filter (Desktop) */}
        <aside className={`lg:col-span-3 ${mobileFilterOpen ? 'block mb-6' : 'hidden lg:block'}`}>
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9">
          {/* Controls & Active Tags Header */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
              </span>

              {/* Active Filter Pills */}
              {filters.type !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Type: {filters.type}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('type', 'all')} />
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {filters.category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('category', 'all')} />
                </span>
              )}
              {filters.location !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Location
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('location', 'all')} />
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {filters.status}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('status', 'all')} />
                </span>
              )}
            </div>

            {/* Desktop Sort Selector */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none transition cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alpha">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResults.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  type={item.type || 'lost'}
                  actionLabel="Inspect Details"
                  onAction={(selected) => setSelectedItem(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center border border-slate-800">
              <SearchIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Matching Items Found</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                No items matched your search query. Try broadening your keywords or resetting filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Item Detail Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Item Details'}
      >
        {selectedItem && (
          <div className="space-y-6">
            {selectedItem.image_url && (
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedItem.type === 'lost' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedItem.type === 'lost' ? 'Lost Report' : 'Found Item'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedItem.category}
              </span>
              {selectedItem.color && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                  Color: {selectedItem.color}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Description
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Campus Location</span>
                  <span className="font-medium">{selectedItem.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Date</span>
                  <span className="font-medium">
                    {selectedItem.lost_date || selectedItem.found_date || 'Recent'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              >
                Close Window
              </button>
              {selectedItem.type === 'found' ? (
                <Link
                  to={`/claims?found_id=${selectedItem.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim This Item</span>
                </Link>
              ) : (
                <Link
                  to="/report-found"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition"
                >
                  <span>I Found This Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

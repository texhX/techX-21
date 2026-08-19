import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  Gift, 
  Clock, 
  Tag, 
  Palette, 
  User, 
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

const DEMO_FOUND_ITEMS = [
  {
    id: 'found-1',
    title: 'Black Leather Wallet with Student ID',
    description: 'Black leather wallet found on a study desk on the 2nd floor. Turned over to desk staff.',
    category: 'Wallets & Bags',
    subcategory: 'Bifold Wallet',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    custody: 'Library Front Desk',
    found_date: new Date().toISOString().split('T')[0],
    found_time: '10:00',
    status: 'matched',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Jessica Taylor (Staff)', email: 'jessica@campus.edu' }
  },
  {
    id: 'found-2',
    title: 'Cobalt Blue Hydro Flask 32oz',
    description: 'Blue insulated water bottle with various campus club stickers.',
    category: 'Water Bottles & Flasks',
    subcategory: 'Stainless Steel Flask',
    color: 'Blue',
    location: 'Campus Sports Complex & Gym',
    custody: 'Security Main Desk',
    found_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    found_time: '16:45',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Coach Miller', email: 'miller@campus.edu' }
  },
  {
    id: 'found-3',
    title: 'TI-84 Plus CE Graphing Calculator',
    description: 'Black Texas Instruments graphing calculator left in computer lab.',
    category: 'Electronics & Gadgets',
    subcategory: 'Calculator',
    color: 'Black',
    location: 'Science Block (Room 302 / Labs)',
    custody: 'Science Dept Office',
    found_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    found_time: '12:30',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Prof. Raymond', email: 'raymond@campus.edu' }
  }
];

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

const CAMPUS_LOCATIONS = [
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

export default function FoundItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState(DEMO_FOUND_ITEMS);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const data = await itemService.getFoundItems({
          status: statusFilter,
          category: categoryFilter,
          location: locationFilter,
          query: searchQuery,
        });
        if (data && data.length > 0) {
          setItems(data);
        } else if (!searchQuery && categoryFilter === 'all' && locationFilter === 'all') {
          setItems(DEMO_FOUND_ITEMS);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching found items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [statusFilter, categoryFilter, locationFilter, searchQuery]);

  // Client-side sorting
  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.found_date || b.created_at) - new Date(a.found_date || a.created_at);
    }
    if (sortOrder === 'oldest') {
      return new Date(a.found_date || a.created_at) - new Date(b.found_date || b.created_at);
    }
    if (sortOrder === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            Turned-In Property Registry
          </div>
          <h1 className="text-3xl font-extrabold text-white">Found Property Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Property discovered across campus and placed into safekeeping custody. Recognize your belonging? Submit a claim!
          </p>
        </div>

        <Link
          to="/report-found"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-600/25 transition self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Log Found Property
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, description, custody point..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'All Categories' ? 'all' : e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 outline-none transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="md:col-span-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value === 'All Locations' ? 'all' : e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 outline-none transition cursor-pointer"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc === 'All Locations' ? 'all' : loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 outline-none transition cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'active', 'matched', 'claimed', 'returned'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Found Items */}
      {loading ? (
        <Loading message="Fetching found property directory..." />
      ) : sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="found"
              onViewDetails={(selected) => setSelectedItem(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center border border-slate-800">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Found Property Matches</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            No items matched your current filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setLocationFilter('all');
              setStatusFilter('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Detail Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Found Property Registry Details"
        maxWidth="max-w-2xl"
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Header Image */}
            {selectedItem.image_url && (
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title & Status */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {selectedItem.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {selectedItem.title}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                selectedItem.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}>
                {selectedItem.status}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Turn-In Description
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                {selectedItem.description}
              </p>
            </div>

            {/* Custody Information Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Current Safekeeping Location</span>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                  {selectedItem.custody || 'Campus Security Main Desk'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Visit this custody station with proof of identity or submit an ownership claim to initiate handoff.
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Discovered At
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedItem.location}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Found
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedItem.found_date}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-purple-400" /> Color
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedItem.color || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Claim CTA Bar */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Is this your belonging?</span>
                <p className="text-[11px] text-slate-400">
                  Submit confidential proof of ownership to get this item verified and released.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  navigate(`/claims?found_id=${selectedItem.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

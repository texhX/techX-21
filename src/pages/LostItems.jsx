import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FileQuestion, 
  Clock, 
  Tag, 
  Palette, 
  User, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

const DEMO_LOST_ITEMS = [
  {
    id: 'lost-1',
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
    id: 'lost-2',
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
    id: 'lost-3',
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

export default function LostItems() {
  const [items, setItems] = useState(DEMO_LOST_ITEMS);
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
        const data = await itemService.getLostItems({
          status: statusFilter,
          category: categoryFilter,
          location: locationFilter,
          query: searchQuery,
        });

        if (data && data.length > 0) {
          setItems(data);
        } else if (!searchQuery && categoryFilter === 'all' && locationFilter === 'all') {
          setItems(DEMO_LOST_ITEMS);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching lost items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [statusFilter, categoryFilter, locationFilter, searchQuery]);

  // Client side sorting
  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.lost_date || b.created_at) - new Date(a.lost_date || a.created_at);
    }
    if (sortOrder === 'oldest') {
      return new Date(a.lost_date || a.created_at) - new Date(b.lost_date || b.created_at);
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileQuestion className="w-3.5 h-3.5" />
            Missing Belongings Directory
          </div>
          <h1 className="text-3xl font-extrabold text-white">Lost Items Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse through items reported lost on campus. If you found any of these, turn it in to assist your peer!
          </p>
        </div>

        <Link
          to="/report-lost"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-md shadow-rose-600/25 transition self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Report Lost Item
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
              placeholder="Search title or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'All Categories' ? 'all' : e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
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
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
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
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 outline-none transition cursor-pointer"
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
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Lost Items */}
      {loading ? (
        <Loading message="Fetching lost items directory..." />
      ) : sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="lost"
              onViewDetails={(selected) => setSelectedItem(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center border border-slate-800">
          <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Lost Items Found</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            No items matched your current filter criteria. Try adjusting your query or report a new lost item.
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
        title="Lost Property Incident Details"
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
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  {selectedItem.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {selectedItem.title}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                selectedItem.status === 'active' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}>
                {selectedItem.status}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description & Distinguishing Features
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                {selectedItem.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedItem.location}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Lost
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedItem.lost_date}
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

            {/* Reporter Contact Info */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Reported by {selectedItem.profiles?.full_name || 'Alex Johnson'}
                  </span>
                  <span className="text-[11px] text-indigo-300/80">
                    {selectedItem.profiles?.email || 'Campus Student Member'}
                  </span>
                </div>
              </div>

              <Link
                to="/report-found"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                <span>Found this?</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

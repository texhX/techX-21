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
  Building,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const DEMO_FOUND_ITEMS = [
  {
    id: 'found-1',
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
    id: 'found-2',
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
    id: 'found-3',
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
  },
  {
    id: 'found-4',
    title: 'Silver Toyota Car Key on Lanyard',
    description: 'Electronic remote key fob with university logo ribbon.',
    category: 'Keys & Keychains',
    subcategory: 'Vehicle Key',
    color: 'Gray/Silver',
    location: 'Campus Bus Stop / Parking Lot',
    found_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    found_time: '09:40',
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=60',
    profiles: { full_name: 'Security Officer Pete', email: 'security@campus.edu' }
  }
];

export default function FoundItems() {
  const { isSupabaseConfigured } = useAuth();
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
      if (!isSupabaseConfigured) return;
      setLoading(true);
      try {
        const data = await itemService.getFoundItems({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          location: locationFilter === 'all' ? undefined : locationFilter,
          query: searchQuery || undefined,
        });
        if (data && data.length > 0) {
          setItems(data);
        }
      } catch (err) {
        console.error('Error fetching found items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [isSupabaseConfigured, statusFilter, categoryFilter, locationFilter, searchQuery]);

  // Client-side filtering and sorting
  const filteredItems = items
    .filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchLoc = locationFilter === 'all' || item.location === locationFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchCat && matchLoc && matchStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.found_date || a.created_at);
      const dateB = new Date(b.found_date || b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            Campus Found Items Registry
          </div>
          <h1 className="text-3xl font-extrabold text-white">Found Items</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse items found and turned in by campus security, staff, and honest fellow students.
          </p>
        </div>

        <Link
          to="/report-found"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-600/25 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Report Found Item
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword (e.g. Hydro Flask, wallet, keys)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 outline-none transition cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Wallets & Bags">Wallets & Bags</option>
              <option value="Electronics & Gadgets">Electronics & Gadgets</option>
              <option value="IDs, Cards & Passports">IDs, Cards & Passports</option>
              <option value="Keys & Keychains">Keys & Keychains</option>
              <option value="Books & Stationery">Books & Stationery</option>
              <option value="Water Bottles & Flasks">Water Bottles & Flasks</option>
              <option value="Clothing & Apparel">Clothing & Apparel</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 outline-none transition cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="matched">Matched</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 outline-none transition cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Showing {filteredItems.length} Found {filteredItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <Loading message="Loading found items directory..." />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="found"
              actionLabel="Inspect & Claim"
              onAction={(selected) => setSelectedItem(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center border border-slate-800">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Matching Found Items</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Try adjusting your search criteria or checking back soon.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setLocationFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Found Item Details'}
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Image Banner */}
            {selectedItem.image_url && (
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Tags Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Found Item
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedItem.category}
              </span>
              {selectedItem.subcategory && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                  {selectedItem.subcategory}
                </span>
              )}
              {selectedItem.color && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                  Color: {selectedItem.color}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 uppercase tracking-wider">
                Status: {selectedItem.status}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Item Description & Custody Notes
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Found Location</span>
                  <span className="font-medium">{selectedItem.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Date & Time Logged</span>
                  <span className="font-medium">
                    {selectedItem.found_date} {selectedItem.found_time ? `at ${selectedItem.found_time}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Reporter Contact Info */}
            {selectedItem.profiles && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                <User className="w-4 h-4 text-emerald-400" />
                <span>
                  Logged by <strong className="text-slate-200">{selectedItem.profiles.full_name}</strong>
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              >
                Close Window
              </button>
              <Link
                to={`/claims?found_id=${selectedItem.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>This Is My Item (Claim)</span>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

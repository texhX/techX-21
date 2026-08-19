import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import ImageUpload from '../components/ImageUpload';
import { 
  Gift, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Palette, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

const CATEGORIES = [
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
  'Black',
  'White',
  'Blue',
  'Red',
  'Brown',
  'Gray/Silver',
  'Gold',
  'Green',
  'Yellow/Orange',
  'Multicolor/Pattern'
];

const CUSTODY_LOCATIONS = [
  'Turned in at Library Front Desk',
  'Turned in at Campus Security Main Office',
  'Turned in at Cafeteria Help Desk',
  'Turned in at Department Office',
  'Held by Finder (Will hand off upon verified claim)'
];

export default function ReportFound() {
  const { user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Wallets & Bags',
    subcategory: '',
    description: '',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    found_date: new Date().toISOString().split('T')[0],
    found_time: '15:00',
    custody: 'Turned in at Library Front Desk',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.found_date) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Upload image if provided
      if (imageFile) {
        if (isSupabaseConfigured) {
          imageUrl = await itemService.uploadImage(imageFile, 'found');
        } else {
          // Local demo preview object URL
          imageUrl = URL.createObjectURL(imageFile);
        }
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60';
      }

      // Combine custody note into description if provided
      const fullDescription = formData.custody 
        ? `${formData.description}\n\n[Custody Location]: ${formData.custody}`
        : formData.description;

      // 2. Save found item
      if (isSupabaseConfigured && user) {
        await itemService.createFoundItem({
          user_id: user.id,
          title: formData.title,
          description: fullDescription,
          category: formData.category,
          subcategory: formData.subcategory,
          color: formData.color,
          location: formData.location,
          found_date: formData.found_date,
          found_time: formData.found_time || null,
          image_url: imageUrl,
          status: 'active',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { state: { newFoundItemCreated: true } });
      }, 1500);
    } catch (err) {
      console.error('Failed to report found item:', err);
      setError(err.message || 'Failed to submit found report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Gift className="w-3.5 h-3.5" />
          Found Property Turn-In Log
        </div>
        <h1 className="text-3xl font-extrabold text-white">Report a Found Item</h1>
        <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
          Help return misplaced belongings to their owner. Logging this item will automatically notify students who filed matching lost reports.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold">Found Item Successfully Logged!</h4>
            <p className="text-xs text-emerald-400/80">
              Matching engine is notifying matching report owners. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="text-xs sm:text-sm">{error}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {/* Section 1: Item Details */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            1. Discovered Item Information
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Black Leather Wallet with Student ID"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subcategory (Optional)
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g. Bifold Wallet"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Color & Campus Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  Primary Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  {COLORS.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Where Was It Found? *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Found & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date Found *
                </label>
                <input
                  type="date"
                  name="found_date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.found_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Time Found
                </label>
                <input
                  type="time"
                  name="found_time"
                  value={formData.found_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition"
                />
              </div>
            </div>

            {/* Custody Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                Current Custody / Turn-in Point *
              </label>
              <select
                name="custody"
                value={formData.custody}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition cursor-pointer"
              >
                {CUSTODY_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Visible Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe visible aspects of the found item. (Note: Avoid revealing secret PINs or private lock combinations so claimant must verify ownership)..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Image Upload */}
        <div className="border-t border-slate-800/80 pt-6">
          <ImageUpload
            onImageSelect={(file) => setImageFile(file)}
            label="2. Photograph of Found Item"
          />
        </div>

        {/* Submit Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Our matching engine immediately calculates confidence scores against registered lost reports.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Logging Found Item...</span>
            ) : (
              <>
                <span>Publish Found Log</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

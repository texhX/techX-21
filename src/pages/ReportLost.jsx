import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import ImageUpload from '../components/ImageUpload';
import { 
  FileQuestion, 
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
  ShieldAlert
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

export default function ReportLost() {
  const { user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Wallets & Bags',
    subcategory: '',
    description: '',
    color: 'Black',
    location: 'Central Campus Library (1st/2nd Floor)',
    lost_date: new Date().toISOString().split('T')[0],
    lost_time: '14:30',
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

    if (!formData.title || !formData.description || !formData.lost_date) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Upload image if provided
      if (imageFile) {
        if (isSupabaseConfigured) {
          imageUrl = await itemService.uploadImage(imageFile, 'lost');
        } else {
          // Local demo preview object URL
          imageUrl = URL.createObjectURL(imageFile);
        }
      } else {
        // Sample placeholder if none provided
        imageUrl = 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60';
      }

      // 2. Save lost item
      if (isSupabaseConfigured && user) {
        await itemService.createLostItem({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          color: formData.color,
          location: formData.location,
          lost_date: formData.lost_date,
          lost_time: formData.lost_time || null,
          image_url: imageUrl,
          status: 'active',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { state: { newItemCreated: true } });
      }, 1500);
    } catch (err) {
      console.error('Failed to report lost item:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <FileQuestion className="w-3.5 h-3.5" />
          Lost Property Incident Report
        </div>
        <h1 className="text-3xl font-extrabold text-white">Report a Lost Item</h1>
        <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
          Provide accurate details about your misplaced item. Our matching algorithm automatically cross-references active found item logs.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold">Lost Report Successfully Submitted!</h4>
            <p className="text-xs text-emerald-400/80">
              Matching engine is scanning campus records. Redirecting to your dashboard...
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
        {/* Section 1: Basic Info */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            1. Item Details
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
                placeholder="e.g. Black Leather Bifold Wallet"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition cursor-pointer"
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
                  placeholder="e.g. Slim Wallet / Cardholder"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Color & Primary Campus Location */}
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition cursor-pointer"
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
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Campus Location *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date Lost *
                </label>
                <input
                  type="date"
                  name="lost_date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.lost_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Approximate Time
                </label>
                <input
                  type="time"
                  name="lost_time"
                  value={formData.lost_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Detailed Description & Identifying Marks *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe any unique features, stickers, brand markings, or contents that help verify ownership..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Photograph Upload */}
        <div className="border-t border-slate-800/80 pt-6">
          <ImageUpload
            onImageSelect={(file) => setImageFile(file)}
            label="2. Item Photograph (Optional but speeds up matching)"
          />
        </div>

        {/* Submit Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Submitting automatically checks against found item logs for high-confidence matches.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-600/25 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Submitting Report...</span>
            ) : (
              <>
                <span>Publish Lost Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

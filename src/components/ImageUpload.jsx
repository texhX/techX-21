import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImageUpload({ onImageSelect, initialPreview = null, label = 'Upload Item Photograph' }) {
  const [preview, setPreview] = useState(initialPreview);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  function handleFile(file) {
    setError('');
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid format. Please upload a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    if (onImageSelect) {
      onImageSelect(file);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleRemove(e) {
    e.stopPropagation();
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImageSelect) onImageSelect(null);
  }

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/40 bg-slate-900/80 group max-h-72 flex items-center justify-center">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRemove}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
              Remove Image
            </button>
          </div>
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Image Ready
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200 mb-1">
            Click to upload or drag & drop photograph
          </p>
          <p className="text-xs text-slate-400">
            JPG, PNG, WEBP or GIF (Max 5MB)
          </p>
        </div>
      )}

      {error && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

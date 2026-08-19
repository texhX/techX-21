import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimService } from '../services/claimService';
import { itemService } from '../services/itemService';
import ImageUpload from '../components/ImageUpload';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  PlusCircle, 
  FileText, 
  Info,
  Building,
  UploadCloud,
  ChevronRight
} from 'lucide-react';

const DEMO_CLAIMS = [
  {
    id: 'demo-claim-1',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    proof_message: 'The black leather wallet contains an active university student ID with name Alex Johnson and roll number CS-2024-042, along with a transit card.',
    proof_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
    admin_note: null,
    item_title: 'Black Leather Wallet with Student ID',
    location: 'Central Campus Library (1st/2nd Floor)',
    category: 'Wallets & Bags',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'demo-claim-2',
    status: 'approved',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000).toISOString(),
    proof_message: 'Silver Dell XPS 15 Charger has a small blue tape marked with room 302 on the power brick.',
    proof_image_url: null,
    admin_note: 'Verified ownership via serial marking. Item is ready for collection at Campus Security Main Desk.',
    item_title: 'Silver Dell XPS 15 Laptop Charger',
    location: 'Engineering Wing (East Block)',
    category: 'Electronics & Gadgets',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60',
  }
];

export default function Claims() {
  const { user, profile, isSupabaseConfigured } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [claims, setClaims] = useState(DEMO_CLAIMS);
  const [loading, setLoading] = useState(false);

  // New claim modal / submission state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [proofMessage, setProofMessage] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Contextual target item info
  const matchIdParam = searchParams.get('match_id');
  const foundIdParam = searchParams.get('found_id');

  const [targetItem, setTargetItem] = useState({
    title: 'Black Leather Wallet with Student ID',
    location: 'Central Campus Library (1st/2nd Floor)',
    category: 'Wallets & Bags',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
  });

  useEffect(() => {
    if (matchIdParam || foundIdParam) {
      setIsSubmitModalOpen(true);
    }
  }, [matchIdParam, foundIdParam]);

  async function handleClaimSubmit(e) {
    e.preventDefault();
    if (!proofMessage || proofMessage.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters) proving ownership.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      let proofImageUrl = null;
      if (proofFile) {
        if (isSupabaseConfigured) {
          proofImageUrl = await itemService.uploadImage(proofFile, 'claims');
        } else {
          proofImageUrl = URL.createObjectURL(proofFile);
        }
      }

      if (isSupabaseConfigured && user) {
        await claimService.submitClaim({
          matchId: matchIdParam || null,
          claimantId: user.id,
          proofMessage,
          proofImageUrl,
        });
      }

      // Add to local state
      const newClaim = {
        id: `claim-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        proof_message: proofMessage,
        proof_image_url: proofImageUrl,
        admin_note: null,
        item_title: targetItem.title,
        location: targetItem.location,
        category: targetItem.category,
        image_url: targetItem.image_url,
      };

      setClaims((prev) => [newClaim, ...prev]);
      setSuccess(true);

      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSuccess(false);
        setProofMessage('');
        setProofFile(null);
      }, 1200);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Ownership & Chain of Custody
          </div>
          <h1 className="text-3xl font-extrabold text-white">Item Claim Verification</h1>
          <p className="text-slate-400 text-sm mt-1">
            Submit confidential ownership proofs and track administrative review status in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Ownership Claim
        </button>
      </div>

      {/* Security Info Card */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">How Claims Are Verified</h3>
            <p className="text-xs text-slate-400">
              Campus Security reviews confidential proof details against turn-in records before authorizing in-person collection.
            </p>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        {claims.length > 0 ? (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Item Overview & Thumbnail */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {claim.image_url && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img
                      src={claim.image_url}
                      alt={claim.item_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pill */}
                    {claim.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </span>
                    )}
                    {claim.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved • Ready for Pickup
                      </span>
                    )}
                    {claim.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Claim Rejected
                      </span>
                    )}

                    <span className="text-xs text-slate-500">
                      Filed on {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {claim.item_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {claim.location}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">{claim.category}</span>
                  </div>

                  {/* Proof Description Quote */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold mb-0.5">
                      Submitted Confidential Proof:
                    </span>
                    <p className="line-clamp-2 italic">"{claim.proof_message}"</p>
                  </div>
                </div>
              </div>

              {/* Status Action / Resolution Box */}
              <div className="lg:max-w-xs w-full lg:text-right border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 space-y-3">
                {claim.status === 'approved' && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Building className="w-4 h-4" />
                      Pickup Instructions
                    </div>
                    <p className="text-xs text-slate-300">
                      Please visit the <strong>Campus Security Main Desk</strong> with your Student ID card.
                    </p>
                    {claim.admin_note && (
                      <p className="text-[11px] text-emerald-300/80 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/40">
                        <strong>Admin Note:</strong> {claim.admin_note}
                      </p>
                    )}
                  </div>
                )}

                {claim.status === 'pending' && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-left">
                    <p className="text-xs text-slate-300">
                      Our administrative team will review your proof against custody logs within 1–2 business hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-3xl p-16 text-center border border-slate-800">
            <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Active Ownership Claims</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              When you spot your missing item in the directory or match suggestions, click "Request Claim" to begin verification.
            </p>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
            >
              <span>Explore Suggested Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Ownership Claim Verification"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-5">
          {/* Target Item Header */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <img
                src={targetItem.image_url}
                alt={targetItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Target Found Item</span>
              <h4 className="text-sm font-bold text-white">{targetItem.title}</h4>
              <p className="text-xs text-slate-400">{targetItem.location} • {targetItem.category}</p>
            </div>
          </div>

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Claim submitted successfully! Campus Security has been notified.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Proof Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Proof of Ownership / Identifying Details *
            </label>
            <textarea
              required
              rows={4}
              value={proofMessage}
              onChange={(e) => setProofMessage(e.target.value)}
              placeholder="Describe unique characteristics known only to the owner (e.g. roll number on card, lock combination, specific stickers, interior wallet contents, serial numbers)..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This information is encrypted and only visible to Campus Security Administrators.
            </p>
          </div>

          {/* Proof Photo */}
          <div>
            <ImageUpload
              onImageSelect={(file) => setProofFile(file)}
              label="Supporting Proof Document / Image (Optional)"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting Claim...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle,
  FileQuestion,
  Gift,
  Cpu,
  Layers,
  Users
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI-Assisted Campus Recovery Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Find What Was Lost. <br />
            <span className="gradient-text">Return What Was Found.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            CampusFind AI connects lost belongings with their rightful owners using intelligent attribute matching, automated alerts, and verified claim workflows.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              to="/report-lost"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FileQuestion className="w-5 h-5" />
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-slate-100 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              <Gift className="w-5 h-5 text-emerald-400" />
              Report Found Item
            </Link>
          </div>

          {/* Demonstration Notice */}
          <div className="inline-block px-4 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-indigo-300">Hackathon Edition:</span> Powered by modular multi-attribute weighted matching algorithm.
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How CampusFind AI Works</h2>
            <p className="text-slate-400 text-base">
              A transparent, 4-step workflow that pairs item reports with high-confidence matching and verified claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-5">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Submit Report</h3>
              <p className="text-sm text-slate-400">
                Log item details with category, specific campus location, date/time, color, and photos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-5">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Intelligent Matching</h3>
              <p className="text-sm text-slate-400">
                The engine evaluates category, textual similarity, location proximity, timestamps, and colors.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg mb-5">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Match Percentage & Why</h3>
              <p className="text-sm text-slate-400">
                Get an honest confidence score (e.g. 94%) with clear attribute breakdown explaining the score.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                04
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Claim & Verification</h3>
              <p className="text-sm text-slate-400">
                Claimant provides proof of ownership reviewed by campus administrators before handoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Core Platform Capabilities</h2>
            <p className="text-slate-400 text-base">
              Engineered specifically for university campuses with strict security, fraud prevention, and role controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card glass-card-hover p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Attribute Scoring</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Evaluates structured parameters (category, color, campus zone, timestamps) alongside tokenized text analysis for accurate pairing.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified Claim Workflow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Prevents fraudulent claims through ownership verification prompts, photo proof uploads, and administrative moderation logs.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Campus Zone Mapping</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Organized campus locations (Library, Cafeteria, Science Block, Hostels, Sports Complex) for hyper-localized item tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">CampusFind AI</span>
            <span className="text-xs text-slate-500">| TechXplore 2026</span>
          </div>
          <p className="text-xs text-slate-500">
            Designed for secure, transparent campus lost and found management.
          </p>
        </div>
      </footer>
    </div>
  );
}

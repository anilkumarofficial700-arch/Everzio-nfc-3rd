import React, { useState } from 'react';
import {
  Smartphone,
  CreditCard,
  QrCode,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Wifi,
  Radio,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface HomeSimulatorProps {
  onOpenCard: (cardCode: string) => void;
  onOpenAdmin: () => void;
}

export const HomeSimulator: React.FC<HomeSimulatorProps & { onOpenOwnerLogin?: () => void }> = ({
  onOpenCard,
  onOpenAdmin,
  onOpenOwnerLogin
}) => {
  const [selectedCode, setSelectedCode] = useState('EVZ482731');
  const [customInput, setCustomInput] = useState('');
  const [isTapping, setIsTapping] = useState(false);

  const demoCards = [
    {
      code: 'EVZ482731',
      business: 'Royal Restaurant',
      category: 'North Indian & Fine Dining',
      theme: 'from-amber-600 via-yellow-700 to-amber-950',
      badge: 'Active & Assigned'
    },
    {
      code: 'EVZ105924',
      business: 'Sharma Hotel',
      category: 'Boutique Hotel & Executive Suites',
      theme: 'from-blue-700 via-indigo-800 to-slate-950',
      badge: 'Active & Assigned'
    },
    {
      code: 'EVZ731608',
      business: 'Urban Salon',
      category: 'Luxury Unisex Salon & Spa',
      theme: 'from-pink-600 via-rose-700 to-slate-950',
      badge: 'Active & Assigned'
    },
    {
      code: 'EVZ904215',
      business: 'Unassigned Inventory',
      category: 'Ready to configure',
      theme: 'from-slate-700 via-slate-800 to-slate-900',
      badge: 'Available (Unassigned)'
    }
  ];

  const activeCardInfo = demoCards.find((c) => c.code === selectedCode) || {
    code: selectedCode,
    business: 'Custom Card Code',
    category: 'Dynamic NFC Card',
    theme: 'from-emerald-700 via-teal-800 to-slate-950',
    badge: 'Live Lookup'
  };

  const handleSimulateTap = () => {
    setIsTapping(true);
    setTimeout(() => {
      setIsTapping(false);
      onOpenCard(selectedCode);
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      const code = customInput.trim().toUpperCase();
      setSelectedCode(code);
      onOpenCard(code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Banner Navigation */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              E
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                EVERZIO
              </span>
              <span className="text-xs text-emerald-400 ml-2 font-mono">
                everzio.in
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOwnerLogin && (
              <button
                onClick={onOpenOwnerLogin}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition border border-white/10"
              >
                <span>Owner Menu Portal</span>
              </button>
            )}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Simulation Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Concept & Description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Phase 1 Architecture Ready
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Physical NFC Cards with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Permanent Stable URLs
              </span>
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              Everzio provides contactless NFC cards and high-contrast QR cards for restaurants, hotels, salons, and modern businesses.
            </p>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <Radio className="w-4 h-4 text-emerald-400" /> The Core Everzio Principle:
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                The NFC chip stores only one stable URL (<code className="text-emerald-400 font-mono">https://everzio.in/c/EVZ00001</code>). If the owner changes their WhatsApp, Instagram, or phone in the admin panel, the physical card and QR code NEVER need to be changed!
              </p>
            </div>

            {/* Quick Demo Selector */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Select a physical test card:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {demoCards.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCode(c.code)}
                    className={`p-2.5 rounded-xl text-left border transition text-xs ${
                      selectedCode === c.code
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-mono font-bold">{c.code}</div>
                    <div className="truncate text-[11px] text-slate-400">{c.business}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Code Input */}
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
                placeholder="Or test custom code (e.g. EVZ00001)"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Go
              </button>
            </form>
          </div>

          {/* Right Column: Realistic 3D-feel Physical Card Mockup & Tap Button */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* The Physical NFC Card */}
            <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-3xl p-6 shadow-2xl overflow-hidden border border-white/10 transition-all duration-300 bg-gradient-to-br from-slate-900 via-neutral-900 to-black">
              {/* Subtle background texture */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${activeCardInfo.theme} opacity-30`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

              {/* Card Header: Contactless symbol & Everzio branding */}
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                    EVZ
                  </div>
                  <span className="font-black text-sm tracking-widest text-white">
                    EVERZIO
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-white/70">
                  <Wifi className="w-5 h-5 rotate-90" />
                  <span className="text-[10px] font-mono tracking-widest uppercase">NFC</span>
                </div>
              </div>

              {/* Card Body: Chip + Business Details */}
              <div className="relative z-10 space-y-1 mb-6">
                <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-300 shadow-inner mb-3 flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-600/50 rounded-sm" />
                </div>
                <div className="font-black text-lg text-white tracking-tight truncate">
                  {activeCardInfo.business}
                </div>
                <div className="text-xs text-white/70 truncate">
                  {activeCardInfo.category}
                </div>
              </div>

              {/* Card Footer: Stable Code & URL */}
              <div className="relative z-10 flex items-end justify-between pt-3 border-t border-white/10">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/50 block font-semibold">
                    Physical Card ID
                  </span>
                  <span className="font-mono font-extrabold text-sm text-emerald-400 tracking-wider">
                    {activeCardInfo.code}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 block font-semibold">
                    Encoded NDEF URI
                  </span>
                  <span className="text-[11px] font-mono text-white/80">
                    everzio.in/c/{activeCardInfo.code}
                  </span>
                </div>
              </div>

              {/* Tap Ripple Animation Overlay when tapping */}
              {isTapping && (
                <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center backdrop-blur-xs animate-ping rounded-3xl" />
              )}
            </div>

            {/* Tap & Scan Interaction Controls */}
            <div className="mt-6 w-full max-w-sm space-y-3">
              <button
                type="button"
                onClick={handleSimulateTap}
                disabled={isTapping}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 active:scale-[0.98]"
              >
                <Smartphone className="w-5 h-5 text-slate-950" />
                <span>{isTapping ? 'Reading NFC Chip...' : `Tap NFC Card (${selectedCode})`}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`/c/${selectedCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition border border-slate-800 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open URL in New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition border border-slate-800 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Platform Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
        <p>
          EVERZIO Digital NFC & QR Platform • Phase 1 Core Production Foundation • Domain: everzio.in
        </p>
      </footer>
    </div>
  );
};

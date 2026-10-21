import React, { useEffect, useState } from 'react';
import { api } from '../api';
import {
  UtensilsCrossed,
  ArrowLeft,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Wifi,
  Phone,
  MessageCircle,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export const RupeeIcon = ({ className = "w-3.5 h-3.5 inline-block" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 4h12M6 9h12M6 14l8.5 7M6 14h3a5 5 0 0 0 0-10" />
  </svg>
);

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  display_order: number;
  visible: boolean;
  available: boolean;
  tags?: string[];
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
}

interface MenuData {
  customer: {
    id: string;
    slug: string;
    business_name: string;
    business_category: string;
    logo_url?: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    wifi_ssid?: string;
    wifi_password?: string;
    wifi_enabled?: boolean;
  };
  menu: {
    categories: MenuCategory[];
    items: MenuItem[];
    updated_at: string;
  };
}

interface PublicDigitalMenuProps {
  slug: string;
  onBack?: () => void;
}

export const PublicDigitalMenu: React.FC<PublicDigitalMenuProps> = ({ slug, onBack }) => {
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getPublicMenu(slug)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Menu not found.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleCopyWifi = () => {
    if (data?.customer?.wifi_password) {
      navigator.clipboard.writeText(data.customer.wifi_password);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-neutral-400 text-sm font-medium">Loading Digital Menu...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-neutral-400 shadow-xl">
            <UtensilsCrossed className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Digital Menu Not Found</h2>
          <p className="text-sm text-neutral-400 mb-6">
            {error || 'This business has not published a digital menu yet.'}
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Business Profile</span>
            </button>
          )}
        </div>
        <footer className="text-center py-6 border-t border-neutral-900">
          <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            POWERED BY <span className="font-extrabold text-neutral-300 tracking-widest">EVERZIO</span>
          </p>
        </footer>
      </div>
    );
  }

  const { customer, menu } = data;
  const categories = menu.categories || [];
  const items = (menu.items || []).filter((i) => i.visible !== false);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategoryId === 'all' || item.category_id === activeCategoryId;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Business Card</span>
            </button>
          ) : (
            <div className="text-xs font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>EVERZIO MENU</span>
            </div>
          )}

          {customer.wifi_enabled && customer.wifi_ssid && (
            <button
              onClick={() => setShowWifiModal(true)}
              className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 px-2.5 py-1.5 rounded-lg bg-teal-950/40 border border-teal-800/40 transition"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Wi-Fi</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Menu Body */}
      <main className="w-full max-w-md mx-auto px-4 pt-4 pb-12 flex-1">
        {/* Business Hero Banner */}
        <div className="text-center pb-5 pt-2 border-b border-white/5 mb-4">
          {customer.logo_url && (
            <img
              src={customer.logo_url}
              alt={customer.business_name}
              className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 shadow-xl border border-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
            {customer.business_name}
          </h1>
          {customer.business_category && (
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mt-1">
              {customer.business_category}
            </p>
          )}
          {customer.description && (
            <p className="text-xs text-neutral-300 max-w-xs mx-auto mt-2 leading-relaxed">
              {customer.description}
            </p>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food items, starters, drinks..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Categories Horizontal Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              activeCategoryId === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const active = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-neutral-900/40 border border-white/5">
              <UtensilsCrossed className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No items match your search</p>
              <p className="text-xs text-neutral-500 mt-1">Try searching for a different item name</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-neutral-900/70 border border-white/5 hover:border-white/10 transition flex gap-3.5 items-start ${
                  !item.available ? 'opacity-60' : ''
                }`}
              >
                {/* Item Image if present */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {item.name}
                    </h3>
                    <div className="text-base font-black text-emerald-400 shrink-0 flex items-center gap-0.5">
                      <RupeeIcon className="w-3.5 h-3.5" />
                      <span>{item.price}</span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Tags and Availability */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {item.tags?.map((tag) => {
                      const isVeg = tag.toLowerCase() === 'veg';
                      const isBestseller = tag.toLowerCase() === 'bestseller';
                      return (
                        <span
                          key={tag}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isVeg
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : isBestseller
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                              : 'bg-neutral-800 text-neutral-300 border border-white/5'
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}

                    {!item.available && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-400 border border-rose-800/40">
                        Currently Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Wi-Fi Credentials Modal */}
      {showWifiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-4">
              <Wifi className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Guest Wi-Fi Details</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Connect to our high-speed guest network during your visit.
            </p>

            <div className="space-y-3 bg-neutral-950 rounded-2xl p-4 border border-white/5 text-left mb-6">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                  Network SSID
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {customer.wifi_ssid || 'Guest_WiFi'}
                </span>
              </div>

              {customer.wifi_password && (
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                    Password
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {customer.wifi_password}
                    </span>
                    <button
                      onClick={handleCopyWifi}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1 transition"
                    >
                      {copiedWifi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowWifiModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-6 px-4 border-t border-neutral-900">
        <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          POWERED BY <span className="font-extrabold text-neutral-200 tracking-widest">EVERZIO</span>
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">
          Dynamic NFC Tap & QR Digital Business Menus
        </p>
      </footer>
    </div>
  );
};

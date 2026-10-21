import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PublicCardResponse, ActionLinkItem } from '../types';
import {
  MessageCircle,
  Phone,
  Star,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  CreditCard,
  CheckCircle2,
  Share2,
  Check,
  UtensilsCrossed,
  Wifi,
  Copy
} from 'lucide-react';

interface PublicBusinessCardProps {
  cardCode: string;
  onNavigateMenu?: (slug: string) => void;
}

export const PublicBusinessCard: React.FC<PublicBusinessCardProps> = ({
  cardCode,
  onNavigateMenu
}) => {
  const [data, setData] = useState<PublicCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .getPublicCard(cardCode)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData({
            accessible: false,
            reason: 'NOT_FOUND',
            message: 'Card not found.'
          });
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardCode]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.customer?.business_name || 'Business Card',
          url
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyWifi = () => {
    if (data?.customer?.wifi_password) {
      navigator.clipboard.writeText(data.customer.wifi_password);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  const renderIcon = (type: ActionLinkItem['type']) => {
    switch (type) {
      case 'view_menu':
        return <UtensilsCrossed className="w-5 h-5 text-white shrink-0" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-white shrink-0" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-white shrink-0" />;
      case 'call':
        return <Phone className="w-5 h-5 text-white shrink-0" />;
      case 'google_review':
        return <Star className="w-5 h-5 text-white fill-white shrink-0" />;
      case 'google_maps':
        return <MapPin className="w-5 h-5 text-white shrink-0" />;
      case 'website':
        return <Globe className="w-5 h-5 text-white shrink-0" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-white shrink-0" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-white shrink-0" />;
      default:
        return <ExternalLink className="w-5 h-5 text-white shrink-0" />;
    }
  };

  const getButtonClass = (type: ActionLinkItem['type']) => {
    switch (type) {
      case 'view_menu':
        return 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-400 hover:to-teal-600 text-white shadow-xl shadow-emerald-950/40 ring-2 ring-emerald-400/40 py-4.5';
      case 'wifi':
        return 'bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-500 hover:to-teal-600 text-white shadow-teal-950/20';
      case 'whatsapp':
        return 'bg-[#25D366] hover:bg-[#20ba59] text-white shadow-emerald-950/20';
      case 'call':
        return 'bg-[#0070F3] hover:bg-[#005cd2] text-white shadow-blue-950/20';
      case 'google_review':
        return 'bg-[#F4B400] hover:bg-[#e0a400] text-slate-950 shadow-amber-950/20 font-bold';
      case 'google_maps':
        return 'bg-[#EA4335] hover:bg-[#d63224] text-white shadow-red-950/20';
      case 'website':
        return 'bg-slate-900 hover:bg-slate-800 text-white border border-white/10 shadow-slate-950/20';
      case 'instagram':
        return 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white shadow-pink-950/20';
      case 'facebook':
        return 'bg-[#1877F2] hover:bg-[#1265cf] text-white shadow-blue-950/20';
      default:
        return 'bg-slate-800 hover:bg-slate-700 text-white';
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-neutral-400 text-sm font-medium">Loading...</p>
      </div>
    );
  }

  // 2. Error / Notice States
  if (!data?.accessible) {
    let messageText = 'Card not found.';
    let IconComponent = HelpCircle;

    if (data?.reason === 'NOT_FOUND') {
      messageText = 'Card not found.';
      IconComponent = HelpCircle;
    } else if (data?.reason === 'NOT_ASSIGNED') {
      messageText = 'This card has not been assigned yet.';
      IconComponent = CreditCard;
    } else if (data?.reason === 'CARD_INACTIVE') {
      messageText = 'This Everzio card is currently inactive.';
      IconComponent = AlertCircle;
    } else if (data?.reason === 'CUSTOMER_INACTIVE') {
      messageText = 'This Everzio card is currently inactive.';
      IconComponent = AlertCircle;
    }

    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-neutral-400 shadow-xl">
            <IconComponent className="w-8 h-8" />
          </div>

          <p className="text-lg text-neutral-200 font-semibold leading-relaxed">
            {messageText}
          </p>
        </div>

        {/* Subtle Everzio Footer */}
        <footer className="text-center py-6 border-t border-neutral-900">
          <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            POWERED BY <span className="font-extrabold text-neutral-200 tracking-widest">EVERZIO</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            Dynamic NFC Tap & QR Business Cards
          </p>
        </footer>
      </div>
    );
  }

  // 3. Active Public Business Landing Page
  const customer = data.customer!;
  const actionLinks = data.actionLinks || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with Discreet Share Action */}
      <div className="w-full max-w-md mx-auto px-5 pt-4 pb-2 flex justify-end items-center">
        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition border border-white/5 shadow-sm"
          title="Share Card"
          aria-label="Share this business card"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Business Profile & Action Buttons */}
      <main className="w-full max-w-md mx-auto px-5 pb-8 flex-1 flex flex-col justify-start">
        {/* Business Branding */}
        <div className="text-center pt-2 pb-6">
          {/* Business Logo */}
          <div className="relative inline-block mb-4">
            {customer.logo_url ? (
              <img
                src={customer.logo_url}
                alt={customer.business_name}
                className="w-24 h-24 rounded-3xl object-cover mx-auto shadow-2xl border-2 border-white/10 ring-4 ring-white/5"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl border-2 border-white/10 ring-4 ring-white/5 mx-auto">
                {customer.business_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-neutral-950 flex items-center justify-center text-white shadow-md">
              <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
            </div>
          </div>

          {/* Business Name */}
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight mb-1 px-2">
            {customer.business_name}
          </h1>

          {/* Business Category */}
          {customer.business_category && (
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-semibold tracking-wide uppercase mb-3">
              {customer.business_category}
            </div>
          )}

          {/* Short Description */}
          {customer.description && (
            <p className="text-sm text-neutral-300 max-w-xs mx-auto leading-relaxed px-2 font-normal">
              {customer.description}
            </p>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="space-y-3 pt-2">
          {actionLinks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 text-center text-neutral-400 text-sm">
              No contact links available.
            </div>
          ) : (
            actionLinks.map((link) => {
              const buttonStyle = getButtonClass(link.type);

              const handleClick = (e: React.MouseEvent) => {
                if (link.type === 'view_menu') {
                  e.preventDefault();
                  const targetSlug = customer.slug || 'menu';
                  if (onNavigateMenu) {
                    onNavigateMenu(targetSlug);
                  } else {
                    window.history.pushState({}, '', `/menu/${targetSlug}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                  return;
                }

                if (link.type === 'wifi') {
                  e.preventDefault();
                  setShowWifiModal(true);
                  return;
                }
              };

              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={handleClick}
                  target={link.type === 'call' || link.type === 'view_menu' || link.type === 'wifi' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className={`group relative flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-150 active:scale-[0.98] shadow-lg cursor-pointer ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                      {renderIcon(link.type)}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-bold text-base leading-snug tracking-tight">
                        {link.label}
                      </div>
                      {link.sublabel && (
                        <div className="text-xs opacity-90 font-medium truncate max-w-[220px]">
                          {link.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                    <ExternalLink className="w-4 h-4 opacity-80" />
                  </div>
                </a>
              );
            })
          )}
        </div>
      </main>

      {/* Guest Wi-Fi Modal */}
      {showWifiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-4">
              <Wifi className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Guest Wi-Fi Details</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Connect to our complimentary guest network.
            </p>

            <div className="space-y-3 bg-neutral-950 rounded-2xl p-4 border border-white/5 text-left mb-6">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                  Network SSID
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {customer.wifi_ssid || 'Everzio_Guest'}
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

      {/* Powered by EVERZIO Subtle Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-6 px-4 border-t border-neutral-900">
        <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          POWERED BY <span className="font-extrabold text-neutral-200 tracking-widest">EVERZIO</span>
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">
          Dynamic NFC Tap & QR Business Cards
        </p>
      </footer>
    </div>
  );
};

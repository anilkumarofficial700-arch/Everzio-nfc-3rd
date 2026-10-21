import React from 'react';
import { DashboardStats, Customer, Card } from '../types';
import {
  Users,
  CreditCard,
  CheckCircle2,
  Box,
  Plus,
  ArrowRight,
  ExternalLink,
  Smartphone,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  stats: DashboardStats;
  customers: Customer[];
  cards: Card[];
  onOpenNewCustomer: () => void;
  onOpenNewCard: () => void;
  onSelectTab: (tab: 'dashboard' | 'customers' | 'cards' | 'settings') => void;
  onViewQr: (card: Card) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  customers,
  cards,
  onOpenNewCustomer,
  onOpenNewCard,
  onSelectTab,
  onViewQr
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 text-white border border-slate-700/60 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> EVERZIO NFC Platform — Phase 1 Active
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            Dynamic NFC & QR Fleet Control
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Everzio physical NFC cards encode one permanent URL that never expires. Update customer WhatsApp numbers, reviews, and links anytime in real-time without re-programming physical cards.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewCustomer}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Add Business
            </button>
            <button
              onClick={onOpenNewCard}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 border border-slate-600"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" /> Issue NFC Card
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Required Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div
          onClick={() => onSelectTab('customers')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalCustomers}
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-2">
            <span>Manage business accounts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Total Cards */}
        <div
          onClick={() => onSelectTab('cards')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Cards
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalCards}
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-600 font-medium mt-2">
            <span>All generated EVZ codes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Active Cards */}
        <div
          onClick={() => onSelectTab('cards')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Cards
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            {stats.activeCards}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <span>Live & serving taps</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Available Cards */}
        <div
          onClick={() => onSelectTab('cards')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Cards
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 tracking-tight">
            {stats.availableCards}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-2">
            <span>Unassigned inventory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-600" /> Everzio NFC Flow: Physical Hardware → Cloud Database
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto mb-2">
              1
            </div>
            <div className="font-semibold text-xs text-slate-800">Physical NFC Tap / QR</div>
            <p className="text-[11px] text-slate-500 mt-1">Customer taps NFC card or scans printed QR</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto mb-2">
              2
            </div>
            <div className="font-semibold text-xs text-slate-800">Permanent URL</div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">everzio.in/c/EVZ00001</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto mb-2">
              3
            </div>
            <div className="font-semibold text-xs text-slate-800">Database Lookup</div>
            <p className="text-[11px] text-slate-500 mt-1">Fetches latest assigned customer & links</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto mb-2">
              4
            </div>
            <div className="font-semibold text-xs text-slate-800">Dynamic Business Page</div>
            <p className="text-[11px] text-slate-500 mt-1">WhatsApp, Call, Reviews, Maps directly fire</p>
          </div>
        </div>
      </div>

      {/* Quick Access Grid: Recent Customers & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Customers</h3>
            <button
              onClick={() => onSelectTab('customers')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all ({customers.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customers.slice(0, 4).map((cust) => (
              <div key={cust.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {cust.logo_url ? (
                    <img
                      src={cust.logo_url}
                      alt={cust.business_name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {cust.business_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">
                      {cust.business_name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {cust.business_category || 'Business'} • {cust.owner_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      cust.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cust.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">NFC Cards</h3>
            <button
              onClick={() => onSelectTab('cards')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all ({cards.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {cards.slice(0, 4).map((card) => (
              <div key={card.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    NFC
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-900">
                      {card.card_code}
                    </div>
                    <div className="text-xs text-slate-500">
                      {card.customer_name || 'Unassigned (Available)'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewQr(card)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <a
                    href={`/c/${card.card_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    title="Open public page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

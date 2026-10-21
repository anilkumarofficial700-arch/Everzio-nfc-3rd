import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Customer,
  Card,
  DashboardStats,
  CardStatus,
  CustomerStatus
} from '../types';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminCustomers } from './AdminCustomers';
import { AdminCards } from './AdminCards';
import { AdminSettings } from './AdminSettings';
import { AdminMenus } from './AdminMenus';
import { AdminSubscriptions } from './AdminSubscriptions';
import { AdminAnalytics } from './AdminAnalytics';
import { CustomerModal } from './CustomerModal';
import { CardModal } from './CardModal';
import { QrCodeModal } from './QrCodeModal';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Smartphone,
  CheckCircle,
  AlertCircle,
  UtensilsCrossed,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface AdminViewProps {
  onNavigateHome: () => void;
  onNavigateCard: (cardCode: string) => void;
  onNavigateOwnerLogin?: () => void;
  onNavigateMenu?: (slug: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onNavigateHome,
  onNavigateCard,
  onNavigateOwnerLogin,
  onNavigateMenu
}) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'customers' | 'cards' | 'menus' | 'subscriptions' | 'analytics' | 'settings'
  >('dashboard');

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCards: 0,
    activeCards: 0,
    availableCards: 0,
    totalMenus: 0,
    activeSubscriptions: 0
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [baseDomain, setBaseDomain] = useState<string>('https://everzio.in');
  const [loading, setLoading] = useState(true);

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const [selectedQrCard, setSelectedQrCard] = useState<Card | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initial authentication check
  useEffect(() => {
    api
      .getMe()
      .then((res) => {
        setAuthenticated(res.authenticated);
        if (res.authenticated) {
          loadAllData();
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
      });
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [s, custs, crds, sett] = await Promise.all([
        api.getStats(),
        api.getCustomers(),
        api.getCards(),
        api.getSettings()
      ]);
      setStats(s);
      setCustomers(custs);
      setCards(crds);
      setBaseDomain(sett.baseDomain);
    } catch (err: any) {
      showToast(err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setAuthenticated(false);
  };

  // Customer Actions
  const handleSaveCustomer = async (data: Partial<Customer>) => {
    if (editingCustomer) {
      await api.updateCustomer(editingCustomer.id, data);
      showToast(`Updated "${data.business_name || editingCustomer.business_name}"`);
    } else {
      await api.createCustomer(data);
      showToast(`Created new business "${data.business_name}"`);
    }
    await loadAllData();
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? Any assigned cards will become AVAILABLE.`)) {
      try {
        await api.deleteCustomer(id);
        showToast(`Deleted "${name}"`);
        await loadAllData();
      } catch (err: any) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  const handleToggleCustomerStatus = async (id: string, newStatus: CustomerStatus) => {
    try {
      await api.setCustomerStatus(id, newStatus);
      showToast(`Customer status changed to ${newStatus}`);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  // Card Actions
  const handleSaveNewCard = async (customCode?: string, customerId?: string | null) => {
    const card = await api.createCard(customCode, customerId);
    showToast(`Created NFC Card: ${card.card_code}`);
    await loadAllData();
  };

  const handleAssignCard = async (cardId: string, customerId: string | null) => {
    await api.assignCard(cardId, customerId);
    showToast(`Card assignment updated`);
    await loadAllData();
  };

  const handleCardStatusChange = async (cardId: string, status: CardStatus) => {
    await api.setCardStatus(cardId, status);
    showToast(`Card status updated to ${status}`);
    await loadAllData();
  };

  const handleToggleCardStatus = async (cardId: string, currentStatus: CardStatus) => {
    const nextStatus: CardStatus =
      currentStatus === 'ACTIVE'
        ? 'INACTIVE'
        : currentStatus === 'INACTIVE'
        ? 'ACTIVE'
        : 'ACTIVE';
    await handleCardStatusChange(cardId, nextStatus);
  };

  const handleUnassignCard = async (cardId: string) => {
    await api.assignCard(cardId, null);
    showToast('Card unassigned from customer');
    await loadAllData();
  };

  const handleDeleteCard = async (id: string, code: string) => {
    if (window.confirm(`Delete card ${code}? This cannot be undone.`)) {
      try {
        await api.deleteCard(id);
        showToast(`Deleted card ${code}`);
        await loadAllData();
      } catch (err: any) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  // Settings Actions
  const handleUpdateBaseDomain = async (newDomain: string) => {
    const res = await api.updateSettings({ baseDomain: newDomain });
    setBaseDomain(res.baseDomain);
    showToast('Base domain updated');
    await loadAllData();
  };

  const handleResetDemo = async () => {
    await api.resetDemoData();
    showToast('Database reset to fictional demo data');
    await loadAllData();
  };

  if (authenticated === null || (authenticated && loading && customers.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading Everzio Console...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setAuthenticated(true);
          loadAllData();
        }}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-in text-white ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900 border border-slate-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
              E
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                EVERZIO <span className="text-emerald-400 font-semibold text-sm">ADMIN</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                Phase 1
              </span>
            </div>
          </div>

          {/* Quick links & Sign out */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onNavigateOwnerLogin && (
              <button
                onClick={onNavigateOwnerLogin}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 transition flex items-center gap-1.5 border border-emerald-800/40"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Owner Menu Portal</span>
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Open NFC Simulator</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-300 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-slate-800/80 transition flex items-center gap-1.5 border border-slate-700/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'dashboard'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'customers'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'cards'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menus')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'menus'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Digital Menus</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'subscriptions'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Subscriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'analytics'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'settings'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            customers={customers}
            cards={cards}
            onOpenNewCustomer={() => {
              setEditingCustomer(null);
              setCustomerModalOpen(true);
            }}
            onOpenNewCard={() => {
              setEditingCard(null);
              setCardModalOpen(true);
            }}
            onSelectTab={setActiveTab}
            onViewQr={(card) => setSelectedQrCard(card)}
          />
        )}

        {activeTab === 'customers' && (
          <AdminCustomers
            customers={customers}
            cards={cards}
            onAddCustomer={() => {
              setEditingCustomer(null);
              setCustomerModalOpen(true);
            }}
            onEditCustomer={(cust) => {
              setEditingCustomer(cust);
              setCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onToggleStatus={handleToggleCustomerStatus}
            onViewQr={(card) => setSelectedQrCard(card)}
          />
        )}

        {activeTab === 'cards' && (
          <AdminCards
            cards={cards}
            customers={customers}
            onOpenNewCard={() => {
              setEditingCard(null);
              setCardModalOpen(true);
            }}
            onEditCard={(c) => {
              setEditingCard(c);
              setCardModalOpen(true);
            }}
            onViewQr={(c) => setSelectedQrCard(c)}
            onDeleteCard={handleDeleteCard}
            onToggleStatus={handleToggleCardStatus}
            onUnassign={handleUnassignCard}
          />
        )}

        {activeTab === 'menus' && (
          <AdminMenus
            onPreviewMenu={(slug) => {
              if (onNavigateMenu) {
                onNavigateMenu(slug);
              } else {
                window.history.pushState({}, '', `/menu/${slug}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          />
        )}

        {activeTab === 'subscriptions' && <AdminSubscriptions />}

        {activeTab === 'analytics' && <AdminAnalytics />}

        {activeTab === 'settings' && (
          <AdminSettings
            baseDomain={baseDomain}
            onUpdateBaseDomain={handleUpdateBaseDomain}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Modals */}
      <CustomerModal
        customer={editingCustomer}
        isOpen={customerModalOpen}
        onClose={() => {
          setCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />

      <CardModal
        card={editingCard}
        customers={customers}
        isOpen={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setEditingCard(null);
        }}
        onSaveNew={handleSaveNewCard}
        onAssign={handleAssignCard}
        onStatusChange={handleCardStatusChange}
      />

      <QrCodeModal
        card={selectedQrCard}
        onClose={() => setSelectedQrCard(null)}
      />
    </div>
  );
};

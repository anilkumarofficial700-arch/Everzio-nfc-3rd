import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  UtensilsCrossed,
  Plus,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  ArrowLeft,
  Tag,
  AlertCircle
} from 'lucide-react';

const RupeeIcon = ({ className = "w-4 h-4 inline-block" }: { className?: string }) => (
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

interface OwnerMenuDashboardProps {
  onNavigateHome: () => void;
  onNavigateMenu: (slug: string) => void;
}

export const OwnerMenuDashboard: React.FC<OwnerMenuDashboardProps> = ({
  onNavigateHome,
  onNavigateMenu
}) => {
  const [authChecking, setAuthChecking] = useState(true);
  const [customer, setCustomer] = useState<any | null>(null);
  const [menu, setMenu] = useState<any | null>(null);

  // Login form state
  const [emailInput, setEmailInput] = useState('royal@everzio.in');
  const [passwordInput, setPasswordInput] = useState('EverzioOwner@2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Editor state
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Item / Category modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: 250,
    tags: 'Veg',
    available: true,
    visible: true
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    checkOwnerAuth();
  }, []);

  const checkOwnerAuth = async () => {
    setAuthChecking(true);
    try {
      const res = await api.getOwnerMe();
      if (res.authenticated && res.customer) {
        setCustomer(res.customer);
        await loadOwnerMenu();
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const loadOwnerMenu = async () => {
    try {
      const res = await api.getOwnerMenu();
      setCustomer(res.customer);
      setMenu(res.menu);
      const activeVersion = res.menu?.pending_version || res.menu?.published_version || { categories: [], items: [] };
      setCategories(activeVersion.categories || []);
      setItems(activeVersion.items || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await api.ownerLogin(emailInput, passwordInput);
      setCustomer(res.customer);
      await loadOwnerMenu();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.ownerLogout();
    setCustomer(null);
    setMenu(null);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setFeedbackMsg(null);
    try {
      await api.saveOwnerMenuDraft(categories, items);
      setFeedbackMsg({ type: 'success', text: 'Draft changes saved successfully.' });
      await loadOwnerMenu();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setFeedbackMsg(null);
    try {
      // First save draft state
      await api.saveOwnerMenuDraft(categories, items);
      // Then publish with subscription enforcement
      const res = await api.publishOwnerMenu();
      setFeedbackMsg({ type: 'success', text: res.message || 'Menu published successfully to live URL!' });
      await loadOwnerMenu();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Publishing blocked. Active subscription required.'
      });
      await loadOwnerMenu();
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return;

    const tagsArray = itemForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                ...itemForm,
                price: Number(itemForm.price) || 0,
                tags: tagsArray
              }
            : i
        )
      );
    } else {
      const newItem = {
        id: `item_${Date.now()}`,
        category_id: itemForm.category_id || categories[0]?.id || 'cat_general',
        name: itemForm.name.trim(),
        description: itemForm.description.trim(),
        price: Number(itemForm.price) || 0,
        display_order: items.length + 1,
        visible: itemForm.visible,
        available: itemForm.available,
        tags: tagsArray
      };
      setItems((prev) => [...prev, newItem]);
    }

    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      display_order: categories.length + 1
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCatName('');
    setShowCatModal(false);
  };

  const toggleItemAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, available: !i.available } : i))
    );
  };

  const toggleItemVisibility = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, visible: !i.visible } : i))
    );
  };

  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm font-medium">Authenticating owner portal...</p>
      </div>
    );
  }

  // View 1: Owner Login Screen
  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
        <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Everzio Home</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400">Owner Portal</span>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto w-full px-5 py-12 flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Business Menu Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Log in to edit your digital food menu, categories, and item availability.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-4"
          >
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Owner Email or Business Slug
              </label>
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. royal@everzio.in or royal-restaurant"
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Log In to Menu Dashboard</span>
                </>
              )}
            </button>

            {/* Quick Demo Credentials Switcher */}
            <div className="pt-4 border-t border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Quick-test credentials:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('royal@everzio.in');
                    setPasswordInput('EverzioOwner@2026!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-400 border border-white/5 transition"
                >
                  Royal Restaurant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('sharma@everzio.in');
                    setPasswordInput('EverzioOwner@2026!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-400 border border-white/5 transition"
                >
                  Sharma Hotel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('urban@everzio.in');
                    setPasswordInput('EverzioOwner@2026!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-pink-400 border border-white/5 transition"
                >
                  Urban Salon
                </button>
              </div>
            </div>
          </form>
        </main>

        <footer className="text-center py-6 border-t border-white/5">
          <p className="text-xs text-slate-400">
            EVERZIO NFC & QR Platform — Business Owner Portal
          </p>
        </footer>
      </div>
    );
  }

  // View 2: Logged-in Owner Menu Dashboard
  const isSubscriptionActive = customer.subscription_status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">
                  {customer.business_name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isSubscriptionActive
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {customer.subscription_status}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Menu Management Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateMenu(customer.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Preview Live Menu</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-xs font-semibold text-slate-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Subscription Status Banner */}
        <div
          className={`p-4 rounded-2xl border mb-6 flex items-start justify-between gap-4 ${
            isSubscriptionActive
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {isSubscriptionActive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold">
                {isSubscriptionActive
                  ? 'Active EVERZIO Subscription'
                  : 'Subscription Expired / Inactive'}
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                {isSubscriptionActive
                  ? 'Your subscription is verified. Submitting updates will immediately publish changes to your live public digital menu.'
                  : 'Subscription has expired. Renew your active plan to publish digital menu updates.'}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono shrink-0 font-semibold opacity-75">
            Status: {customer.subscription_status}
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 text-sm ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/70 border-rose-800 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs & Top Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'editor'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Menu Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Update History ({menu?.update_history?.length || 0})
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-white/10 transition"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              {publishing ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish to Live Menu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Menu Editor */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Categories Bar */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Menu Categories</h3>
                <p className="text-xs text-slate-400">
                  Organize your food & beverages into distinct sections.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/5 text-xs font-semibold text-slate-200"
                  >
                    {cat.name}
                  </span>
                ))}
                <button
                  onClick={() => setShowCatModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Items Header */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-lg font-black text-white">Items Catalog</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({
                    name: '',
                    category_id: categories[0]?.id || '',
                    description: '',
                    price: 250,
                    tags: 'Veg',
                    available: true,
                    visible: true
                  });
                  setShowItemModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </div>

            {/* Items Table/Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => {
                const category = categories.find((c) => c.id === item.category_id);
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-base font-bold text-white leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                            {category?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <div className="text-lg font-black text-emerald-400 flex items-center gap-0.5">
                          <RupeeIcon className="w-4 h-4" />
                          <span>{item.price}</span>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {item.tags?.map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            item.available
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {item.available ? 'In Stock' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => toggleItemVisibility(item.id)}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title={item.visible ? 'Hide from menu' : 'Make visible'}
                        >
                          {item.visible ? (
                            <Eye className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setItemForm({
                              name: item.name,
                              category_id: item.category_id,
                              description: item.description || '',
                              price: item.price,
                              tags: (item.tags || []).join(', '),
                              available: item.available,
                              visible: item.visible
                            });
                            setShowItemModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white transition"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Update History */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10">
            <h3 className="text-base font-bold text-white mb-4">
              Publication & Audit Log
            </h3>
            <div className="space-y-3">
              {(menu?.update_history || []).map((hist: any) => (
                <div
                  key={hist.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-white/5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        hist.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {hist.status}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {hist.notes || 'Menu update recorded'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        By {hist.updated_by}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {new Date(hist.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add Category */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-slate-900 border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Add Menu Category</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Sizzlers & Grills"
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add / Edit Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveItem}
            className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8"
          >
            <h3 className="text-lg font-bold text-white">
              {editingItem ? 'Edit Food Item' : 'Add New Item'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="e.g. Butter Garlic Prawns"
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Ingredients, preparation, flavor notes..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={itemForm.tags}
                onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                placeholder="e.g. Veg, Bestseller, Chef Special"
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={itemForm.available}
                  onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-950 border-white/20"
                />
                <span>In Stock</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={itemForm.visible}
                  onChange={(e) => setItemForm({ ...itemForm, visible: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-950 border-white/20"
                />
                <span>Visible on Menu</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 border-t border-white/5">
        <p className="text-xs text-slate-400">
          POWERED BY <span className="font-extrabold text-white">EVERZIO</span> — Dynamic NFC & Digital Menus
        </p>
      </footer>
    </div>
  );
};

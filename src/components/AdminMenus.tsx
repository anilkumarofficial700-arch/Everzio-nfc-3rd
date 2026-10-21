import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { UtensilsCrossed, ExternalLink, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminMenusProps {
  onPreviewMenu: (slug: string) => void;
}

export const AdminMenus: React.FC<AdminMenusProps> = ({ onPreviewMenu }) => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMenus();
      setMenus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = menus.filter(
    (m) =>
      m.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Digital Menus Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of all active digital menus across customer businesses.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business or menu slug..."
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading digital menus...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
          No menus found.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Business</th>
                  <th className="py-3.5 px-4">Menu URL Slug</th>
                  <th className="py-3.5 px-4">Categories</th>
                  <th className="py-3.5 px-4">Live Items</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((m) => {
                  const catCount = m.published_version?.categories?.length || 0;
                  const itemCount = m.published_version?.items?.length || 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{m.business_name}</div>
                        <div className="text-[11px] text-slate-400">{m.business_category}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-emerald-600 font-semibold">
                        /menu/{m.slug}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                          {catCount} categories
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                          {itemCount} active dishes
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            m.subscription_status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.subscription_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[11px] font-mono">
                        {new Date(m.updated_at || m.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => onPreviewMenu(m.slug)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

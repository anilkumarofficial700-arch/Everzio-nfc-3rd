import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { SubscriptionItem } from '../types';

export const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (item: SubscriptionItem) => {
    const nextStatus = item.subscription_status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE';
    setUpdatingId(item.id);
    try {
      await api.updateAdminSubscription(item.id, nextStatus);
      await loadSubscriptions();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Subscription & Licensing Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active subscriptions grant business owners the privilege to publish digital menu updates.
          </p>
        </div>
        <button
          onClick={loadSubscriptions}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading subscription data...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Business</th>
                  <th className="py-3.5 px-4">Owner Contact</th>
                  <th className="py-3.5 px-4">Hardware Cards</th>
                  <th className="py-3.5 px-4">Plan Status</th>
                  <th className="py-3.5 px-4">Renewal Date</th>
                  <th className="py-3.5 px-5 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {subscriptions.map((sub) => {
                  const isActive = sub.subscription_status === 'ACTIVE';
                  const isUpdating = updatingId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{sub.business_name}</div>
                        <div className="text-[11px] text-slate-400">{sub.business_category}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-900 font-semibold">{sub.owner_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{sub.owner_email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                          {sub.cardsCount} NFC Cards
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span>{sub.subscription_status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {sub.subscription_expires_at
                          ? new Date(sub.subscription_expires_at).toLocaleDateString()
                          : 'Ongoing'}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => toggleStatus(sub)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                            isActive
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isUpdating
                            ? 'Updating...'
                            : isActive
                            ? 'Expire Subscription'
                            : 'Activate Plan'}
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

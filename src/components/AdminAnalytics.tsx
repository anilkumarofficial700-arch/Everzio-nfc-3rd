import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Activity, Radio, UtensilsCrossed, Smartphone, Clock, RefreshCw } from 'lucide-react';
import { AnalyticsStats } from '../types';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await api.getAdminAnalytics();
      setData(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Platform Analytics Foundation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry tracking physical NFC taps, QR scans, and digital menu visits.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Activity Events
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.totalEvents || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Platform interactions recorded</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              NFC & QR Scans
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.scansCount || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Physical card lookups</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Digital Menu Views
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.menuViewsCount || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Customer menu sessions</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Profile Views
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.profileViewsCount || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct landing engagements</div>
        </div>
      </div>

      {/* Recent Event Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Telemetry Activity Stream</h3>
          <span className="text-xs text-slate-400 font-mono">Last 40 events</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading analytics log...</div>
        ) : !data?.recentEvents?.length ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No events logged yet. Tap an NFC card or open a digital menu to generate telemetry!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentEvents.map((evt) => (
              <div key={evt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    {evt.event_type === 'card_scan' ? (
                      <Radio className="w-4 h-4 text-teal-600" />
                    ) : evt.event_type === 'menu_view' ? (
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {evt.event_type.toUpperCase().replace(/_/g, ' ')}
                      {evt.card_code && (
                        <span className="ml-2 font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          {evt.card_code}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Business ID: {evt.business_id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

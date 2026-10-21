import React, { useState } from 'react';
import { api } from '../api';
import {
  Globe,
  Smartphone,
  RefreshCw,
  Shield,
  Save,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

interface AdminSettingsProps {
  baseDomain: string;
  onUpdateBaseDomain: (newDomain: string) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  baseDomain,
  onUpdateBaseDomain,
  onResetDemo
}) => {
  const [domain, setDomain] = useState(baseDomain);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onUpdateBaseDomain(domain);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      await onResetDemo();
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Domain Settings */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base">Public Brand Domain</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          All physical NFC chips and printed QR codes encode this base domain. In production this is <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono">https://everzio.in</code>.
        </p>

        <form onSubmit={handleSaveDomain} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="https://everzio.in"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : saving ? 'Saving...' : 'Update Domain'}
          </button>
        </form>
      </div>

      {/* NFC Hardware Architecture & Programming Specs */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">NFC Hardware Specifications (Phase 1)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Recommended Chips</span>
            <p className="text-slate-500">NXP NTAG213 (144 bytes) or NTAG215 (504 bytes). Both easily fit the 28-byte stable Everzio URL.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">NDEF Record Type</span>
            <p className="text-slate-500">Standard URI Record (0x01) with prefix https:// (0x04). Native on iOS 13+ and Android.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Writing App Workflow</span>
            <p className="text-slate-500">Open 'NFC Tools' → Write → Add Record → URL → paste <code className="font-mono text-emerald-700">https://everzio.in/c/EVZ00001</code> → Write.</p>
          </div>
        </div>
      </div>

      {/* Demo Data Reset */}
      <div className="p-6 bg-white rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-rose-700">
          <RefreshCw className="w-5 h-5" />
          <h3 className="font-bold text-base">Reset Demo Data</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Restores the 3 fictional businesses (Royal Restaurant, Sharma Hotel, Urban Salon) and default NFC cards (EVZ00001, EVZ00002, EVZ00003, EVZ00004).
        </p>

        {showResetConfirm ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Are you sure? This will reset all customer links and card assignments to default values.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Everything'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
          >
            Reset Database to Demo Seed
          </button>
        )}
      </div>
    </div>
  );
};

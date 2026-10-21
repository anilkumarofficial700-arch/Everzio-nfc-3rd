import React, { useState, useEffect } from 'react';
import { Card, Customer, CardStatus } from '../types';
import { X, CreditCard, UserCheck, Shield } from 'lucide-react';

interface CardModalProps {
  card: Card | null;
  customers: Customer[];
  isOpen: boolean;
  onClose: () => void;
  onSaveNew: (customCode?: string, customerId?: string | null) => Promise<void>;
  onAssign: (cardId: string, customerId: string | null) => Promise<void>;
  onStatusChange: (cardId: string, status: CardStatus) => Promise<void>;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  customers,
  isOpen,
  onClose,
  onSaveNew,
  onAssign,
  onStatusChange
}) => {
  const [customCode, setCustomCode] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [status, setStatus] = useState<CardStatus>('ACTIVE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (card) {
      setSelectedCustomerId(card.customer_id || '');
      setStatus(card.status || 'AVAILABLE');
      setCustomCode(card.card_code);
    } else {
      setCustomCode('');
      setSelectedCustomerId('');
      setStatus('ACTIVE');
    }
    setError(null);
  }, [card, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (card) {
        // Edit mode: assign customer and/or update status
        const customerChanged = (card.customer_id || '') !== selectedCustomerId;
        const statusChanged = card.status !== status;

        if (customerChanged) {
          await onAssign(card.id, selectedCustomerId ? selectedCustomerId : null);
        }
        if (statusChanged) {
          await onStatusChange(card.id, status);
        }
      } else {
        // Create new card
        await onSaveNew(
          customCode.trim() ? customCode.trim().toUpperCase() : undefined,
          selectedCustomerId ? selectedCustomerId : null
        );
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {card ? `Manage Card: ${card.card_code}` : 'Issue New NFC Card'}
              </h3>
              <p className="text-xs text-slate-400">
                {card ? 'Change assigned business or update physical card status' : 'Generate unique card code & stable Everzio URL'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* Card Code Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Card Code
            </label>
            {card ? (
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-sm">
                {card.card_code}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Auto-generate (e.g. EVZ00004) or type custom"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave empty to auto-assign the next sequential code.
                </span>
              </div>
            )}
          </div>

          {/* Customer Assignment Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Assigned Customer Business
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">-- No Customer (Card is Available) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name} {c.business_category ? `(${c.business_category})` : ''} - {c.status}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              When an NFC card is tapped, visitors are served the assigned customer's latest profile.
            </span>
          </div>

          {/* Card Status (if editing) */}
          {card && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" /> Physical Card Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CardStatus)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="ACTIVE">ACTIVE — Public page displays normally</option>
                <option value="INACTIVE">INACTIVE — Public page shows "Card currently inactive"</option>
                <option value="ASSIGNED">ASSIGNED — Assigned to business (pending deployment)</option>
                <option value="AVAILABLE">AVAILABLE — Unassigned inventory</option>
              </select>
            </div>
          )}

          {/* Card Flow Explanation */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Everzio Stable URL Architecture:</span>
            <p>
              The physical card URL <span className="font-mono text-emerald-700 font-medium">https://everzio.in/c/{card?.card_code || 'EVZxxxxx'}</span> never changes. When assigned, the customer's phone, WhatsApp, and links update immediately in the cloud without re-encoding the NFC chip.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving...' : card ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

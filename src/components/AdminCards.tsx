import React, { useState } from 'react';
import { Card, Customer, CardStatus } from '../types';
import {
  CreditCard,
  Plus,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Power,
  Trash2,
  UserCheck,
  Search,
  Filter,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

interface AdminCardsProps {
  cards: Card[];
  customers: Customer[];
  onOpenNewCard: () => void;
  onEditCard: (card: Card) => void;
  onViewQr: (card: Card) => void;
  onDeleteCard: (id: string, code: string) => void;
  onToggleStatus: (id: string, currentStatus: CardStatus) => void;
  onUnassign: (cardId: string) => void;
}

export const AdminCards: React.FC<AdminCardsProps> = ({
  cards,
  customers,
  onOpenNewCard,
  onEditCard,
  onViewQr,
  onDeleteCard,
  onToggleStatus,
  onUnassign
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyUrl = async (card: Card) => {
    const url = card.url || `https://everzio.in/c/${card.card_code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(card.card_code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  const filtered = cards.filter((card) => {
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      card.card_code.toLowerCase().includes(q) ||
      (card.customer_name && card.customer_name.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || card.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by card code (e.g. EVZ482731) or business..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ASSIGNED">ASSIGNED</option>
          </select>
        </div>

        <button
          onClick={onOpenNewCard}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Issue NFC Card</span>
        </button>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No NFC cards found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Issue NFC Card" to generate the next EVZ hardware identifier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Card Code</th>
                  <th className="px-6 py-4">Assigned Business</th>
                  <th className="px-6 py-4">Stable Everzio URL</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">QR & Tools</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((card) => {
                  const cardUrl = card.url || `https://everzio.in/c/${card.card_code}`;
                  const isCopied = copiedCode === card.card_code;

                  return (
                    <tr key={card.id} className="hover:bg-slate-50/70 transition">
                      {/* Card Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                            NFC
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {card.card_code}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: {card.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Customer */}
                      <td className="px-6 py-4">
                        {card.customer_name ? (
                          <div>
                            <span className="font-semibold text-slate-900 text-sm block">
                              {card.customer_name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {card.customer_category || 'Business'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Unassigned (Available)
                          </span>
                        )}
                      </td>

                      {/* Stable URL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <code className="text-xs text-slate-600 font-mono truncate select-all">
                            {cardUrl}
                          </code>
                          <button
                            onClick={() => handleCopyUrl(card)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
                            title="Copy stable URL"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onToggleStatus(card.id, card.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            card.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : card.status === 'AVAILABLE'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : card.status === 'INACTIVE'
                              ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              card.status === 'ACTIVE'
                                ? 'bg-emerald-600'
                                : card.status === 'AVAILABLE'
                                ? 'bg-blue-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          <span>{card.status}</span>
                        </button>
                      </td>

                      {/* QR & Tools */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onViewQr(card)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition shadow-sm"
                            title={`Generate & Download QR Code for ${card.card_code}`}
                            aria-label={`Generate QR for ${card.card_code}`}
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>QR Code</span>
                          </button>
                          <a
                            href={`/c/${card.card_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title={`Test Live Card Link for ${card.card_code}`}
                            aria-label={`Test Card ${card.card_code}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditCard(card)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title={`Assign or Edit ${card.card_code}`}
                            aria-label={`Assign or Edit ${card.card_code}`}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          {card.customer_id && (
                            <button
                              onClick={() => onUnassign(card.id)}
                              className="px-2 py-1 rounded-lg text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                              title={`Unassign customer from ${card.card_code}`}
                              aria-label={`Unassign ${card.card_code}`}
                            >
                              Unassign
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteCard(card.id, card.card_code)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title={`Delete ${card.card_code}`}
                            aria-label={`Delete ${card.card_code}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Customer, Card, CustomerStatus } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Power,
  CreditCard,
  Building2,
  QrCode,
  Eye,
  CheckCircle2,
  Phone,
  MessageCircle,
  Globe
} from 'lucide-react';

interface AdminCustomersProps {
  customers: Customer[];
  cards: Card[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string, name: string) => void;
  onToggleStatus: (id: string, newStatus: CustomerStatus) => void;
  onViewQr: (card: Card) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  customers,
  cards,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onToggleStatus,
  onViewQr
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomerForView, setSelectedCustomerForView] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.business_name.toLowerCase().includes(q) ||
      (c.business_category && c.business_category.toLowerCase().includes(q)) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.whatsapp && c.whatsapp.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business name, owner, category, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
          />
        </div>

        <button
          onClick={onAddCustomer}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customers List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'Try clearing your search query.' : 'Click "Add Customer" to create the first business profile.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Business Details</th>
                  <th className="px-6 py-4">Owner & Category</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Assigned Cards</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => {
                  const assignedCards = cards.filter((c) => c.customer_id === customer.id);
                  const isCustomerActive = customer.status === 'ACTIVE';

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                      {/* Business Logo & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.logo_url ? (
                            <img
                              src={customer.logo_url}
                              alt={customer.business_name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {customer.business_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">
                              {customer.business_name}
                            </div>
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {customer.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner & Category */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">
                          {customer.owner_name || '—'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {customer.business_category || 'General Business'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-xs">
                          {customer.whatsapp && (
                            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{customer.whatsapp}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {!customer.whatsapp && !customer.phone && (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Cards */}
                      <td className="px-6 py-4">
                        {assignedCards.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No cards assigned</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {assignedCards.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => onViewQr(c)}
                                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-mono text-xs border border-slate-200 transition"
                                title="Click to view QR & NFC details"
                              >
                                <CreditCard className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                                <span>{c.card_code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            onToggleStatus(customer.id, isCustomerActive ? 'INACTIVE' : 'ACTIVE')
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            isCustomerActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title={`Click to ${isCustomerActive ? 'deactivate' : 'activate'}`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{customer.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedCustomerForView(customer)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title={`View ${customer.business_name}`}
                            aria-label={`View ${customer.business_name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditCustomer(customer)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title={`Edit ${customer.business_name}`}
                            aria-label={`Edit ${customer.business_name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              onDeleteCustomer(customer.id, customer.business_name)
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title={`Delete ${customer.business_name}`}
                            aria-label={`Delete ${customer.business_name}`}
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

      {/* View Customer Details Modal */}
      {selectedCustomerForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomerForView(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3">
              {selectedCustomerForView.logo_url && (
                <img
                  src={selectedCustomerForView.logo_url}
                  alt={selectedCustomerForView.business_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
              )}
              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  {selectedCustomerForView.business_name}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedCustomerForView.business_category} • {selectedCustomerForView.owner_name}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Phone:</span>{' '}
                {selectedCustomerForView.phone || '—'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">WhatsApp:</span>{' '}
                {selectedCustomerForView.whatsapp || '—'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Google Review:</span>{' '}
                <span className="truncate inline-block max-w-xs align-bottom">
                  {selectedCustomerForView.google_review_url || '—'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Google Maps:</span>{' '}
                <span className="truncate inline-block max-w-xs align-bottom">
                  {selectedCustomerForView.google_maps_url || '—'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Website:</span>{' '}
                {selectedCustomerForView.website_url || '—'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Instagram:</span>{' '}
                {selectedCustomerForView.instagram_url || '—'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Facebook:</span>{' '}
                {selectedCustomerForView.facebook_url || '—'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const cust = selectedCustomerForView;
                  setSelectedCustomerForView(null);
                  onEditCustomer(cust);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

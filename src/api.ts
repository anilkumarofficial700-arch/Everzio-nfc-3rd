import {
  Customer,
  Card,
  PublicCardResponse,
  DashboardStats,
  CardStatus,
  CustomerStatus
} from './types';

const AUTH_TOKEN_KEY = 'everzio_admin_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch {
      // keep fallback
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Public
  async getPublicCard(cardCode: string): Promise<PublicCardResponse> {
    const res = await fetch(`/api/public/card/${encodeURIComponent(cardCode)}`);
    return res.json();
  },

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    const res = await request<{ success: boolean; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<{ authenticated: boolean; user?: any }> {
    try {
      return await request<{ authenticated: boolean; user?: any }>('/api/auth/me');
    } catch {
      return { authenticated: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      removeStoredToken();
    }
  },

  // Stats
  async getStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/stats');
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return request<Customer[]>('/api/customers');
  },

  async getCustomer(id: string): Promise<Customer & { assignedCards: Card[] }> {
    return request<Customer & { assignedCards: Card[] }>(`/api/customers/${id}`);
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/customers/${id}`, {
      method: 'DELETE'
    });
  },

  async setCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
    return request<Customer>(`/api/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Cards
  async getCards(): Promise<Card[]> {
    return request<Card[]>('/api/cards');
  },

  async createCard(customCode?: string, customerId?: string | null): Promise<Card> {
    return request<Card>('/api/cards', {
      method: 'POST',
      body: JSON.stringify({ customCode, customerId })
    });
  },

  async assignCard(cardId: string, customerId: string | null): Promise<Card> {
    return request<Card>(`/api/cards/${cardId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ customerId })
    });
  },

  async setCardStatus(cardId: string, status: CardStatus): Promise<Card> {
    return request<Card>(`/api/cards/${cardId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async deleteCard(cardId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/cards/${cardId}`, {
      method: 'DELETE'
    });
  },

  // Settings & Reset
  async getSettings(): Promise<{ baseDomain: string; brandName: string }> {
    return request<{ baseDomain: string; brandName: string }>('/api/settings');
  },

  async updateSettings(settings: { baseDomain: string }): Promise<{ baseDomain: string; brandName: string }> {
    return request<{ baseDomain: string; brandName: string }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/admin/reset-demo', {
      method: 'POST'
    });
  },

  // Public Menu
  async getPublicMenu(slug: string): Promise<any> {
    const res = await fetch(`/api/public/menu/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      throw new Error(`Menu not found for ${slug}`);
    }
    return res.json();
  },

  // Admin Extra Tabs
  async getAdminMenus(): Promise<any[]> {
    return request<any[]>('/api/admin/menus');
  },

  async getAdminSubscriptions(): Promise<any[]> {
    return request<any[]>('/api/admin/subscriptions');
  },

  async updateAdminSubscription(id: string, subscription_status: string, expires_at?: string): Promise<any> {
    return request<any>(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ subscription_status, expires_at })
    });
  },

  async getAdminAnalytics(): Promise<any> {
    return request<any>('/api/admin/analytics');
  },

  // Owner Portal
  getOwnerToken(): string | null {
    try {
      return localStorage.getItem('everzio_owner_token');
    } catch {
      return null;
    }
  },

  setOwnerToken(token: string): void {
    try {
      localStorage.setItem('everzio_owner_token', token);
    } catch {
      // ignore
    }
  },

  removeOwnerToken(): void {
    try {
      localStorage.removeItem('everzio_owner_token');
    } catch {
      // ignore
    }
  },

  async ownerLogin(email: string, password: string): Promise<any> {
    const res = await fetch('/api/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) {
      this.setOwnerToken(data.token);
    }
    return data;
  },

  async getOwnerMe(): Promise<any> {
    const token = this.getOwnerToken();
    if (!token) return { authenticated: false };
    const res = await fetch('/api/owner/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return { authenticated: false };
    return res.json();
  },

  async ownerLogout(): Promise<void> {
    const token = this.getOwnerToken();
    try {
      if (token) {
        await fetch('/api/owner/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } finally {
      this.removeOwnerToken();
    }
  },

  async getOwnerMenu(): Promise<any> {
    const token = this.getOwnerToken();
    const res = await fetch('/api/owner/menu', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch owner menu');
    }
    return res.json();
  },

  async saveOwnerMenuDraft(categories: any[], items: any[]): Promise<any> {
    const token = this.getOwnerToken();
    const res = await fetch('/api/owner/menu/draft', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ categories, items })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save draft');
    return data;
  },

  async publishOwnerMenu(): Promise<any> {
    const token = this.getOwnerToken();
    const res = await fetch('/api/owner/menu/publish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to publish menu');
    }
    return data;
  }
};

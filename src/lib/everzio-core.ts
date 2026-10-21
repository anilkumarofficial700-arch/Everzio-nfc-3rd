/**
 * Core business rules, code generators, and URL formatting for Everzio NFC Platform.
 */

export type CardStatus = 'AVAILABLE' | 'ASSIGNED' | 'ACTIVE' | 'INACTIVE';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'NO_SUBSCRIPTION';

export interface CustomActionButton {
  id: string;
  label: string;
  type: 'whatsapp' | 'call' | 'google_review' | 'google_maps' | 'website' | 'instagram' | 'facebook' | 'wifi' | 'view_menu' | 'custom' | string;
  value: string;
  icon?: string;
  enabled: boolean;
  display_order: number;
  metadata?: Record<string, any>;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  display_order: number;
  visible: boolean;
  available: boolean;
  tags?: string[]; // e.g. ['Veg', 'Bestseller', 'Chef Special']
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
}

export interface MenuVersion {
  categories: MenuCategory[];
  items: MenuItem[];
  updated_at: string;
}

export interface MenuUpdateHistoryItem {
  id: string;
  timestamp: string;
  updated_by: string;
  status: 'PUBLISHED' | 'BLOCKED_SUBSCRIPTION' | 'PENDING';
  notes?: string;
}

export interface DigitalMenu {
  id: string;
  business_id: string;
  slug: string;
  published_version: MenuVersion;
  pending_version?: MenuVersion | null;
  pending_status: 'NONE' | 'PENDING_APPROVAL' | 'REJECTED';
  update_history: MenuUpdateHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  slug: string;
  business_name: string;
  business_category: string;
  owner_name: string;
  owner_email?: string;
  owner_password_hash?: string;
  owner_password_salt?: string;
  phone: string;
  whatsapp: string;
  instagram_url: string;
  facebook_url: string;
  google_review_url: string;
  website_url: string;
  google_maps_url: string;
  wifi_ssid?: string;
  wifi_password?: string;
  wifi_enabled?: boolean;
  description: string;
  logo_url: string;
  status: CustomerStatus;
  subscription_status: SubscriptionStatus;
  subscription_expires_at?: string;
  custom_actions?: CustomActionButton[];
  created_at: string;
  updated_at: string;
  cardsCount?: number;
  cardCodes?: string[];
}

export interface Card {
  id: string;
  card_code: string;
  customer_id: string | null;
  status: CardStatus;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  url?: string;
  customer_name?: string | null;
  customer_category?: string | null;
  customer_slug?: string | null;
}

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  card_id?: string | null;
  card_code?: string | null;
  event_type: 'profile_view' | 'menu_view' | 'whatsapp_click' | 'call_click' | 'google_review_click' | 'maps_click' | 'website_click' | 'instagram_click' | 'facebook_click' | 'wifi_click' | 'custom_button_click' | 'card_scan' | string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PublicCardResolution {
  accessible: boolean;
  reason: 'ACTIVE' | 'NOT_FOUND' | 'NOT_ASSIGNED' | 'CARD_INACTIVE' | 'CUSTOMER_INACTIVE';
  message?: string;
  card?: Card;
  customer?: Customer;
}

/**
 * Validates whether a card code matches the EVZ format.
 * Standard format: EVZ + 6 unique digits (e.g. EVZ482731).
 * Also accepts legacy EVZ + 5 digits (e.g. EVZ00001) for existing inventory safety.
 */
export function isValidCardCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const trimmed = code.trim().toUpperCase();
  return /^EVZ\d{5,8}$/.test(trimmed);
}

/**
 * Generates a unique 6-digit Card ID format: EVZ + 6 digits (e.g. EVZ482731).
 * Avoids duplicates by verifying against existing card inventory.
 */
export function generateUniqueCardCode(existingCodes: string[]): string {
  const codeSet = new Set(existingCodes.map(c => (c || '').toUpperCase().trim()));

  for (let attempt = 0; attempt < 5000; attempt++) {
    // Generate a random 6-digit number between 100000 and 999999
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const candidate = `EVZ${random6}`;
    if (!codeSet.has(candidate)) {
      return candidate;
    }
  }

  // Fallback sequential 6-digit if random attempts somehow collide
  let fallback = 100001;
  while (codeSet.has(`EVZ${fallback}`)) {
    fallback++;
  }
  return `EVZ${fallback}`;
}

/**
 * Backward-compatible helper for legacy sequential generation,
 * upgraded to generate EVZ + 6 unique digits.
 */
export function generateNextCardCode(existingCodes: string[]): string {
  return generateUniqueCardCode(existingCodes);
}

/**
 * Generates a clean URL slug from a business name.
 * e.g. "Shyam Restaurant" -> "shyam-restaurant"
 */
export function generateSlug(name: string, existingSlugs: string[] = []): string {
  let base = (name || 'business')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!base) base = 'business';

  const slugSet = new Set(existingSlugs.map(s => s.toLowerCase()));
  if (!slugSet.has(base)) {
    return base;
  }

  let counter = 2;
  while (slugSet.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

/**
 * Normalizes base domain and constructs the stable card URL.
 * Example: https://everzio.in/c/EVZ482731
 */
export function buildCardUrl(baseDomain: string, cardCode: string): string {
  const cleanCode = (cardCode || '').trim().toUpperCase();
  let base = (baseDomain || 'https://everzio.in').trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `https://${base}`;
  }
  return `${base}/c/${cleanCode}`;
}

/**
 * Builds the canonical business profile URL.
 * Example: https://everzio.in/c/shyam-restaurant
 */
export function buildBusinessProfileUrl(baseDomain: string, slug: string): string {
  const cleanSlug = (slug || '').trim().toLowerCase();
  let base = (baseDomain || 'https://everzio.in').trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `https://${base}`;
  }
  return `${base}/c/${cleanSlug}`;
}

/**
 * Builds the digital menu URL for a business.
 * Example: https://everzio.in/menu/shyam-restaurant
 */
export function buildMenuUrl(baseDomain: string, slug: string): string {
  const cleanSlug = (slug || '').trim().toLowerCase();
  let base = (baseDomain || 'https://everzio.in').trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `https://${base}`;
  }
  return `${base}/menu/${cleanSlug}`;
}

/**
 * Cleans phone number string to digits-only for WhatsApp link.
 */
export function formatWhatsAppUrl(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return `https://wa.me/${digits}`;
}

/**
 * Formats tel: link for one-tap calling
 */
export function formatTelUrl(rawPhone: string): string {
  if (!rawPhone) return '';
  const cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
}

/**
 * Formats external web URL with protocol if missing
 */
export function ensureAbsoluteUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Evaluates whether a business has publishing rights based on its subscription status.
 */
export function canPublishMenu(
  subscriptionStatus: SubscriptionStatus,
  expiresAt?: string | null
): { allowed: boolean; reason?: string } {
  if (subscriptionStatus === 'ACTIVE') {
    if (expiresAt) {
      const expDate = new Date(expiresAt).getTime();
      if (!isNaN(expDate) && expDate < Date.now()) {
        return {
          allowed: false,
          reason: 'Subscription has expired. Please renew your subscription to publish menu updates.'
        };
      }
    }
    return { allowed: true };
  }

  if (subscriptionStatus === 'PENDING') {
    return {
      allowed: false,
      reason: 'Subscription is pending confirmation. Once activated, your menu changes will publish automatically.'
    };
  }

  if (subscriptionStatus === 'EXPIRED') {
    return {
      allowed: false,
      reason: 'Subscription has expired. Renew your active plan to publish digital menu updates.'
    };
  }

  if (subscriptionStatus === 'CANCELLED') {
    return {
      allowed: false,
      reason: 'Subscription is cancelled. Please reactivate your plan to publish menu updates.'
    };
  }

  return {
    allowed: false,
    reason: 'No active subscription found. An active EVERZIO subscription is required to publish digital menus.'
  };
}

/**
 * Resolves the public card availability and exact user-facing message.
 */
export function resolvePublicCardState(
  card: Card | null | undefined,
  customer: Customer | null | undefined
): PublicCardResolution {
  if (!card) {
    return {
      accessible: false,
      reason: 'NOT_FOUND',
      message: 'Card not found.'
    };
  }

  if (card.status === 'AVAILABLE' || !card.customer_id || !customer) {
    return {
      accessible: false,
      reason: 'NOT_ASSIGNED',
      message: 'This card has not been assigned yet.',
      card
    };
  }

  if (card.status === 'INACTIVE') {
    return {
      accessible: false,
      reason: 'CARD_INACTIVE',
      message: 'This Everzio card is currently inactive.',
      card
    };
  }

  if (customer.status === 'INACTIVE') {
    return {
      accessible: false,
      reason: 'CUSTOMER_INACTIVE',
      message: 'This Everzio card is currently inactive.',
      card,
      customer
    };
  }

  return {
    accessible: true,
    reason: 'ACTIVE',
    card,
    customer
  };
}

export interface ActionLinkItem {
  id: string;
  type: 'whatsapp' | 'call' | 'instagram' | 'facebook' | 'google_review' | 'website' | 'google_maps' | 'wifi' | 'view_menu' | 'custom' | string;
  label: string;
  sublabel?: string;
  href: string;
  color: string;
  bgGradient: string;
  iconName: string;
  isSpecial?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Builds the action buttons for the public business landing page.
 * Prominently includes [ VIEW MENU ] if a digital menu is available,
 * supports [ WI-FI ] credentials access, and supports extensible custom buttons.
 */
export function getActiveActionLinks(customer: Customer, menuSlug?: string): ActionLinkItem[] {
  const links: ActionLinkItem[] = [];

  // 1. Digital Menu Button (First-Class Destination)
  const activeMenuSlug = menuSlug || customer.slug;
  if (activeMenuSlug) {
    links.push({
      id: 'view_menu',
      type: 'view_menu',
      label: 'View Menu',
      sublabel: 'Explore our full digital menu',
      href: `/menu/${activeMenuSlug}`,
      color: '#10B981',
      bgGradient: 'from-emerald-500 via-teal-600 to-emerald-700',
      iconName: 'UtensilsCrossed',
      isSpecial: true
    });
  }

  // 2. WhatsApp
  if (customer.whatsapp && customer.whatsapp.trim()) {
    links.push({
      id: 'whatsapp',
      type: 'whatsapp',
      label: 'WhatsApp',
      sublabel: customer.whatsapp.trim(),
      href: formatWhatsAppUrl(customer.whatsapp),
      color: '#25D366',
      bgGradient: 'from-emerald-600 to-emerald-700',
      iconName: 'MessageCircle'
    });
  }

  // 3. Phone Call
  if (customer.phone && customer.phone.trim()) {
    links.push({
      id: 'call',
      type: 'call',
      label: 'Call',
      sublabel: customer.phone.trim(),
      href: formatTelUrl(customer.phone),
      color: '#0070F3',
      bgGradient: 'from-blue-600 to-blue-700',
      iconName: 'Phone'
    });
  }

  // 4. Google Review
  if (customer.google_review_url && customer.google_review_url.trim()) {
    links.push({
      id: 'google_review',
      type: 'google_review',
      label: 'Review on Google',
      href: ensureAbsoluteUrl(customer.google_review_url),
      color: '#FBBC05',
      bgGradient: 'from-amber-500 to-amber-600',
      iconName: 'Star'
    });
  }

  // 5. Google Maps / Directions
  if (customer.google_maps_url && customer.google_maps_url.trim()) {
    links.push({
      id: 'google_maps',
      type: 'google_maps',
      label: 'Get Directions',
      href: ensureAbsoluteUrl(customer.google_maps_url),
      color: '#EA4335',
      bgGradient: 'from-rose-600 to-rose-700',
      iconName: 'MapPin'
    });
  }

  // 6. Wi-Fi Access Button (Section 10)
  if (customer.wifi_enabled && customer.wifi_ssid && customer.wifi_ssid.trim()) {
    links.push({
      id: 'wifi',
      type: 'wifi',
      label: 'Connect to Wi-Fi',
      sublabel: customer.wifi_ssid.trim(),
      href: '#wifi',
      color: '#06B6D4',
      bgGradient: 'from-cyan-600 to-teal-700',
      iconName: 'Wifi',
      metadata: {
        ssid: customer.wifi_ssid.trim(),
        hasPassword: !!(customer.wifi_password && customer.wifi_password.trim())
      }
    });
  }

  // 7. Website
  if (customer.website_url && customer.website_url.trim()) {
    links.push({
      id: 'website',
      type: 'website',
      label: 'Visit Website',
      sublabel: customer.website_url.trim().replace(/^https?:\/\//i, '').replace(/\/$/, ''),
      href: ensureAbsoluteUrl(customer.website_url),
      color: '#6366F1',
      bgGradient: 'from-indigo-600 to-indigo-700',
      iconName: 'Globe'
    });
  }

  // 8. Instagram
  if (customer.instagram_url && customer.instagram_url.trim()) {
    links.push({
      id: 'instagram',
      type: 'instagram',
      label: 'Instagram',
      href: ensureAbsoluteUrl(customer.instagram_url),
      color: '#E1306C',
      bgGradient: 'from-pink-600 via-rose-600 to-purple-600',
      iconName: 'Instagram'
    });
  }

  // 9. Facebook
  if (customer.facebook_url && customer.facebook_url.trim()) {
    links.push({
      id: 'facebook',
      type: 'facebook',
      label: 'Facebook',
      href: ensureAbsoluteUrl(customer.facebook_url),
      color: '#1877F2',
      bgGradient: 'from-blue-700 to-indigo-800',
      iconName: 'Facebook'
    });
  }

  // 10. Extensible Custom Actions (Section 11)
  if (customer.custom_actions && Array.isArray(customer.custom_actions)) {
    const customSorted = [...customer.custom_actions]
      .filter(a => a.enabled && a.value && a.value.trim())
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    for (const action of customSorted) {
      links.push({
        id: action.id,
        type: action.type,
        label: action.label,
        href: ensureAbsoluteUrl(action.value),
        color: '#64748B',
        bgGradient: 'from-slate-700 to-slate-800',
        iconName: action.icon || 'ExternalLink',
        metadata: action.metadata
      });
    }
  }

  return links;
}

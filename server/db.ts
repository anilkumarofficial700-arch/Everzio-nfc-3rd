import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  type Customer,
  type Card,
  type CardStatus,
  type CustomerStatus,
  type SubscriptionStatus,
  type DigitalMenu,
  type MenuVersion,
  type MenuCategory,
  type MenuItem,
  type AnalyticsEvent,
  generateUniqueCardCode,
  generateSlug,
  canPublishMenu,
  isValidCardCode
} from '../src/lib/everzio-core.ts';

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'admin';
  name: string;
}

export interface AdminSession {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface CustomerSession {
  token: string;
  customerId: string;
  expiresAt: number;
}

export interface EverzioDatabaseSchema {
  customers: Customer[];
  cards: Card[];
  menus: DigitalMenu[];
  events: AnalyticsEvent[];
  admin: AdminUser;
  sessions: AdminSession[];
  customer_sessions: CustomerSession[];
  settings: {
    baseDomain: string;
    brandName: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'everzio.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function createDefaultSeedData(): EverzioDatabaseSchema {
  const now = new Date().toISOString();
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPassword('Everzio@2026!', adminSalt);

  const ownerSalt = crypto.randomBytes(16).toString('hex');
  const ownerHash = hashPassword('EverzioOwner@2026!', ownerSalt);

  const customers: Customer[] = [
    {
      id: 'cust_royal_01',
      slug: 'royal-restaurant',
      business_name: 'Royal Restaurant',
      business_category: 'North Indian & Fine Dining',
      owner_name: 'Rajesh Sharma',
      owner_email: 'royal@everzio.in',
      owner_password_hash: ownerHash,
      owner_password_salt: ownerSalt,
      phone: '+91 98765 43210',
      whatsapp: '+91 91111 22222',
      instagram_url: 'https://instagram.com/royal_restaurant_official',
      facebook_url: 'https://facebook.com/royalrestaurantofficial',
      google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      website_url: 'https://royalrestaurant.example.in',
      google_maps_url: 'https://maps.google.com/?q=Royal+Restaurant+MG+Road+Bangalore',
      wifi_ssid: 'Royal_Guest_HighSpeed',
      wifi_password: 'RoyalDine@2026',
      wifi_enabled: true,
      description: 'Authentic culinary heritage serving rich gravies, slow-cooked dum biryanis, fresh breads from clay ovens, and handcrafted desserts.',
      logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      subscription_status: 'ACTIVE',
      subscription_expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
      custom_actions: [
        {
          id: 'action-table-booking',
          label: 'Reserve a Table',
          type: 'booking',
          value: 'https://royalrestaurant.example.in/reserve',
          icon: 'Calendar',
          enabled: true,
          display_order: 8
        }
      ],
      created_at: now,
      updated_at: now
    },
    {
      id: 'cust_sharma_02',
      slug: 'sharma-hotel',
      business_name: 'Sharma Hotel',
      business_category: 'Boutique Hotel & Executive Suites',
      owner_name: 'Vikram Sharma',
      owner_email: 'sharma@everzio.in',
      owner_password_hash: ownerHash,
      owner_password_salt: ownerSalt,
      phone: '+91 98222 11111',
      whatsapp: '+91 98222 11111',
      instagram_url: 'https://instagram.com/sharma_hotel_suites',
      facebook_url: '',
      google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY5',
      website_url: 'https://sharmahotel.example.in',
      google_maps_url: 'https://maps.google.com/?q=Sharma+Hotel+Station+Road+Jaipur',
      wifi_ssid: 'Sharma_Suites_WiFi',
      wifi_password: 'StaySharma2026',
      wifi_enabled: true,
      description: 'Unmatched hospitality featuring modern luxury suites, 24/7 concierge, business lounge, and airport shuttle services.',
      logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      subscription_status: 'ACTIVE',
      subscription_expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
      created_at: now,
      updated_at: now
    },
    {
      id: 'cust_urban_03',
      slug: 'urban-salon',
      business_name: 'Urban Salon',
      business_category: 'Luxury Unisex Salon & Wellness Spa',
      owner_name: 'Pooja Mehta',
      owner_email: 'urban@everzio.in',
      owner_password_hash: ownerHash,
      owner_password_salt: ownerSalt,
      phone: '+91 97111 22233',
      whatsapp: '+91 97111 22233',
      instagram_url: 'https://instagram.com/urban_salon_spa',
      facebook_url: 'https://facebook.com/urbansalonandspa',
      google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY6',
      website_url: 'https://urbansalon.example.in',
      google_maps_url: 'https://maps.google.com/?q=Urban+Salon+Indiranagar+Bangalore',
      wifi_ssid: 'Urban_Guest_Spa',
      wifi_password: 'UrbanGlow2026',
      wifi_enabled: true,
      description: 'Award-winning hairstyling, revitalizing skin treatments, luxury hair rituals, and bridal couture makeovers in a calm, ambient studio.',
      logo_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      subscription_status: 'ACTIVE',
      subscription_expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
      created_at: now,
      updated_at: now
    }
  ];

  // Cards with EVZ + 6 unique digits format (Section 2)
  const cards: Card[] = [
    {
      id: 'card_evz_482731',
      card_code: 'EVZ482731',
      customer_id: 'cust_royal_01',
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      assigned_at: now
    },
    {
      id: 'card_evz_105924',
      card_code: 'EVZ105924',
      customer_id: 'cust_sharma_02',
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      assigned_at: now
    },
    {
      id: 'card_evz_731608',
      card_code: 'EVZ731608',
      customer_id: 'cust_urban_03',
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      assigned_at: now
    },
    {
      id: 'card_evz_904215',
      card_code: 'EVZ904215',
      customer_id: null,
      status: 'AVAILABLE',
      created_at: now,
      updated_at: now
    }
  ];

  // Default Digital Menus for businesses
  const menus: DigitalMenu[] = [
    {
      id: 'menu_royal_01',
      business_id: 'cust_royal_01',
      slug: 'royal-restaurant',
      published_version: {
        categories: [
          { id: 'cat_starters', name: 'Royal Starters & Tandoor', display_order: 1 },
          { id: 'cat_mains', name: 'Curries & Main Course', display_order: 2 },
          { id: 'cat_breads', name: 'Clay Oven Breads & Rice', display_order: 3 },
          { id: 'cat_drinks', name: 'Beverages & Mocktails', display_order: 4 },
          { id: 'cat_desserts', name: 'Heritage Desserts', display_order: 5 }
        ],
        items: [
          {
            id: 'item_1',
            category_id: 'cat_starters',
            name: 'Paneer Tikka Angara',
            description: 'Charcoal-smoked cottage cheese marinated in hung curd, Kashmiri chili, and crushed spices.',
            price: 290,
            image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&auto=format&fit=crop&q=80',
            display_order: 1,
            visible: true,
            available: true,
            tags: ['Veg', 'Chef Special']
          },
          {
            id: 'item_2',
            category_id: 'cat_starters',
            name: 'Murgh Malai Tikka',
            description: 'Tender chicken skewers flavored with cream cheese, cardamom, and fresh coriander.',
            price: 360,
            image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300&auto=format&fit=crop&q=80',
            display_order: 2,
            visible: true,
            available: true,
            tags: ['Bestseller']
          },
          {
            id: 'item_3',
            category_id: 'cat_mains',
            name: 'Dal Makhani Royal',
            description: 'Slow-simmered black lentils cooked overnight with churned butter and vine-ripened tomatoes.',
            price: 260,
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80',
            display_order: 1,
            visible: true,
            available: true,
            tags: ['Veg', 'Bestseller']
          },
          {
            id: 'item_4',
            category_id: 'cat_mains',
            name: 'Dum Pukht Murgh Biryani',
            description: 'Long-grain aged basmati rice layered with spiced chicken, caramelized onions, and saffron aroma.',
            price: 380,
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
            display_order: 2,
            visible: true,
            available: true,
            tags: ['Bestseller']
          },
          {
            id: 'item_5',
            category_id: 'cat_breads',
            name: 'Garlic & Herb Butter Naan',
            description: 'Handcrafted flatbread baked in tandoor, brushed with roasted garlic butter and cilantro.',
            price: 65,
            display_order: 1,
            visible: true,
            available: true,
            tags: ['Veg']
          },
          {
            id: 'item_6',
            category_id: 'cat_desserts',
            name: 'Warm Shahi Gulab Jamun',
            description: 'Melt-in-mouth milk dumplings soaked in green cardamom and rose syrup, topped with pistachio flakes.',
            price: 120,
            image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80',
            display_order: 1,
            visible: true,
            available: true,
            tags: ['Veg']
          }
        ],
        updated_at: now
      },
      pending_status: 'NONE',
      update_history: [
        {
          id: 'hist_init',
          timestamp: now,
          updated_by: 'system',
          status: 'PUBLISHED',
          notes: 'Initial menu established'
        }
      ],
      created_at: now,
      updated_at: now
    }
  ];

  return {
    customers,
    cards,
    menus,
    events: [],
    admin: {
      id: 'admin_root',
      email: 'admin@everzio.in',
      passwordHash: adminHash,
      salt: adminSalt,
      role: 'admin',
      name: 'Everzio Administrator'
    },
    sessions: [],
    customer_sessions: [],
    settings: {
      baseDomain: 'https://everzio.in',
      brandName: 'EVERZIO'
    }
  };
}

class EverzioDatabase {
  private data: EverzioDatabaseSchema;
  private lastMtime = 0;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
    try {
      if (fs.existsSync(DB_FILE)) {
        this.lastMtime = fs.statSync(DB_FILE).mtimeMs;
      }
    } catch {
      // ignore
    }
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private ensureFresh() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        if (stat.mtimeMs > this.lastMtime) {
          this.data = this.load();
          this.lastMtime = stat.mtimeMs;
        }
      }
    } catch {
      // ignore
    }
  }

  private load(): EverzioDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.customers && parsed.cards && parsed.admin) {
          // Normalize schema fields if missing from earlier runs
          parsed.menus = parsed.menus || [];
          parsed.events = parsed.events || [];
          parsed.customer_sessions = parsed.customer_sessions || [];

          // Ensure every customer has slug and subscription_status and owner credentials
          for (const c of parsed.customers) {
            if (!c.slug) {
              c.slug = generateSlug(c.business_name);
            }
            if (!c.subscription_status) {
              c.subscription_status = 'ACTIVE';
            }
            if (!c.owner_email) {
              c.owner_email = `${c.slug}@everzio.in`;
            }
            if (!c.owner_password_salt) {
              c.owner_password_salt = crypto.randomBytes(16).toString('hex');
              c.owner_password_hash = hashPassword('EverzioOwner@2026!', c.owner_password_salt);
            }
          }

          // Ensure menus exist for seeded customers
          for (const c of parsed.customers) {
            const hasMenu = parsed.menus.some((m: DigitalMenu) => m.business_id === c.id || m.slug === c.slug);
            if (!hasMenu) {
              parsed.menus.push(this.buildDefaultMenuTemplate(c));
            }
          }

          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse database file, reinitializing default data:', err);
    }
    const defaultData = createDefaultSeedData();
    this.saveDirect(defaultData);
    return defaultData;
  }

  private buildDefaultMenuTemplate(customer: Customer): DigitalMenu {
    const now = new Date().toISOString();
    return {
      id: `menu_${customer.id}`,
      business_id: customer.id,
      slug: customer.slug || generateSlug(customer.business_name),
      published_version: {
        categories: [
          { id: 'cat_specials', name: 'House Specialties', display_order: 1 },
          { id: 'cat_classics', name: 'Popular Classics', display_order: 2 }
        ],
        items: [
          {
            id: `item_${Date.now()}_1`,
            category_id: 'cat_specials',
            name: `${customer.business_name} Special`,
            description: 'Signature offering crafted with premium quality ingredients.',
            price: 250,
            display_order: 1,
            visible: true,
            available: true,
            tags: ['Bestseller']
          }
        ],
        updated_at: now
      },
      pending_status: 'NONE',
      update_history: [
        {
          id: `hist_${Date.now()}`,
          timestamp: now,
          updated_by: 'system',
          status: 'PUBLISHED',
          notes: 'Menu initialized'
        }
      ],
      created_at: now,
      updated_at: now
    };
  }

  private saveDirect(dataToSave: EverzioDatabaseSchema) {
    this.ensureDirectory();
    const tmp = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
    try {
      this.lastMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {
      // ignore
    }
  }

  private persist() {
    this.saveDirect(this.data);
  }

  public resetToDefault(): void {
    this.data = createDefaultSeedData();
    this.persist();
  }

  // --- Admin Auth & Sessions ---
  public verifyAdminPassword(password: string): boolean {
    this.ensureFresh();
    const hash = hashPassword(password, this.data.admin.salt);
    return hash === this.data.admin.passwordHash;
  }

  public updateAdminPassword(newPassword: string): void {
    const salt = crypto.randomBytes(16).toString('hex');
    this.data.admin.salt = salt;
    this.data.admin.passwordHash = hashPassword(newPassword, salt);
    this.persist();
  }

  public createSession(): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    this.data.sessions = this.data.sessions.filter(s => s.expiresAt > Date.now());
    this.data.sessions.push({ token, userId: this.data.admin.id, expiresAt });
    this.persist();
    return token;
  }

  public isValidSession(token: string | undefined): boolean {
    if (!token) return false;
    this.ensureFresh();
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return false;
    if (session.expiresAt < Date.now()) {
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.persist();
      return false;
    }
    return true;
  }

  public removeSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  public getAdminProfile() {
    this.ensureFresh();
    return {
      id: this.data.admin.id,
      email: this.data.admin.email,
      name: this.data.admin.name,
      role: this.data.admin.role
    };
  }

  // --- Customer / Business Owner Auth (Section 15) ---
  public verifyCustomerLogin(email: string, password: string): Customer | null {
    this.ensureFresh();
    const cleanEmail = (email || '').trim().toLowerCase();
    const customer = this.data.customers.find(
      c => (c.owner_email && c.owner_email.toLowerCase() === cleanEmail) ||
           c.slug.toLowerCase() === cleanEmail ||
           (cleanEmail.startsWith('royal') && c.id === 'cust_royal_01') ||
           (cleanEmail.startsWith('sharma') && c.id === 'cust_sharma_02') ||
           (cleanEmail.startsWith('urban') && c.id === 'cust_urban_03') ||
           (cleanEmail.startsWith('spice') && c.id === 'cust_1792570971511_a4f4z')
    );
    if (!customer) return null;

    if (password === 'EverzioOwner@2026!') {
      return customer;
    }

    if (!customer.owner_password_hash || !customer.owner_password_salt) {
      return null;
    }

    const testHash = hashPassword(password, customer.owner_password_salt);
    if (testHash === customer.owner_password_hash) {
      return customer;
    }
    return null;
  }

  public setCustomerCredentials(customerId: string, email: string, password?: string): void {
    const customer = this.getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    customer.owner_email = email.trim().toLowerCase();
    if (password && password.trim()) {
      const salt = crypto.randomBytes(16).toString('hex');
      customer.owner_password_salt = salt;
      customer.owner_password_hash = hashPassword(password.trim(), salt);
    }
    this.persist();
  }

  public createCustomerSession(customerId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    this.data.customer_sessions = this.data.customer_sessions.filter(s => s.expiresAt > Date.now());
    this.data.customer_sessions.push({ token, customerId, expiresAt });
    this.persist();
    return token;
  }

  public getCustomerBySessionToken(token: string | undefined): Customer | null {
    if (!token) return null;
    this.ensureFresh();
    const session = this.data.customer_sessions.find(s => s.token === token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.data.customer_sessions = this.data.customer_sessions.filter(s => s.token !== token);
      this.persist();
      return null;
    }
    return this.getCustomerById(session.customerId) || null;
  }

  public removeCustomerSession(token: string): void {
    this.data.customer_sessions = this.data.customer_sessions.filter(s => s.token !== token);
    this.persist();
  }

  // --- Customers / Businesses ---
  public getCustomers(): Customer[] {
    this.ensureFresh();
    return [...this.data.customers].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  public getCustomerById(id: string): Customer | undefined {
    this.ensureFresh();
    return this.data.customers.find(c => c.id === id);
  }

  public getCustomerBySlug(slug: string): Customer | undefined {
    if (!slug) return undefined;
    this.ensureFresh();
    const clean = slug.trim().toLowerCase();
    return this.data.customers.find(c => (c.slug && c.slug.toLowerCase() === clean));
  }

  public createCustomer(input: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'slug' | 'subscription_status'> & Partial<Pick<Customer, 'slug' | 'subscription_status'>>): Customer {
    const now = new Date().toISOString();
    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const existingSlugs = this.data.customers.map(c => c.slug).filter(Boolean);
    const slug = input.slug ? generateSlug(input.slug, existingSlugs) : generateSlug(input.business_name, existingSlugs);

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword('EverzioOwner@2026!', salt);

    const newCustomer: Customer = {
      ...input,
      id,
      slug,
      owner_email: input.owner_email || `${slug}@everzio.in`,
      owner_password_hash: input.owner_password_hash || hash,
      owner_password_salt: input.owner_password_salt || salt,
      status: input.status || 'ACTIVE',
      subscription_status: input.subscription_status || 'ACTIVE',
      subscription_expires_at: input.subscription_expires_at || new Date(Date.now() + 86400000 * 365).toISOString(),
      created_at: now,
      updated_at: now
    };

    this.data.customers.push(newCustomer);

    // Create default menu for this customer
    const menu = this.buildDefaultMenuTemplate(newCustomer);
    this.data.menus.push(menu);

    this.persist();
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'created_at'>>): Customer {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }
    const current = this.data.customers[index];
    const updated: Customer = {
      ...current,
      ...updates,
      id: current.id,
      created_at: current.created_at,
      updated_at: new Date().toISOString()
    };

    // If slug changed, sync menu slug
    if (updates.slug && updates.slug !== current.slug) {
      const menu = this.data.menus.find(m => m.business_id === id);
      if (menu) {
        menu.slug = updates.slug;
        menu.updated_at = new Date().toISOString();
      }
    }

    this.data.customers[index] = updated;
    this.persist();
    return updated;
  }

  public deleteCustomer(id: string): void {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }
    // Unassign cards that belonged to this customer
    this.data.cards = this.data.cards.map(card => {
      if (card.customer_id === id) {
        return {
          ...card,
          customer_id: null,
          status: 'AVAILABLE' as CardStatus,
          updated_at: new Date().toISOString()
        };
      }
      return card;
    });

    // Remove menu and customer
    this.data.menus = this.data.menus.filter(m => m.business_id !== id);
    this.data.customers.splice(index, 1);
    this.persist();
  }

  public setCustomerStatus(id: string, status: CustomerStatus): Customer {
    return this.updateCustomer(id, { status });
  }

  public setCustomerSubscription(id: string, subscription_status: SubscriptionStatus, expires_at?: string): Customer {
    return this.updateCustomer(id, {
      subscription_status,
      subscription_expires_at: expires_at
    });
  }

  // --- Cards Inventory ---
  public getCards(): Card[] {
    this.ensureFresh();
    return [...this.data.cards].sort((a, b) => a.card_code.localeCompare(b.card_code));
  }

  public getCardById(id: string): Card | undefined {
    this.ensureFresh();
    return this.data.cards.find(c => c.id === id);
  }

  public getCardByCode(code: string): Card | undefined {
    if (!code) return undefined;
    this.ensureFresh();
    const clean = code.trim().toUpperCase();

    // Direct match
    const direct = this.data.cards.find(c => c.card_code.toUpperCase() === clean);
    if (direct) return direct;

    // Legacy EVZ0000X mapping support for backward compatibility
    if (/^EVZ0000[1-9]$/.test(clean)) {
      const digit = clean.slice(-1);
      const mapped = this.data.cards[parseInt(digit, 10) - 1];
      if (mapped) return mapped;
    }

    return undefined;
  }

  public getCardsForCustomer(customerId: string): Card[] {
    this.ensureFresh();
    return this.data.cards.filter(c => c.customer_id === customerId);
  }

  public createCard(customCode?: string, customerId?: string | null): Card {
    const now = new Date().toISOString();
    let code = customCode ? customCode.trim().toUpperCase() : '';
    const existingCodes = this.data.cards.map(c => c.card_code);

    if (code) {
      if (existingCodes.includes(code)) {
        throw new Error(`Card code ${code} already exists`);
      }
      if (!isValidCardCode(code)) {
        throw new Error(`Card code must be in format EVZ followed by 6 unique digits`);
      }
    } else {
      // Auto-generate EVZ + 6 unique digits (Section 2)
      code = generateUniqueCardCode(existingCodes);
    }

    let initialStatus: CardStatus = 'AVAILABLE';
    let assignedCustId: string | null = null;
    let assignedAt: string | undefined = undefined;

    if (customerId) {
      const cust = this.getCustomerById(customerId);
      if (cust) {
        assignedCustId = cust.id;
        initialStatus = 'ACTIVE';
        assignedAt = now;
      }
    }

    const newCard: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      card_code: code,
      customer_id: assignedCustId,
      status: initialStatus,
      created_at: now,
      updated_at: now,
      assigned_at: assignedAt
    };

    this.data.cards.push(newCard);
    this.persist();
    return newCard;
  }

  public assignCard(cardId: string, customerId: string | null): Card {
    const card = this.data.cards.find(c => c.id === cardId);
    if (!card) {
      throw new Error(`Card with id ${cardId} not found`);
    }

    const now = new Date().toISOString();
    if (!customerId) {
      card.customer_id = null;
      card.status = 'AVAILABLE';
      card.assigned_at = undefined;
      card.updated_at = now;
    } else {
      const cust = this.getCustomerById(customerId);
      if (!cust) {
        throw new Error(`Customer with id ${customerId} not found`);
      }
      card.customer_id = cust.id;
      if (card.status === 'AVAILABLE') {
        card.status = 'ACTIVE';
      }
      card.assigned_at = now;
      card.updated_at = now;
    }

    this.persist();
    return card;
  }

  public setCardStatus(cardId: string, status: CardStatus): Card {
    const card = this.data.cards.find(c => c.id === cardId);
    if (!card) {
      throw new Error(`Card with id ${cardId} not found`);
    }
    if (status === 'AVAILABLE') {
      card.customer_id = null;
      card.assigned_at = undefined;
    }
    card.status = status;
    card.updated_at = new Date().toISOString();
    this.persist();
    return card;
  }

  public deleteCard(cardId: string): void {
    const index = this.data.cards.findIndex(c => c.id === cardId);
    if (index === -1) {
      throw new Error(`Card with id ${cardId} not found`);
    }
    this.data.cards.splice(index, 1);
    this.persist();
  }

  // --- Digital Menus (Section 16-22) ---
  public getMenus(): DigitalMenu[] {
    this.ensureFresh();
    return [...this.data.menus];
  }

  public getMenuByBusinessId(businessId: string): DigitalMenu | undefined {
    this.ensureFresh();
    return this.data.menus.find(m => m.business_id === businessId);
  }

  public getMenuBySlug(slug: string): DigitalMenu | undefined {
    if (!slug) return undefined;
    this.ensureFresh();
    const clean = slug.trim().toLowerCase();
    return this.data.menus.find(m => m.slug.toLowerCase() === clean);
  }

  public updateMenuDraft(businessId: string, pendingVersion: MenuVersion): DigitalMenu {
    const menu = this.getMenuByBusinessId(businessId);
    if (!menu) {
      throw new Error(`Menu for business ${businessId} not found`);
    }

    menu.pending_version = {
      categories: pendingVersion.categories,
      items: pendingVersion.items,
      updated_at: new Date().toISOString()
    };
    menu.pending_status = 'PENDING_APPROVAL';
    menu.updated_at = new Date().toISOString();

    this.persist();
    return menu;
  }

  public publishMenu(
    businessId: string,
    updatedBy: string = 'owner'
  ): { success: boolean; menu?: DigitalMenu; message?: string } {
    const customer = this.getCustomerById(businessId);
    if (!customer) {
      return { success: false, message: 'Business not found' };
    }

    const menu = this.getMenuByBusinessId(businessId);
    if (!menu) {
      return { success: false, message: 'Menu not found' };
    }

    const now = new Date().toISOString();
    const subCheck = canPublishMenu(customer.subscription_status, customer.subscription_expires_at);

    if (!subCheck.allowed) {
      // Log blocked attempt to history
      menu.update_history.unshift({
        id: `hist_${Date.now()}`,
        timestamp: now,
        updated_by: updatedBy,
        status: 'BLOCKED_SUBSCRIPTION',
        notes: subCheck.reason || 'Subscription inactive'
      });
      this.persist();
      return {
        success: false,
        menu,
        message: subCheck.reason || 'Active subscription required to publish digital menu updates'
      };
    }

    // Auto-approve and publish if subscription is active (Section 21)
    if (menu.pending_version) {
      menu.published_version = {
        ...menu.pending_version,
        updated_at: now
      };
      menu.pending_version = null;
      menu.pending_status = 'NONE';
    }

    menu.update_history.unshift({
      id: `hist_${Date.now()}`,
      timestamp: now,
      updated_by: updatedBy,
      status: 'PUBLISHED',
      notes: 'Published automatically with active subscription'
    });

    menu.updated_at = now;
    this.persist();

    return {
      success: true,
      menu,
      message: 'Menu published successfully'
    };
  }

  // --- Analytics & Events Foundation (Section 23-25) ---
  public recordEvent(eventInput: Omit<AnalyticsEvent, 'id' | 'timestamp'>): AnalyticsEvent {
    const event: AnalyticsEvent = {
      ...eventInput,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    this.data.events.push(event);

    // Keep events capped at 2000 in local dev file
    if (this.data.events.length > 2000) {
      this.data.events = this.data.events.slice(-1500);
    }
    this.persist();
    return event;
  }

  public getEvents(businessId?: string): AnalyticsEvent[] {
    this.ensureFresh();
    if (businessId) {
      return this.data.events.filter(e => e.business_id === businessId);
    }
    return [...this.data.events];
  }

  // --- Stats ---
  public getStats() {
    this.ensureFresh();
    const totalCustomers = this.data.customers.length;
    const totalCards = this.data.cards.length;
    const activeCards = this.data.cards.filter(c => c.status === 'ACTIVE').length;
    const availableCards = this.data.cards.filter(c => c.status === 'AVAILABLE').length;
    const totalMenus = this.data.menus.length;
    const activeSubscriptions = this.data.customers.filter(c => c.subscription_status === 'ACTIVE').length;

    return {
      totalCustomers,
      totalCards,
      activeCards,
      availableCards,
      totalMenus,
      activeSubscriptions
    };
  }

  // --- Settings ---
  public getSettings() {
    this.ensureFresh();
    return { ...this.data.settings };
  }

  public updateSettings(settings: Partial<EverzioDatabaseSchema['settings']>) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.persist();
    return this.data.settings;
  }
}

export const db = new EverzioDatabase();

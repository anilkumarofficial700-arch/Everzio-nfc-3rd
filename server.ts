import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import {
  resolvePublicCardState,
  getActiveActionLinks,
  buildCardUrl
} from './src/lib/everzio-core.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Helper to extract session token from Authorization header or cookie
function getAuthToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/everzio_session=([^;]+)/);
    if (match) return match[1];
  }
  return undefined;
}

// Admin auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = getAuthToken(req);
  if (!token || !db.isValidSession(token)) {
    res.status(401).json({ error: 'Unauthorized. Admin credentials required.' });
    return;
  }
  next();
}

// -------------------------------------------------------------
// PUBLIC CARD RESOLUTION ROUTE (No Auth Required)
// -------------------------------------------------------------
// Dynamic route: /api/public/card/:cardCode
app.get('/api/public/card/:cardCode', (req: Request, res: Response) => {
  const { cardCode } = req.params;
  const card = db.getCardByCode(cardCode);

  if (!card) {
    res.status(404).json({
      accessible: false,
      reason: 'NOT_FOUND',
      message: 'Card not found.',
      cardCode: (cardCode || '').toUpperCase()
    });
    return;
  }

  const customer = card.customer_id ? db.getCustomerById(card.customer_id) : null;
  const resolution = resolvePublicCardState(card, customer);

  if (!resolution.accessible) {
    res.status(200).json({
      accessible: false,
      reason: resolution.reason,
      message: resolution.message,
      cardCode: card.card_code,
      cardStatus: card.status
    });
    return;
  }

  const settings = db.getSettings();
  const cardUrl = buildCardUrl(settings.baseDomain, card.card_code);
  const menu = db.getMenuByBusinessId(customer!.id) || db.getMenuBySlug(customer!.slug);

  // Record analytics scan event
  db.recordEvent({
    business_id: customer!.id,
    card_id: card.id,
    card_code: card.card_code,
    event_type: 'card_scan',
    metadata: { source: 'nfc_or_qr' }
  });

  res.status(200).json({
    accessible: true,
    reason: 'ACTIVE',
    card: {
      id: card.id,
      card_code: card.card_code,
      status: card.status,
      url: cardUrl
    },
    customer: {
      id: customer!.id,
      slug: customer!.slug,
      business_name: customer!.business_name,
      business_category: customer!.business_category,
      owner_name: customer!.owner_name,
      phone: customer!.phone,
      whatsapp: customer!.whatsapp,
      instagram_url: customer!.instagram_url,
      facebook_url: customer!.facebook_url,
      google_review_url: customer!.google_review_url,
      website_url: customer!.website_url,
      google_maps_url: customer!.google_maps_url,
      wifi_ssid: customer!.wifi_ssid,
      wifi_password: customer!.wifi_password,
      wifi_enabled: customer!.wifi_enabled,
      description: customer!.description,
      logo_url: customer!.logo_url,
      status: customer!.status,
      custom_actions: customer!.custom_actions
    },
    menu: menu ? {
      slug: menu.slug,
      categoriesCount: menu.published_version.categories.length,
      itemsCount: menu.published_version.items.length
    } : undefined,
    actionLinks: getActiveActionLinks(customer!, menu?.slug)
  });
});

// Dynamic Public Digital Menu endpoint: /api/public/menu/:slug
app.get('/api/public/menu/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const menu = db.getMenuBySlug(slug);
  const customer = db.getCustomerBySlug(slug) || (menu ? db.getCustomerById(menu.business_id) : undefined);

  if (!customer) {
    res.status(404).json({ error: 'Business menu not found.' });
    return;
  }

  // Record menu view analytics
  db.recordEvent({
    business_id: customer.id,
    event_type: 'menu_view',
    metadata: { slug }
  });

  res.json({
    customer: {
      id: customer.id,
      slug: customer.slug,
      business_name: customer.business_name,
      business_category: customer.business_category,
      logo_url: customer.logo_url,
      description: customer.description,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      wifi_ssid: customer.wifi_ssid,
      wifi_password: customer.wifi_password,
      wifi_enabled: customer.wifi_enabled
    },
    menu: menu ? menu.published_version : { categories: [], items: [], updated_at: new Date().toISOString() }
  });
});

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const adminProfile = db.getAdminProfile();

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (email.toLowerCase().trim() !== adminProfile.email.toLowerCase()) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (!db.verifyAdminPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = db.createSession();
  res.setHeader('Set-Cookie', `everzio_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);
  res.json({
    success: true,
    token,
    user: adminProfile
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (!token || !db.isValidSession(token)) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({
    authenticated: true,
    user: db.getAdminProfile()
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (token) {
    db.removeSession(token);
  }
  res.setHeader('Set-Cookie', `everzio_session=; Path=/; HttpOnly; Max-Age=0`);
  res.json({ success: true });
});

// -------------------------------------------------------------
// ADMIN PROTECTED ROUTES
// -------------------------------------------------------------

// Dashboard Stats
app.get('/api/stats', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getStats());
});

// Customers CRUD
app.get('/api/customers', requireAdmin, (_req: Request, res: Response) => {
  const customers = db.getCustomers();
  const cards = db.getCards();

  // Attach assigned cards to each customer in summary
  const enriched = customers.map(cust => {
    const custCards = cards.filter(c => c.customer_id === cust.id);
    return {
      ...cust,
      cardsCount: custCards.length,
      cardCodes: custCards.map(c => c.card_code)
    };
  });

  res.json(enriched);
});

app.get('/api/customers/:id', requireAdmin, (req: Request, res: Response) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  const assignedCards = db.getCardsForCustomer(customer.id);
  res.json({
    ...customer,
    assignedCards
  });
});

app.post('/api/customers', requireAdmin, (req: Request, res: Response) => {
  const {
    business_name,
    business_category,
    owner_name,
    phone,
    whatsapp,
    instagram_url,
    facebook_url,
    google_review_url,
    website_url,
    google_maps_url,
    description,
    logo_url,
    status
  } = req.body;

  if (!business_name || !business_name.trim()) {
    res.status(400).json({ error: 'Business name is required' });
    return;
  }

  const customer = db.createCustomer({
    business_name: business_name.trim(),
    business_category: (business_category || '').trim(),
    owner_name: (owner_name || '').trim(),
    phone: (phone || '').trim(),
    whatsapp: (whatsapp || '').trim(),
    instagram_url: (instagram_url || '').trim(),
    facebook_url: (facebook_url || '').trim(),
    google_review_url: (google_review_url || '').trim(),
    website_url: (website_url || '').trim(),
    google_maps_url: (google_maps_url || '').trim(),
    description: (description || '').trim(),
    logo_url: (logo_url || '').trim(),
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'
  });

  res.status(201).json(customer);
});

app.put('/api/customers/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateCustomer(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteCustomer(req.params.id);
    res.json({ success: true, message: 'Customer deleted and cards unassigned' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.patch('/api/customers/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  try {
    const updated = db.setCustomerStatus(req.params.id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Cards CRUD
app.get('/api/cards', requireAdmin, (_req: Request, res: Response) => {
  const cards = db.getCards();
  const customers = db.getCustomers();
  const settings = db.getSettings();

  const enriched = cards.map(card => {
    const customer = card.customer_id ? customers.find(c => c.id === card.customer_id) : null;
    return {
      ...card,
      url: buildCardUrl(settings.baseDomain, card.card_code),
      customer_name: customer ? customer.business_name : null,
      customer_category: customer ? customer.business_category : null
    };
  });

  res.json(enriched);
});

app.post('/api/cards', requireAdmin, (req: Request, res: Response) => {
  const { customCode, customerId } = req.body;
  try {
    const card = db.createCard(customCode, customerId);
    const settings = db.getSettings();
    res.status(201).json({
      ...card,
      url: buildCardUrl(settings.baseDomain, card.card_code)
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/cards/:id/assign', requireAdmin, (req: Request, res: Response) => {
  const { customerId } = req.body;
  try {
    const card = db.assignCard(req.params.id, customerId || null);
    res.json(card);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/cards/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['AVAILABLE', 'ASSIGNED', 'ACTIVE', 'INACTIVE'].includes(status)) {
    res.status(400).json({ error: 'Invalid card status' });
    return;
  }
  try {
    const card = db.setCardStatus(req.params.id, status);
    res.json(card);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/cards/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteCard(req.params.id);
    res.json({ success: true, message: 'Card deleted' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Settings & Reset
app.get('/api/settings', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const { baseDomain } = req.body;
  const updated = db.updateSettings({ baseDomain });
  res.json(updated);
});

app.post('/api/admin/reset-demo', requireAdmin, (_req: Request, res: Response) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Database reset to default demo businesses and cards' });
});

// -------------------------------------------------------------
// ADMIN MENUS, SUBSCRIPTIONS & ANALYTICS
// -------------------------------------------------------------
app.get('/api/admin/menus', requireAdmin, (_req: Request, res: Response) => {
  const menus = db.getMenus();
  const customers = db.getCustomers();
  const enriched = menus.map(m => {
    const cust = customers.find(c => c.id === m.business_id);
    return {
      ...m,
      business_name: cust ? cust.business_name : m.slug,
      business_category: cust ? cust.business_category : '',
      subscription_status: cust ? cust.subscription_status : 'ACTIVE',
      subscription_expires_at: cust ? cust.subscription_expires_at : undefined
    };
  });
  res.json(enriched);
});

app.get('/api/admin/subscriptions', requireAdmin, (_req: Request, res: Response) => {
  const customers = db.getCustomers();
  const subscriptions = customers.map(c => ({
    id: c.id,
    business_name: c.business_name,
    business_category: c.business_category,
    slug: c.slug,
    owner_name: c.owner_name,
    owner_email: c.owner_email,
    subscription_status: c.subscription_status,
    subscription_expires_at: c.subscription_expires_at,
    cardsCount: db.getCardsForCustomer(c.id).length
  }));
  res.json(subscriptions);
});

app.patch('/api/admin/subscriptions/:id', requireAdmin, (req: Request, res: Response) => {
  const { subscription_status, expires_at } = req.body;
  try {
    const updated = db.setCustomerSubscription(req.params.id, subscription_status, expires_at);
    res.json({
      success: true,
      subscription_status: updated.subscription_status,
      subscription_expires_at: updated.subscription_expires_at
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/analytics', requireAdmin, (_req: Request, res: Response) => {
  const events = db.getEvents();
  const stats = {
    totalEvents: events.length,
    scansCount: events.filter(e => e.event_type === 'card_scan').length,
    menuViewsCount: events.filter(e => e.event_type === 'menu_view').length,
    profileViewsCount: events.filter(e => e.event_type === 'profile_view').length,
    recentEvents: events.slice(-40).reverse()
  };
  res.json(stats);
});

// -------------------------------------------------------------
// BUSINESS OWNER AUTH & MENU MANAGEMENT (Sections 15-22)
// -------------------------------------------------------------
function getOwnerToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return undefined;
}

function requireOwner(req: Request, res: Response, next: NextFunction): void {
  const token = getOwnerToken(req);
  const customer = db.getCustomerBySessionToken(token);
  if (!customer) {
    res.status(401).json({ error: 'Unauthorized. Business owner login required.' });
    return;
  }
  (req as any).ownerCustomer = customer;
  next();
}

app.post('/api/owner/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  const customer = db.verifyCustomerLogin(email, password);
  if (!customer) {
    res.status(401).json({ error: 'Invalid business owner email/slug or password' });
    return;
  }
  const token = db.createCustomerSession(customer.id);
  res.json({
    success: true,
    token,
    customer: {
      id: customer.id,
      slug: customer.slug,
      business_name: customer.business_name,
      business_category: customer.business_category,
      owner_name: customer.owner_name,
      owner_email: customer.owner_email,
      subscription_status: customer.subscription_status,
      subscription_expires_at: customer.subscription_expires_at
    }
  });
});

app.get('/api/owner/me', requireOwner, (req: Request, res: Response) => {
  const customer = (req as any).ownerCustomer;
  res.json({
    authenticated: true,
    customer: {
      id: customer.id,
      slug: customer.slug,
      business_name: customer.business_name,
      business_category: customer.business_category,
      owner_name: customer.owner_name,
      owner_email: customer.owner_email,
      subscription_status: customer.subscription_status,
      subscription_expires_at: customer.subscription_expires_at
    }
  });
});

app.post('/api/owner/logout', (req: Request, res: Response) => {
  const token = getOwnerToken(req);
  if (token) {
    db.removeCustomerSession(token);
  }
  res.json({ success: true });
});

app.get('/api/owner/menu', requireOwner, (req: Request, res: Response) => {
  const customer = (req as any).ownerCustomer;
  const menu = db.getMenuByBusinessId(customer.id);
  res.json({
    customer: {
      id: customer.id,
      slug: customer.slug,
      business_name: customer.business_name,
      subscription_status: customer.subscription_status,
      subscription_expires_at: customer.subscription_expires_at
    },
    menu
  });
});

app.put('/api/owner/menu/draft', requireOwner, (req: Request, res: Response) => {
  const customer = (req as any).ownerCustomer;
  const { categories, items } = req.body;
  try {
    const updated = db.updateMenuDraft(customer.id, {
      categories: categories || [],
      items: items || [],
      updated_at: new Date().toISOString()
    });
    res.json({ success: true, menu: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/owner/menu/publish', requireOwner, (req: Request, res: Response) => {
  const customer = (req as any).ownerCustomer;
  const result = db.publishMenu(customer.id, customer.owner_name || customer.business_name);
  if (!result.success) {
    res.status(403).json({
      success: false,
      error: result.message,
      menu: result.menu
    });
    return;
  }
  res.json({ success: true, menu: result.menu, message: result.message });
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EVERZIO server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

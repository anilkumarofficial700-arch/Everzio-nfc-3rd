import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateUniqueCardCode,
  isValidCardCode,
  generateSlug,
  buildCardUrl,
  buildBusinessProfileUrl,
  buildMenuUrl,
  formatWhatsAppUrl,
  formatTelUrl,
  canPublishMenu,
  resolvePublicCardState,
  getActiveActionLinks,
  type Card,
  type Customer
} from './everzio-core.ts';

test('generateUniqueCardCode generates EVZ + 6 unique digits and prevents duplicates', () => {
  const existing = ['EVZ482731', 'EVZ105924'];
  const newCode = generateUniqueCardCode(existing);
  assert.match(newCode, /^EVZ\d{6}$/);
  assert.ok(!existing.includes(newCode));
});

test('isValidCardCode validates 6-digit standard and legacy 5-digit cards', () => {
  assert.equal(isValidCardCode('EVZ482731'), true);
  assert.equal(isValidCardCode('EVZ105924'), true);
  assert.equal(isValidCardCode('EVZ00001'), true); // legacy compatibility
  assert.equal(isValidCardCode('INVALID'), false);
  assert.equal(isValidCardCode('EVZ123'), false); // too short
  assert.equal(isValidCardCode(''), false);
});

test('generateSlug generates clean url slugs and handles collisions', () => {
  assert.equal(generateSlug('Shyam Restaurant'), 'shyam-restaurant');
  assert.equal(generateSlug('Royal Restaurant & Bar!'), 'royal-restaurant-bar');
  assert.equal(generateSlug('Shyam Restaurant', ['shyam-restaurant']), 'shyam-restaurant-2');
});

test('buildBusinessProfileUrl and buildMenuUrl create canonical URLs', () => {
  assert.equal(
    buildBusinessProfileUrl('https://everzio.in', 'shyam-restaurant'),
    'https://everzio.in/c/shyam-restaurant'
  );
  assert.equal(
    buildMenuUrl('https://everzio.in', 'shyam-restaurant'),
    'https://everzio.in/menu/shyam-restaurant'
  );
});

test('canPublishMenu enforces subscription status rules', () => {
  // Active without expiration
  assert.deepEqual(canPublishMenu('ACTIVE', null), { allowed: true });

  // Active with future expiration
  const future = new Date(Date.now() + 86400000 * 30).toISOString();
  assert.deepEqual(canPublishMenu('ACTIVE', future), { allowed: true });

  // Active but expired date
  const past = new Date(Date.now() - 86400000).toISOString();
  const expiredCheck = canPublishMenu('ACTIVE', past);
  assert.equal(expiredCheck.allowed, false);
  assert.match(expiredCheck.reason || '', /expired/i);

  // Expired status
  assert.equal(canPublishMenu('EXPIRED', null).allowed, false);

  // Pending status
  assert.equal(canPublishMenu('PENDING', null).allowed, false);

  // No subscription
  assert.equal(canPublishMenu('NO_SUBSCRIPTION', null).allowed, false);
});

test('getActiveActionLinks includes VIEW MENU, WI-FI, and standard buttons', () => {
  const customer: Customer = {
    id: 'cust-shyam',
    slug: 'shyam-restaurant',
    business_name: 'Shyam Restaurant',
    business_category: 'Pure Veg Family Restaurant',
    owner_name: 'Shyam Sundar',
    phone: '+91 98111 22233',
    whatsapp: '+91 98111 22233',
    instagram_url: 'https://instagram.com/shyam_restaurant',
    facebook_url: '',
    google_review_url: 'https://g.page/r/shyam/review',
    website_url: 'https://shyamrestaurant.in',
    google_maps_url: 'https://maps.google.com/?q=Shyam+Restaurant',
    wifi_ssid: 'Shyam_Guest_WiFi',
    wifi_password: 'WelcomeShyam2026',
    wifi_enabled: true,
    description: 'Serving delicious Indian meals and thalis.',
    logo_url: '',
    status: 'ACTIVE',
    subscription_status: 'ACTIVE',
    custom_actions: [
      {
        id: 'action-zomato',
        label: 'Order on Zomato',
        type: 'custom',
        value: 'https://zomato.com/shyam',
        enabled: true,
        display_order: 10
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const links = getActiveActionLinks(customer, 'shyam-restaurant');
  const types = links.map(l => l.type);

  assert.ok(types.includes('view_menu'), 'Must include view_menu');
  assert.ok(types.includes('whatsapp'), 'Must include whatsapp');
  assert.ok(types.includes('call'), 'Must include call');
  assert.ok(types.includes('google_review'), 'Must include google_review');
  assert.ok(types.includes('wifi'), 'Must include wifi');
  assert.ok(types.includes('custom'), 'Must include custom extensible actions');

  const wifiLink = links.find(l => l.type === 'wifi');
  assert.equal(wifiLink?.metadata?.ssid, 'Shyam_Guest_WiFi');
  assert.equal(wifiLink?.metadata?.hasPassword, true);
});

test('resolvePublicCardState handles active, unassigned, and inactive cards correctly', () => {
  const customer: Customer = {
    id: 'cust-1',
    slug: 'royal-restaurant',
    business_name: 'Royal Restaurant',
    business_category: 'Fine Dining',
    owner_name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    instagram_url: '',
    facebook_url: '',
    google_review_url: '',
    website_url: '',
    google_maps_url: '',
    description: '',
    logo_url: '',
    status: 'ACTIVE',
    subscription_status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const card: Card = {
    id: 'card-1',
    card_code: 'EVZ482731',
    customer_id: 'cust-1',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const res = resolvePublicCardState(card, customer);
  assert.equal(res.accessible, true);
  assert.equal(res.customer?.business_name, 'Royal Restaurant');

  // Inactive card
  const inactiveCard: Card = { ...card, status: 'INACTIVE' };
  assert.equal(resolvePublicCardState(inactiveCard, customer).accessible, false);
  assert.equal(resolvePublicCardState(inactiveCard, customer).message, 'This Everzio card is currently inactive.');

  // Unassigned card
  const unassignedCard: Card = { ...card, customer_id: null, status: 'AVAILABLE' };
  assert.equal(resolvePublicCardState(unassignedCard, null).accessible, false);
  assert.equal(resolvePublicCardState(unassignedCard, null).message, 'This card has not been assigned yet.');
});

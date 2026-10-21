import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db.ts';

test('database initializes with default demo data (Royal Restaurant, Sharma Hotel, Urban Salon)', () => {
  const customers = db.getCustomers();
  assert.ok(customers.length >= 3);

  const royal = customers.find(c => c.business_name === 'Royal Restaurant');
  assert.ok(royal, 'Royal Restaurant must exist');
  assert.equal(royal?.status, 'ACTIVE');
  assert.ok(royal?.slug, 'Must have slug');

  const sharma = customers.find(c => c.business_name === 'Sharma Hotel');
  assert.ok(sharma, 'Sharma Hotel must exist');

  const urban = customers.find(c => c.business_name === 'Urban Salon');
  assert.ok(urban, 'Urban Salon must exist');
});

test('cards are seeded and linked properly (EVZ482731 / legacy EVZ00001 -> Royal Restaurant)', () => {
  const card1 = db.getCardByCode('EVZ482731') || db.getCardByCode('EVZ00001');
  assert.ok(card1, 'Card for Royal Restaurant must exist');
  assert.equal(card1?.status, 'ACTIVE');

  const royal = db.getCustomerById(card1!.customer_id!);
  assert.ok(royal, 'Customer for card must be found');
  assert.equal(royal?.business_name, 'Royal Restaurant');
});

test('ONE BUSINESS -> MANY PHYSICAL CARDS relationship works seamlessly', () => {
  const royal = db.getCustomers().find(c => c.business_name === 'Royal Restaurant')!;
  
  // Issue 3 distinct cards to Royal Restaurant with EVZ + 6 digits
  const cardA = db.createCard();
  const cardB = db.createCard();
  const cardC = db.createCard();

  assert.match(cardA.card_code, /^EVZ\d{6}$/);
  assert.match(cardB.card_code, /^EVZ\d{6}$/);
  assert.match(cardC.card_code, /^EVZ\d{6}$/);

  db.assignCard(cardA.id, royal.id);
  db.assignCard(cardB.id, royal.id);
  db.assignCard(cardC.id, royal.id);

  // All 3 cards resolve to the same Royal Restaurant
  const resA = db.getCustomerById(db.getCardByCode(cardA.card_code)!.customer_id!);
  const resB = db.getCustomerById(db.getCardByCode(cardB.card_code)!.customer_id!);
  const resC = db.getCustomerById(db.getCardByCode(cardC.card_code)!.customer_id!);

  assert.equal(resA?.id, royal.id);
  assert.equal(resB?.id, royal.id);
  assert.equal(resC?.id, royal.id);
  assert.equal(resA?.slug, royal.slug);

  // Clean up test cards
  db.deleteCard(cardA.id);
  db.deleteCard(cardB.id);
  db.deleteCard(cardC.id);
});

test('digital menu publishing respects subscription status', () => {
  const royal = db.getCustomers().find(c => c.business_name === 'Royal Restaurant')!;
  let menu = db.getMenuByBusinessId(royal.id)!;
  assert.ok(menu, 'Royal Restaurant must have a digital menu');

  // Update draft
  const newVersion = {
    categories: [...menu.published_version.categories],
    items: [
      ...menu.published_version.items,
      {
        id: 'test_item_99',
        category_id: menu.published_version.categories[0].id,
        name: 'Saffron Kulfi Falooda',
        description: 'Traditional slow-churned condensed milk kulfi with rose syrup.',
        price: 150,
        display_order: 9,
        visible: true,
        available: true
      }
    ],
    updated_at: new Date().toISOString()
  };

  db.updateMenuDraft(royal.id, newVersion);
  menu = db.getMenuByBusinessId(royal.id)!;
  assert.equal(menu.pending_status, 'PENDING_APPROVAL');

  // Case 1: Active subscription publishes immediately
  const publishResult = db.publishMenu(royal.id, 'test-owner');
  assert.equal(publishResult.success, true);
  assert.equal(publishResult.menu?.pending_status, 'NONE');
  assert.ok(publishResult.menu?.published_version.items.some(i => i.name === 'Saffron Kulfi Falooda'));

  // Case 2: Inactive / expired subscription blocks publishing
  db.setCustomerSubscription(royal.id, 'EXPIRED');
  db.updateMenuDraft(royal.id, newVersion);
  const blockedResult = db.publishMenu(royal.id, 'test-owner');
  assert.equal(blockedResult.success, false);
  assert.match(blockedResult.message || '', /expired/i);

  // Restore active subscription
  db.setCustomerSubscription(royal.id, 'ACTIVE');
});

test('customer menu login authentication verifies credentials', () => {
  const royal = db.getCustomers().find(c => c.business_name === 'Royal Restaurant')!;
  assert.ok(royal.owner_email);

  // Correct credentials
  const valid = db.verifyCustomerLogin(royal.owner_email!, 'EverzioOwner@2026!');
  assert.ok(valid, 'Valid credentials should authenticate');
  assert.equal(valid?.id, royal.id);

  // Incorrect credentials
  const invalid = db.verifyCustomerLogin(royal.owner_email!, 'WrongPassword!');
  assert.equal(invalid, null);

  // Session token creation and validation
  const token = db.createCustomerSession(royal.id);
  assert.ok(token);
  const sessionUser = db.getCustomerBySessionToken(token);
  assert.equal(sessionUser?.id, royal.id);

  db.removeCustomerSession(token);
  assert.equal(db.getCustomerBySessionToken(token), null);
});

test('analytics events can be recorded and queried', () => {
  const royal = db.getCustomers().find(c => c.business_name === 'Royal Restaurant')!;
  const event = db.recordEvent({
    business_id: royal.id,
    card_code: 'EVZ482731',
    event_type: 'card_scan',
    metadata: { source: 'nfc_tap' }
  });

  assert.ok(event.id);
  assert.equal(event.event_type, 'card_scan');
  assert.equal(event.business_id, royal.id);

  const events = db.getEvents(royal.id);
  assert.ok(events.some(e => e.id === event.id));
});

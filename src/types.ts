export type {
  CardStatus,
  CustomerStatus,
  SubscriptionStatus,
  CustomActionButton,
  MenuItem,
  MenuCategory,
  MenuVersion,
  MenuUpdateHistoryItem,
  DigitalMenu,
  Customer,
  Card,
  AnalyticsEvent,
  ActionLinkItem,
  PublicCardResolution
} from './lib/everzio-core';

import type {
  Customer,
  Card,
  ActionLinkItem,
  CardStatus,
  SubscriptionStatus,
  MenuVersion,
  DigitalMenu,
  AnalyticsEvent
} from './lib/everzio-core';

export interface PublicCardResponse {
  accessible: boolean;
  reason: 'ACTIVE' | 'NOT_FOUND' | 'NOT_ASSIGNED' | 'CARD_INACTIVE' | 'CUSTOMER_INACTIVE';
  message?: string;
  cardCode?: string;
  cardStatus?: CardStatus;
  card?: {
    id: string;
    card_code: string;
    status: CardStatus;
    url: string;
  };
  customer?: Customer;
  menu?: {
    slug: string;
    categoriesCount: number;
    itemsCount: number;
  };
  actionLinks?: ActionLinkItem[];
}

export interface DashboardStats {
  totalCustomers: number;
  totalCards: number;
  activeCards: number;
  availableCards: number;
  totalMenus: number;
  activeSubscriptions: number;
}

export interface PublicMenuResponse {
  customer: Partial<Customer>;
  menu: MenuVersion;
}

export interface OwnerAuthResponse {
  authenticated: boolean;
  customer?: Customer;
}

export interface AdminMenuSummary extends DigitalMenu {
  business_name: string;
  business_category: string;
  subscription_status: string;
  subscription_expires_at?: string;
}

export interface SubscriptionItem {
  id: string;
  business_name: string;
  business_category: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  subscription_status: SubscriptionStatus;
  subscription_expires_at?: string;
  cardsCount: number;
}

export interface AnalyticsStats {
  totalEvents: number;
  scansCount: number;
  menuViewsCount: number;
  profileViewsCount: number;
  recentEvents: AnalyticsEvent[];
}

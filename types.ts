
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  profilePic?: string;
  address?: string;
  totalSpent: number;
  lastVisit: string;
  balance: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  BILLING = 'BILLING',
  INVENTORY = 'INVENTORY',
  CUSTOMERS = 'CUSTOMERS',
  SUBSCRIPTION = 'SUBSCRIPTION',
  REPORTS = 'REPORTS'
}

export type Language = 'en' | 'ur';

export type UserStatus = 'trial' | 'premium' | 'trial_expired';

export interface UserSession {
  mobileNumber: string;
  status: UserStatus;
  trialStartDate: string; // ISO String
  premiumExpiryDate?: string; // ISO String
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'subscription' | 'unpaid';
  message: string;
  timestamp: string;
  isRead: boolean;
}

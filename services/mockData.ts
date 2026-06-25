// Powered by OnSpace.AI (Cleaned for Production)
export type RestaurantStatus = 'open' | 'closed' | 'busy';
export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
export type RiderStatus = 'on_the_way' | 'picked_up' | 'delivered';
export type StaffRole = 'accountant' | 'call_center';

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  category: string;
  prepTime: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface OrderItem {
  menuItemId: string;
  nameEn: string;
  nameAr: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  adminCommission: number;
  netEarning: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  riderId?: string;
  specialInstructions?: string;
  estimatedTime?: number;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  isVisible: boolean;
  status: RiderStatus;
  currentOrderId?: string;
  lastLocation?: { lat: number; lng: number; address: string };
  assignedAt?: Date;
}

export interface RestaurantInfo {
  id: string;
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  email: string;
  status: RestaurantStatus;
  latitude: number;
  longitude: number;
  averagePrepTime: number;
  adminCommissionEGP: number;    // fixed EGP commission per order
  dailyClosingTime: string;      // "HH:MM" 24h format, e.g. "22:00"
}

export interface DailyReport {
  date: string;            // "YYYY-MM-DD"
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  grossRevenue: number;
  totalCommission: number;
  netRevenue: number;
  closedAt?: string;       // ISO string when report was closed
}

export const MOCK_USER = {
  email: '',
  password: '',
  name: '',
  restaurantId: '',
};

export const MOCK_STAFF: StaffMember[] = [];
export const MOCK_RESTAURANT: RestaurantInfo = {
  id: '',
  nameEn: '',
  nameAr: '',
  addressEn: '',
  addressAr: '',
  phone: '',
  email: '',
  status: 'closed',
  latitude: 0,
  longitude: 0,
  averagePrepTime: 0,
  adminCommissionEGP: 0,
  dailyClosingTime: '22:00',
};

export const MENU_CATEGORIES = [
  { id: 'all', labelEn: 'All', labelAr: 'الكل' },
  { id: 'appetizers', labelEn: 'Appetizers', labelAr: 'مقبلات' },
  { id: 'main', labelEn: 'Main Course', labelAr: 'أطباق رئيسية' },
  { id: 'sandwiches', labelEn: 'Sandwiches', labelAr: 'سندوتشات' },
  { id: 'grills', labelEn: 'Grills', labelAr: 'مشويات' },
  { id: 'seafood', labelEn: 'Seafood', labelAr: 'مأكولات بحرية' },
  { id: 'desserts', labelEn: 'Desserts', labelAr: 'حلويات' },
  { id: 'drinks', labelEn: 'Drinks', labelAr: 'مشروبات' },
  { id: 'sides', labelEn: 'Sides', labelAr: 'إضافات' },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [];
export const MOCK_ORDERS: Order[] = [];
export const MOCK_DAILY_REPORTS: DailyReport[] = [];
export const MOCK_RIDERS: Rider[] = [];

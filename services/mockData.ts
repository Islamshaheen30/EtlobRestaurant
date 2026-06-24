// Powered by OnSpace.AI
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
  email: 'owner@etlob.com',
  password: '123456',
  name: 'Ahmed Hassan',
  restaurantId: 'rest_001',
};

export const MOCK_STAFF: StaffMember[] = [
  {
    id: 'staff_001',
    name: 'Hana Mostafa',
    username: 'hana_acc',
    password: 'acc123',
    role: 'accountant',
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'staff_002',
    name: 'Karim Adel',
    username: 'karim_cc',
    password: 'cc456',
    role: 'call_center',
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

export const MOCK_RESTAURANT: RestaurantInfo = {
  id: 'rest_001',
  nameEn: 'Koshary El-Tahrir',
  nameAr: 'كشري التحرير',
  addressEn: '14 Tahrir Square, Cairo, Egypt',
  addressAr: '١٤ ميدان التحرير، القاهرة، مصر',
  phone: '+20 2 2392 0000',
  email: 'owner@etlob.com',
  status: 'open',
  latitude: 30.0444,
  longitude: 31.2357,
  averagePrepTime: 20,
  adminCommissionEGP: 15,
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

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item_001',
    nameEn: 'Classic Koshary',
    nameAr: 'كشري كلاسيك',
    descriptionEn: 'Rice, lentils, pasta with tomato sauce and crispy onions',
    descriptionAr: 'أرز وعدس ومكرونة مع صلصة الطماطم والبصل المقرمش',
    price: 35,
    category: 'main',
    prepTime: 10,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  },
  {
    id: 'item_002',
    nameEn: 'Large Koshary',
    nameAr: 'كشري كبير',
    descriptionEn: 'Extra large portion with double sauce',
    descriptionAr: 'حصة كبيرة إضافية مع صلصة مضاعفة',
    price: 55,
    category: 'main',
    prepTime: 10,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  },
  {
    id: 'item_003',
    nameEn: 'Falafel Sandwich',
    nameAr: 'سندوتش فلافل',
    descriptionEn: 'Crispy falafel with tahini, tomatoes and herbs',
    descriptionAr: 'فلافل مقرمشة مع طحينة وطماطم وأعشاب',
    price: 25,
    category: 'sandwiches',
    prepTime: 8,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    id: 'item_004',
    nameEn: 'Lentil Soup',
    nameAr: 'شوربة عدس',
    descriptionEn: 'Warm red lentil soup with lemon and cumin',
    descriptionAr: 'شوربة عدس أحمر دافئة مع ليمون وكمون',
    price: 20,
    category: 'appetizers',
    prepTime: 5,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
  },
  {
    id: 'item_005',
    nameEn: 'Mixed Grill Platter',
    nameAr: 'طبق مشويات مشكلة',
    descriptionEn: 'Assorted grilled meats with rice and salad',
    descriptionAr: 'مشويات متنوعة مع أرز وسلطة',
    price: 150,
    category: 'grills',
    prepTime: 25,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  },
  {
    id: 'item_006',
    nameEn: 'Om Ali',
    nameAr: 'أم علي',
    descriptionEn: 'Traditional Egyptian bread pudding with cream and nuts',
    descriptionAr: 'حلوى أم علي المصرية التقليدية بالقشطة والمكسرات',
    price: 45,
    category: 'desserts',
    prepTime: 15,
    isAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
  },
  {
    id: 'item_007',
    nameEn: 'Fresh Mango Juice',
    nameAr: 'عصير مانجو طازج',
    descriptionEn: 'Freshly squeezed Egyptian mango juice',
    descriptionAr: 'عصير مانجو مصري طازج معصور',
    price: 30,
    category: 'drinks',
    prepTime: 5,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
  },
  {
    id: 'item_008',
    nameEn: 'Grilled Sea Bass',
    nameAr: 'قاروص مشوي',
    descriptionEn: 'Fresh sea bass grilled with herbs and lemon',
    descriptionAr: 'قاروص طازج مشوي مع أعشاب وليمون',
    price: 180,
    category: 'seafood',
    prepTime: 30,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
  },
];

function makeOrder(
  id: string, num: string, customer: string, phone: string,
  address: string, items: OrderItem[], total: number, status: OrderStatus,
  minsAgo: number, commission: number, riderId?: string, estimatedTime?: number
): Order {
  return {
    id, orderNumber: num, customerName: customer, customerPhone: phone,
    deliveryAddress: address, items, subtotal: total,
    adminCommission: commission, netEarning: total - commission,
    total, status,
    createdAt: new Date(Date.now() - minsAgo * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.floor(minsAgo * 0.5) * 60 * 1000),
    riderId, estimatedTime,
  };
}

export const MOCK_ORDERS: Order[] = [
  makeOrder('ord_001', '#1042', 'Sara Mohamed', '+20 100 123 4567', '5 Nasr City, Cairo',
    [
      { menuItemId: 'item_001', nameEn: 'Classic Koshary', nameAr: 'كشري كلاسيك', quantity: 2, price: 35 },
      { menuItemId: 'item_004', nameEn: 'Lentil Soup', nameAr: 'شوربة عدس', quantity: 1, price: 20 },
    ], 90, 'new', 2, 15),
  makeOrder('ord_002', '#1041', 'Khaled Ali', '+20 101 234 5678', '12 Heliopolis, Cairo',
    [
      { menuItemId: 'item_005', nameEn: 'Mixed Grill Platter', nameAr: 'طبق مشويات مشكلة', quantity: 1, price: 150 },
      { menuItemId: 'item_007', nameEn: 'Fresh Mango Juice', nameAr: 'عصير مانجو طازج', quantity: 2, price: 30 },
    ], 210, 'preparing', 20, 15, 'rider_001', 15),
  makeOrder('ord_003', '#1040', 'Mona Hassan', '+20 102 345 6789', '8 Maadi, Cairo',
    [{ menuItemId: 'item_003', nameEn: 'Falafel Sandwich', nameAr: 'سندوتش فلافل', quantity: 3, price: 25 }],
    75, 'ready', 35, 15, 'rider_002'),
  makeOrder('ord_004', '#1039', 'Omar Tarek', '+20 103 456 7890', '22 Dokki, Giza',
    [
      { menuItemId: 'item_002', nameEn: 'Large Koshary', nameAr: 'كشري كبير', quantity: 1, price: 55 },
      { menuItemId: 'item_006', nameEn: 'Om Ali', nameAr: 'أم علي', quantity: 1, price: 45 },
    ], 100, 'delivered', 90, 15, 'rider_001'),
  makeOrder('ord_005', '#1038', 'Nadia Farouk', '+20 104 567 8901', '3 Zamalek, Cairo',
    [
      { menuItemId: 'item_008', nameEn: 'Grilled Sea Bass', nameAr: 'قاروص مشوي', quantity: 2, price: 180 },
      { menuItemId: 'item_007', nameEn: 'Fresh Mango Juice', nameAr: 'عصير مانجو طازج', quantity: 2, price: 30 },
    ], 420, 'picked_up', 60, 15, 'rider_002'),
  makeOrder('ord_006', '#1037', 'Youssef Nabil', '+20 105 678 9012', '9 New Cairo',
    [{ menuItemId: 'item_005', nameEn: 'Mixed Grill Platter', nameAr: 'طبق مشويات مشكلة', quantity: 2, price: 150 }],
    300, 'delivered', 120, 15, 'rider_001'),
  makeOrder('ord_007', '#1036', 'Dina Sameh', '+20 106 789 0123', '17 6th of October',
    [
      { menuItemId: 'item_001', nameEn: 'Classic Koshary', nameAr: 'كشري كلاسيك', quantity: 3, price: 35 },
      { menuItemId: 'item_007', nameEn: 'Fresh Mango Juice', nameAr: 'عصير مانجو طازج', quantity: 3, price: 30 },
    ], 195, 'delivered', 150, 15),
  makeOrder('ord_008', '#1035', 'Tarek Gamal', '+20 107 890 1234', '4 Mohandessin, Giza',
    [{ menuItemId: 'item_003', nameEn: 'Falafel Sandwich', nameAr: 'سندوتش فلافل', quantity: 2, price: 25 }],
    50, 'cancelled', 180, 15),
];

// Generate 90-day historical reports
function generateHistoricalReports(): DailyReport[] {
  const reports: DailyReport[] = [];
  const now = new Date();
  for (let d = 89; d >= 1; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const totalOrders = Math.floor(Math.random() * 30) + 10;
    const cancelledOrders = Math.floor(Math.random() * 4);
    const completedOrders = totalOrders - cancelledOrders;
    const grossRevenue = completedOrders * (Math.floor(Math.random() * 150) + 60);
    const totalCommission = completedOrders * 15;
    reports.push({
      date: dateStr,
      totalOrders,
      completedOrders,
      cancelledOrders,
      grossRevenue,
      totalCommission,
      netRevenue: grossRevenue - totalCommission,
      closedAt: new Date(date.setHours(22, 0, 0, 0)).toISOString(),
    });
  }
  return reports;
}

export const MOCK_DAILY_REPORTS: DailyReport[] = generateHistoricalReports();

export const MOCK_RIDERS: Rider[] = [
  {
    id: 'rider_001',
    name: 'Mohamed Sayed',
    phone: '+20 100 999 1111',
    isVisible: true,
    status: 'picked_up',
    currentOrderId: 'ord_002',
    lastLocation: { lat: 30.0561, lng: 31.2394, address: 'Heliopolis, Cairo' },
    assignedAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: 'rider_002',
    name: 'Hassan Ibrahim',
    phone: '+20 101 888 2222',
    isVisible: true,
    status: 'on_the_way',
    currentOrderId: 'ord_003',
    lastLocation: { lat: 30.0131, lng: 31.2089, address: 'Maadi, Cairo' },
    assignedAt: new Date(Date.now() - 40 * 60 * 1000),
  },
];

// Powered by OnSpace.AI
import React, { createContext, useState, ReactNode, useCallback, useMemo } from 'react';
import {
  RestaurantStatus, MenuItem, Order, Rider, RestaurantInfo,
  OrderStatus, StaffMember, DailyReport,
  MOCK_RESTAURANT, MOCK_MENU_ITEMS, MOCK_ORDERS, MOCK_RIDERS, MOCK_STAFF, MOCK_DAILY_REPORTS,
} from '@/services/mockData';

interface FinancialSummary {
  todayGross: number;
  todayCommission: number;
  todayNet: number;
  todayCompleted: number;
  todayCancelled: number;
  todayTotal: number;
}

interface RestaurantContextType {
  restaurant: RestaurantInfo;
  menuItems: MenuItem[];
  orders: Order[];
  riders: Rider[];
  staff: StaffMember[];
  dailyReports: DailyReport[];
  financials: FinancialSummary;
  setRestaurantStatus: (status: RestaurantStatus) => void;
  updateRestaurant: (info: Partial<RestaurantInfo>) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  markOrderReady: (orderId: string) => void;
  updateRiderVisibility: (riderId: string, visible: boolean) => void;
  autoHideRiderOnDelivery: (riderId: string) => void;
  addStaff: (member: Omit<StaffMember, 'id' | 'createdAt'>) => boolean;
  updateStaff: (id: string, data: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  triggerDailyClose: () => DailyReport;
}

export const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantInfo>(MOCK_RESTAURANT);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(MOCK_RIDERS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(MOCK_DAILY_REPORTS);

  // ─── Financial Summary (today's data from current orders) ───────────────────
  const financials = useMemo((): FinancialSummary => {
    const todayOrders = orders; // In mock, all orders count as "today"
    const completed = todayOrders.filter(o => o.status === 'delivered');
    const cancelled = todayOrders.filter(o => o.status === 'cancelled');
    const gross = completed.reduce((s, o) => s + o.total, 0);
    const commission = completed.reduce((s, o) => s + o.adminCommission, 0);
    return {
      todayGross: gross,
      todayCommission: commission,
      todayNet: gross - commission,
      todayCompleted: completed.length,
      todayCancelled: cancelled.length,
      todayTotal: todayOrders.length,
    };
  }, [orders, restaurant.adminCommissionEGP]);

  // ─── Restaurant ─────────────────────────────────────────────────────────────
  const setRestaurantStatus = useCallback((status: RestaurantStatus) => {
    setRestaurant(prev => ({ ...prev, status }));
  }, []);

  const updateRestaurant = useCallback((info: Partial<RestaurantInfo>) => {
    setRestaurant(prev => ({ ...prev, ...info }));
  }, []);

  // ─── Menu ───────────────────────────────────────────────────────────────────
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    setMenuItems(prev => [...prev, { ...item, id: `item_${Date.now()}` }]);
  }, []);

  const updateMenuItem = useCallback((id: string, item: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...item } : m));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  }, []);

  const toggleItemAvailability = useCallback((id: string) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
  }, []);

  // ─── Orders ─────────────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o =>
        o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
      );
      if (status === 'delivered') {
        const order = updated.find(o => o.id === orderId);
        if (order?.riderId) {
          setRiders(rPrev => rPrev.map(r =>
            r.id === order.riderId
              ? { ...r, isVisible: false, currentOrderId: undefined, status: 'delivered' as const }
              : r
          ));
        }
      }
      return updated;
    });
  }, []);

  const acceptOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'accepted' as OrderStatus, updatedAt: new Date() } : o
    ));
  }, []);

  const rejectOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date() } : o
    ));
  }, []);

  const markOrderReady = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'ready' as OrderStatus, updatedAt: new Date() } : o
    ));
  }, []);

  // ─── Riders ─────────────────────────────────────────────────────────────────
  const updateRiderVisibility = useCallback((riderId: string, visible: boolean) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, isVisible: visible } : r));
  }, []);

  const autoHideRiderOnDelivery = useCallback((riderId: string) => {
    setRiders(prev => prev.map(r =>
      r.id === riderId
        ? { ...r, isVisible: false, currentOrderId: undefined, status: 'delivered' as const }
        : r
    ));
  }, []);

  // ─── Staff ──────────────────────────────────────────────────────────────────
  const addStaff = useCallback((member: Omit<StaffMember, 'id' | 'createdAt'>): boolean => {
    const exists = staff.some(s => s.username === member.username);
    if (exists) return false;
    setStaff(prev => [...prev, {
      ...member,
      id: `staff_${Date.now()}`,
      createdAt: new Date(),
    }]);
    return true;
  }, [staff]);

  const updateStaff = useCallback((id: string, data: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  // ─── Daily Close ────────────────────────────────────────────────────────────
  const triggerDailyClose = useCallback((): DailyReport => {
    const today = new Date().toISOString().split('T')[0];
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const gross = completedOrders.reduce((s, o) => s + o.total, 0);
    const commission = completedOrders.reduce((s, o) => s + o.adminCommission, 0);

    const report: DailyReport = {
      date: today,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      grossRevenue: gross,
      totalCommission: commission,
      netRevenue: gross - commission,
      closedAt: new Date().toISOString(),
    };

    setDailyReports(prev => {
      const filtered = prev.filter(r => r.date !== today);
      return [report, ...filtered].slice(0, 90);
    });

    return report;
  }, [orders]);

  return (
    <RestaurantContext.Provider value={{
      restaurant, menuItems, orders, riders, staff, dailyReports, financials,
      setRestaurantStatus, updateRestaurant,
      addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability,
      updateOrderStatus, acceptOrder, rejectOrder, markOrderReady,
      updateRiderVisibility, autoHideRiderOnDelivery,
      addStaff, updateStaff, deleteStaff, triggerDailyClose,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

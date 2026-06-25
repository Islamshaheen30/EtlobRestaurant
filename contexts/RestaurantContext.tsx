import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/services/supabaseClient';
import {
  RestaurantStatus, MenuItem, Order, Rider, RestaurantInfo,
  OrderStatus, StaffMember, DailyReport,
  MOCK_RESTAURANT, MOCK_MENU_ITEMS, MOCK_ORDERS, MOCK_RIDERS, MOCK_STAFF, MOCK_DAILY_REPORTS,
} from '@/services/mockData';
import { useAuth } from '@/hooks/useAuth';

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
  loading: boolean;
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
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantInfo>(MOCK_RESTAURANT);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(MOCK_RIDERS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(MOCK_DAILY_REPORTS);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  // ─── Real-time subscription for orders ───────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Fetch orders for this restaurant from Supabase
    (async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', user.id)
          .order('created_at', { ascending: false });

        if (!cancelled && !error && data) {
          // Map Supabase rows to Order shape
          const mappedOrders = data.map((row: any) => ({
            id: row.id,
            customerId: row.customer_id,
            restaurantId: row.restaurant_id,
            status: row.status as OrderStatus,
            total: row.total_amount || 0,
            adminCommission: row.commission_amount || 0,
            items: row.items || [],
            customerName: row.customer_name || 'عميل',
            customerPhone: row.customer_phone || '',
            customerAddress: row.customer_address || '',
            riderId: row.driver_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          }));
          setOrders(mappedOrders);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      }
    })();

    // Subscribe to real-time changes for this restaurant's orders
    const channel = supabase
      .channel(`restaurant-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (oldId) {
              setOrders((prev) => prev.filter((p) => p.id !== oldId));
            }
            return;
          }

          const mappedOrder = {
            id: payload.new.id,
            customerId: payload.new.customer_id,
            restaurantId: payload.new.restaurant_id,
            status: payload.new.status as OrderStatus,
            total: payload.new.total_amount || 0,
            adminCommission: payload.new.commission_amount || 0,
            items: payload.new.items || [],
            customerName: payload.new.customer_name || 'عميل',
            customerPhone: payload.new.customer_phone || '',
            customerAddress: payload.new.customer_address || '',
            riderId: payload.new.driver_id,
            createdAt: new Date(payload.new.created_at),
            updatedAt: new Date(payload.new.updated_at),
          };

          setOrders((prev) => {
            const idx = prev.findIndex((p) => p.id === mappedOrder.id);
            if (idx < 0) return [mappedOrder, ...prev];
            const copy = [...prev];
            copy[idx] = mappedOrder;
            return copy;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  // ─── Financial Summary (today's data from current orders) ───────────────────
  const financials = useMemo((): FinancialSummary => {
    const todayOrders = orders;
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
    // Update locally first
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

    // Push to Supabase
    supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .catch(err => console.error('Failed to update order status:', err));
  }, []);

  const acceptOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'accepted' as OrderStatus);
  }, [updateOrderStatus]);

  const rejectOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'cancelled' as OrderStatus);
  }, [updateOrderStatus]);

  const markOrderReady = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'ready' as OrderStatus);
  }, [updateOrderStatus]);

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
      restaurant, menuItems, orders, riders, staff, dailyReports, financials, loading,
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

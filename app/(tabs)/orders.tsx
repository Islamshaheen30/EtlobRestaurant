// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { OrderCard } from '@/components/feature/OrderCard';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { OrderStatus, Order } from '@/services/mockData';
import { Button } from '@/components/ui/Button';

type FilterKey = 'all' | 'new' | 'active' | 'ready' | 'delivered' | 'cancelled';

interface FilterOption {
  key: FilterKey;
  labelEn: string;
  labelAr: string;
  statuses: OrderStatus[];
  accentColor: string;
}

const FILTERS: FilterOption[] = [
  { key: 'all', labelEn: 'All', labelAr: 'الكل', statuses: [], accentColor: Colors.charcoal200 },
  { key: 'new', labelEn: 'New', labelAr: 'جديد', statuses: ['new'], accentColor: Colors.primary },
  { key: 'active', labelEn: 'Active', labelAr: 'نشط', statuses: ['accepted', 'preparing'], accentColor: Colors.warning },
  { key: 'ready', labelEn: 'Ready', labelAr: 'جاهز', statuses: ['ready', 'picked_up'], accentColor: Colors.success },
  { key: 'delivered', labelEn: 'Done', labelAr: 'مكتمل', statuses: ['delivered'], accentColor: Colors.info },
  { key: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي', statuses: ['cancelled'], accentColor: Colors.danger },
];

function InvoiceModal({ order, visible, onClose, language, isRTL, t }: {
  order: Order | null; visible: boolean; onClose: () => void;
  language: string; isRTL: boolean; t: (k: any) => string;
}) {
  if (!order) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={invStyles.overlay} onPress={onClose}>
        <Pressable style={invStyles.sheet} onPress={e => e.stopPropagation()}>
          <View style={invStyles.handle} />
          <ScrollView contentContainerStyle={invStyles.content}>
            <View style={[invStyles.header, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[invStyles.title, isRTL && invStyles.rtl]}>{t('invoice')}</Text>
              <Text style={[invStyles.orderNum, isRTL && invStyles.rtl]}>{order.orderNumber}</Text>
              <Text style={[invStyles.dateText, isRTL && invStyles.rtl]}>{order.createdAt.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-GB')}</Text>
            </View>
            <View style={invStyles.divider} />
            <View style={[invStyles.customerRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <MaterialIcons name="person" size={14} color={Colors.textMuted} />
              <Text style={[invStyles.customerText, isRTL && invStyles.rtl]}>{order.customerName}</Text>
            </View>
            <View style={[invStyles.customerRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <MaterialIcons name="location-on" size={14} color={Colors.textMuted} />
              <Text style={[invStyles.customerText, isRTL && invStyles.rtl]}>{order.deliveryAddress}</Text>
            </View>
            <View style={invStyles.divider} />
            {order.items.map((item, idx) => (
              <View key={idx} style={[invStyles.itemRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[invStyles.itemQty, isRTL && invStyles.rtl]}>{item.quantity}×</Text>
                <Text style={[invStyles.itemName, isRTL && invStyles.rtl]}>{language === 'ar' ? item.nameAr : item.nameEn}</Text>
                <Text style={invStyles.itemPrice}>{item.price * item.quantity} {t('egp')}</Text>
              </View>
            ))}
            <View style={invStyles.divider} />
            {[
              { label: t('subtotal'), value: `${order.subtotal} ${t('egp')}`, color: Colors.text },
              { label: t('adminCommission'), value: `- ${order.adminCommission} ${t('egp')}`, color: Colors.danger },
            ].map((row, i) => (
              <View key={i} style={[invStyles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[invStyles.summaryLabel, isRTL && invStyles.rtl]}>{row.label}</Text>
                <Text style={[invStyles.summaryValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
            <View style={invStyles.divider} />
            <View style={[invStyles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[invStyles.netLabel, isRTL && invStyles.rtl]}>{t('netEarning')}</Text>
              <Text style={invStyles.netValue}>{order.netEarning} {t('egp')}</Text>
            </View>
            <Button label={language === 'ar' ? 'إغلاق' : 'Close'} onPress={onClose} variant="dark" fullWidth style={{ marginTop: Spacing.md }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const invStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, maxHeight: '85%', borderTopWidth: 1, borderColor: Colors.border },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.charcoal500, alignSelf: 'center', marginTop: Spacing.md },
  content: { padding: Spacing.xl, gap: Spacing.sm },
  header: { gap: 4 },
  title: { ...Typography.h2, color: Colors.text } as any,
  orderNum: { fontSize: 13, color: Colors.textMuted, fontFamily: 'monospace' },
  dateText: { fontSize: 12, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  customerText: { fontSize: 13, color: Colors.textSecondary },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 3 },
  itemQty: { fontSize: 13, color: Colors.textMuted, width: 24 },
  itemName: { flex: 1, fontSize: 13, color: Colors.text },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.text },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  netLabel: { ...Typography.h4, color: Colors.text } as any,
  netValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  rtl: { textAlign: 'right' },
});

export default function OrdersScreen() {
  const { orders, acceptOrder, rejectOrder, markOrderReady, updateOrderStatus } = useRestaurant();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const isCallCenter = user?.role === 'call_center';
  // Call Center only sees new/active orders
  const visibleFilters = isCallCenter
    ? FILTERS.filter(f => ['all', 'new', 'active'].includes(f.key))
    : FILTERS;

  const filteredOrders = useMemo(() => {
    let pool = isCallCenter
      ? orders.filter(o => ['new', 'accepted', 'preparing'].includes(o.status))
      : orders;
    const filter = visibleFilters.find(f => f.key === activeFilter);
    if (!filter || filter.statuses.length === 0) return pool;
    return pool.filter(o => filter.statuses.includes(o.status));
  }, [orders, activeFilter, isCallCenter]);

  const newCount = orders.filter(o => o.status === 'new').length;
  const pageTitle = isCallCenter ? t('incomingOrders') : t('orderManagement');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={isRTL ? { alignItems: 'flex-end' } : {}}>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{pageTitle}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.rtlText]}>
            {isCallCenter
              ? `${orders.filter(o => ['new', 'accepted', 'preparing'].includes(o.status)).length} ${language === 'ar' ? 'طلب نشط' : 'active order(s)'}`
              : `${orders.length} ${language === 'ar' ? 'طلب إجمالي' : 'total orders'}`}
          </Text>
        </View>
      </View>

      {/* New Orders Alert */}
      {newCount > 0 ? (
        <Pressable
          onPress={() => setActiveFilter('new')}
          style={({ pressed }) => [styles.alertBanner, pressed && { opacity: 0.85 }]}
        >
          <MaterialIcons name="notifications-active" size={16} color={Colors.primaryText} />
          <Text style={styles.alertText}>
            {newCount} {language === 'ar' ? 'طلبات جديدة تنتظر الموافقة' : `new order${newCount > 1 ? 's' : ''} awaiting approval`}
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={12} color={Colors.primaryText} />
        </Pressable>
      ) : null}

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {visibleFilters.map(f => {
            const isActive = activeFilter === f.key;
            const pool = isCallCenter ? orders.filter(o => ['new', 'accepted', 'preparing'].includes(o.status)) : orders;
            const count = f.statuses.length > 0 ? pool.filter(o => f.statuses.includes(o.status)).length : pool.length;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[
                  styles.filterChip,
                  isActive && { backgroundColor: f.accentColor === Colors.primary ? Colors.primary : 'transparent', borderColor: f.accentColor },
                ]}
              >
                <Text style={[
                  styles.filterLabel,
                  isActive && { color: f.accentColor === Colors.primary ? Colors.primaryText : f.accentColor, fontWeight: '700' },
                ]}>
                  {language === 'ar' ? f.labelAr : f.labelEn}
                </Text>
                {count > 0 ? (
                  <View style={[styles.filterCount, isActive && { backgroundColor: f.accentColor === Colors.primary ? 'rgba(0,0,0,0.15)' : f.accentColor }]}>
                    <Text style={[styles.filterCountText, isActive && f.accentColor !== Colors.primary && { color: '#fff' }]}>{count}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            <OrderCard
              order={item}
              onAccept={acceptOrder}
              onReject={rejectOrder}
              onMarkReady={markOrderReady}
              onUpdateStatus={updateOrderStatus}
            />
            {/* Invoice button for Call Center */}
            {(isCallCenter || user?.role === 'owner') ? (
              <Pressable
                onPress={() => setInvoiceOrder(item)}
                style={({ pressed }) => [styles.invoiceBtn, pressed && { opacity: 0.7 }]}
              >
                <MaterialIcons name="receipt" size={13} color={Colors.textMuted} />
                <Text style={styles.invoiceBtnText}>{t('viewInvoice')}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="receipt-long" size={48} color={Colors.charcoal500} />
            <Text style={styles.emptyTitle}>{t('noOrders')}</Text>
          </View>
        }
      />

      <InvoiceModal
        order={invoiceOrder}
        visible={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        language={language}
        isRTL={isRTL}
        t={t}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pageTitle: { ...Typography.h3, color: Colors.text } as any,
  pageSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: 10,
  },
  alertText: { fontSize: 13, fontWeight: '700', color: Colors.primaryText, flex: 1 },
  filterBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.charcoal700,
    borderWidth: 1.5, borderColor: Colors.border, height: 34,
  },
  filterLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  filterCount: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: Colors.charcoal500, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  filterCountText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
  list: { padding: Spacing.md },
  invoiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-end',
    marginTop: -8, marginBottom: Spacing.sm,
    marginRight: Spacing.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    backgroundColor: Colors.charcoal700, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  invoiceBtnText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { ...Typography.body, color: Colors.textMuted } as any,
  rtlText: { textAlign: 'right' },
});

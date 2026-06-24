// Powered by OnSpace.AI
import React, { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Order, OrderStatus } from '@/services/mockData';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';

interface OrderCardProps {
  order: Order;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  onUpdateStatus?: (id: string, status: OrderStatus) => void;
}

const statusBadgeVariant: Record<OrderStatus, 'info' | 'warning' | 'success' | 'danger' | 'default' | 'gold'> = {
  new: 'gold',
  accepted: 'warning',
  preparing: 'warning',
  ready: 'success',
  picked_up: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

const statusLabelKey: Record<OrderStatus, string> = {
  new: 'newOrders',
  accepted: 'inProgress',
  preparing: 'inProgress',
  ready: 'readyPickup',
  picked_up: 'onTheWay',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const STATUS_LEFT_COLORS: Record<OrderStatus, string> = {
  new: Colors.primary,
  accepted: Colors.warning,
  preparing: Colors.warning,
  ready: Colors.success,
  picked_up: Colors.info,
  delivered: Colors.success,
  cancelled: Colors.charcoal400,
};

function timeAgo(date: Date, lang: string): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return lang === 'ar' ? 'الآن' : 'just now';
  if (minutes < 60) return lang === 'ar' ? `${minutes} د` : `${minutes}m ago`;
  return lang === 'ar' ? `${Math.floor(minutes / 60)} س` : `${Math.floor(minutes / 60)}h ago`;
}

export const OrderCard = memo(function OrderCard({ order, onAccept, onReject, onMarkReady, onUpdateStatus }: OrderCardProps) {
  const { language, isRTL, t } = useLanguage();
  const [expanded, setExpanded] = useState(order.status === 'new');

  const statusLabel = statusLabelKey[order.status] as any;
  const badgeVariant = statusBadgeVariant[order.status];
  const leftColor = STATUS_LEFT_COLORS[order.status];

  return (
    <View style={[styles.card, { borderLeftColor: leftColor, borderLeftWidth: 3 }]}>
      {/* Header Row */}
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
        <View style={[styles.headerLeft, isRTL && styles.rowReverse]}>
          <Text style={styles.orderNum}>{order.orderNumber}</Text>
          <Badge label={t(statusLabel)} variant={badgeVariant} size="sm" />
        </View>
        <View style={[styles.headerRight, isRTL && styles.rowReverse]}>
          <Text style={styles.total}>{order.total} <Text style={styles.currency}>{t('egp')}</Text></Text>
          <Text style={styles.time}>{timeAgo(order.createdAt, language)}</Text>
          <MaterialIcons name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color={Colors.textMuted} />
        </View>
      </Pressable>

      {/* Customer Row */}
      <View style={[styles.customerRow, isRTL && styles.rowReverse]}>
        <MaterialIcons name="person-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.customerName}>{order.customerName}</Text>
        <Text style={styles.dot}>·</Text>
        <MaterialIcons name="location-on" size={13} color={Colors.textMuted} />
        <Text style={styles.address} numberOfLines={1}>{order.deliveryAddress}</Text>
      </View>

      {/* Expanded Details */}
      {expanded ? (
        <View style={styles.details}>
          <View style={styles.divider} />
          {order.items.map((item, idx) => (
            <View key={idx} style={[styles.itemRow, isRTL && styles.rowReverse]}>
              <View style={styles.qtyBadge}>
                <Text style={styles.itemQty}>{item.quantity}</Text>
              </View>
              <Text style={[styles.itemName, isRTL && styles.rtlText]}>
                {language === 'ar' ? item.nameAr : item.nameEn}
              </Text>
              <Text style={styles.itemPrice}>{item.price * item.quantity} {t('egp')}</Text>
            </View>
          ))}
          {order.specialInstructions ? (
            <View style={[styles.noteRow, isRTL && styles.rowReverse]}>
              <MaterialIcons name="sticky-note-2" size={13} color={Colors.warning} />
              <Text style={[styles.note, isRTL && styles.rtlText]}>{order.specialInstructions}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Action Buttons */}
      {order.status === 'new' ? (
        <View style={[styles.actions, isRTL && styles.rowReverse]}>
          <Button label={t('rejectOrder')} variant="danger" size="sm" onPress={() => onReject?.(order.id)} style={styles.actionBtn} />
          <Button label={t('acceptOrder')} variant="primary" size="sm" onPress={() => onAccept?.(order.id)} style={[styles.actionBtn, styles.acceptBtn]} />
        </View>
      ) : order.status === 'accepted' || order.status === 'preparing' ? (
        <View style={styles.actions}>
          <Button label={t('markReady')} variant="outline" size="sm" fullWidth onPress={() => onMarkReady?.(order.id)} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowReverse: { flexDirection: 'row-reverse' },
  orderNum: { fontSize: 15, fontWeight: '700', color: Colors.text, fontFamily: 'monospace' },
  total: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  currency: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  time: { ...Typography.caption, color: Colors.textMuted } as any,
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  customerName: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '500' } as any,
  dot: { color: Colors.charcoal400, fontSize: 12 },
  address: { ...Typography.caption, color: Colors.textMuted, flex: 1 } as any,
  details: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  qtyBadge: {
    width: 22, height: 22,
    borderRadius: Radius.sm,
    backgroundColor: Colors.charcoal700,
    alignItems: 'center', justifyContent: 'center',
  },
  itemQty: { fontSize: 11, fontWeight: '700', color: Colors.charcoal100 },
  itemName: { ...Typography.bodySmall, color: Colors.text, flex: 1 } as any,
  itemPrice: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600' } as any,
  noteRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, alignItems: 'flex-start', backgroundColor: Colors.warningBg, padding: Spacing.sm, borderRadius: Radius.sm },
  note: { ...Typography.caption, color: Colors.warning, flex: 1 } as any,
  actions: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.sm, paddingTop: 0 },
  actionBtn: { flex: 1 },
  acceptBtn: {},
  rtlText: { textAlign: 'right' },
});

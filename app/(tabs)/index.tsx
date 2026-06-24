// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { StatusSelector } from '@/components/feature/StatusSelector';
import { OrderCard } from '@/components/feature/OrderCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { RestaurantStatus } from '@/services/mockData';

export default function DashboardScreen() {
  const { restaurant, orders, setRestaurantStatus, acceptOrder, rejectOrder, markOrderReady } = useRestaurant();
  const { t, isRTL, language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const newOrders = orders.filter(o => o.status === 'new');
  const activeOrders = orders.filter(o => ['accepted', 'preparing'].includes(o.status));
  const completedToday = orders.filter(o => o.status === 'delivered');
  const todayRevenue = completedToday.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.filter(o => o.status !== 'delivered').slice(0, 4);

  const statusBadgeVariant = restaurant.status === 'open' ? 'open' as const
    : restaurant.status === 'closed' ? 'closed' as const : 'busy' as const;

  const restName = language === 'ar' ? restaurant.nameAr : restaurant.nameEn;

  const statusAccentColor = restaurant.status === 'open' ? Colors.statusOpen
    : restaurant.status === 'closed' ? Colors.statusClosed : Colors.statusBusy;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Admin Top Bar */}
      <View style={styles.topBar}>
        <View style={[styles.topLeft, isRTL && styles.rowReverse]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🍽</Text>
          </View>
          <View>
            <Text style={[styles.pageName, isRTL && styles.rtlText]}>{t('dashboard')}</Text>
            <Text style={[styles.restLabel, isRTL && styles.rtlText]} numberOfLines={1}>{restName}</Text>
          </View>
        </View>

        <View style={[styles.topRight, isRTL && styles.rowReverse]}>
          {/* Status pill */}
          <Pressable
            onPress={() => setStatusModalVisible(true)}
            style={({ pressed }) => [styles.statusPill, { borderColor: statusAccentColor }, pressed && { opacity: 0.8 }]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusAccentColor }]} />
            <Text style={[styles.statusPillText, { color: statusAccentColor }]}>{t(restaurant.status)}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color={statusAccentColor} />
          </Pressable>

          {/* Lang toggle */}
          <Pressable onPress={toggleLanguage} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}>
            <Text style={styles.langBtnText}>{language === 'en' ? 'ع' : 'EN'}</Text>
          </Pressable>

          {/* Avatar / logout */}
          <Pressable onPress={logout} style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* New Orders Alert */}
        {newOrders.length > 0 ? (
          <View style={styles.alertBanner}>
            <MaterialIcons name="notifications-active" size={18} color={Colors.primaryText} />
            <Text style={styles.alertText}>
              {newOrders.length} {language === 'ar' ? 'طلب جديد يحتاج موافقة' : `new order${newOrders.length > 1 ? 's' : ''} need approval`}
            </Text>
          </View>
        ) : null}

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('quickStats')}</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: 'fiber-new' as const, value: newOrders.length, label: t('pendingOrders'), color: Colors.primary, bg: 'rgba(255,215,0,0.1)' },
            { icon: 'timelapse' as const, value: activeOrders.length, label: t('activeOrders'), color: Colors.warning, bg: Colors.warningBg },
            { icon: 'check-circle-outline' as const, value: completedToday.length, label: t('completedOrders'), color: Colors.success, bg: Colors.successBg },
            { icon: 'account-balance-wallet' as const, value: `${todayRevenue}`, label: t('egp'), color: Colors.info, bg: Colors.infoBg },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { borderTopColor: stat.color }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                <MaterialIcons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Restaurant Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: statusAccentColor }]}>
          <View style={[styles.statusCardHeader, isRTL && styles.rowReverse]}>
            <View style={styles.statusCardLeft}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('restaurantStatus')}</Text>
              <Text style={[styles.statusDesc, isRTL && styles.rtlText]}>
                {t(restaurant.status === 'open' ? 'statusOpen' : restaurant.status === 'closed' ? 'statusClosed' : 'statusBusy')}
              </Text>
            </View>
            <Badge label={t(restaurant.status)} variant={statusBadgeVariant} />
          </View>
          <Button
            label={t('setStatus')}
            onPress={() => setStatusModalVisible(true)}
            variant="dark"
            size="sm"
            style={{ alignSelf: 'flex-start' }}
          />
        </View>

        {/* Recent Active Orders */}
        <View style={[styles.sectionRow, isRTL && styles.rowReverse]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('recentOrders')}</Text>
          {orders.length > 0 ? (
            <Text style={styles.orderCount}>{orders.length} {language === 'ar' ? 'طلب' : 'total'}</Text>
          ) : null}
        </View>

        {recentOrders.length > 0 ? recentOrders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onAccept={acceptOrder}
            onReject={rejectOrder}
            onMarkReady={markOrderReady}
          />
        )) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={40} color={Colors.charcoal500} />
            <Text style={styles.emptyText}>{t('noOrders')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Status Modal */}
      <Modal visible={statusModalVisible} transparent animationType="slide" onRequestClose={() => setStatusModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, isRTL && styles.rtlText]}>{t('setStatus')}</Text>
            <StatusSelector
              currentStatus={restaurant.status}
              onSelect={(s: RestaurantStatus) => { setRestaurantStatus(s); setStatusModalVisible(false); }}
              isRTL={isRTL}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowReverse: { flexDirection: 'row-reverse' },
  logoMark: {
    width: 34, height: 34,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 16 },
  pageName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  restLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.charcoal700,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusPillText: { fontSize: 12, fontWeight: '600' },
  iconBtn: {
    width: 34, height: 34,
    backgroundColor: Colors.charcoal700,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  langBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  avatar: {
    width: 34, height: 34,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primaryText },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadow.gold,
  },
  alertText: { fontSize: 13, fontWeight: '700', color: Colors.primaryText, flex: 1 },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 5,
    borderTopWidth: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  statusCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  statusCardLeft: { flex: 1, gap: 4 },
  statusDesc: { ...Typography.caption, color: Colors.textMuted } as any,
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...Typography.h4, color: Colors.text } as any,
  orderCount: { ...Typography.caption, color: Colors.textMuted } as any,
  emptyState: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  emptyText: { ...Typography.bodySmall, color: Colors.textMuted } as any,
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.charcoal500, alignSelf: 'center' },
  modalTitle: { ...Typography.h3, color: Colors.text } as any,
  rtlText: { textAlign: 'right' },
});

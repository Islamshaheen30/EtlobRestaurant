// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { RiderCard } from '@/components/feature/RiderCard';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';

export default function RidersScreen() {
  const { riders, orders, updateRiderVisibility } = useRestaurant();
  const { t, language, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();

  const visibleRiders = riders.filter(r => r.isVisible);
  const hiddenRiders = riders.filter(r => !r.isVisible);

  const getOrderNumber = (riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider?.currentOrderId) return undefined;
    const order = orders.find(o => o.id === rider.currentOrderId);
    return order?.orderNumber;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View style={isRTL ? { alignItems: 'flex-end' } : {}}>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('riderTracking')}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.rtlText]}>
            {visibleRiders.length} {language === 'ar' ? 'مندوب نشط' : 'active rider(s)'}
          </Text>
        </View>
      </View>

      <FlatList
        data={riders}
        keyExtractor={r => r.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Info Banner */}
            <View style={[styles.infoBanner, isRTL && styles.rowReverse]}>
              <View style={styles.infoBannerIcon}>
                <MaterialIcons name="info" size={16} color={Colors.info} />
              </View>
              <Text style={[styles.infoText, isRTL && styles.rtlText]}>
                {language === 'ar'
                  ? 'المندوبون يظهرون فقط حين يكونون مكلفين بطلباتك. يُخفَون تلقائياً عند اكتمال التوصيل.'
                  : 'Riders appear only when assigned to your orders. They are auto-hidden after delivery.'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: Colors.success }]}>{visibleRiders.length}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'نشط' : 'Active'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: Colors.charcoal300 }]}>{hiddenRiders.length}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'مخفي' : 'Hidden'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: Colors.primary }]}>{riders.length}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'الكل' : 'Total'}</Text>
              </View>
            </View>

            {visibleRiders.length > 0 ? (
              <Text style={[styles.sectionLabel, isRTL && styles.rtlText]}>
                {t('assignedRiders')} ({visibleRiders.length})
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RiderCard
            rider={item}
            orderNumber={getOrderNumber(item.id)}
            onToggleVisibility={updateRiderVisibility}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="delivery-dining" size={48} color={Colors.charcoal500} />
            <Text style={styles.emptyTitle}>{t('noRiders')}</Text>
            <Text style={styles.emptyDesc}>
              {language === 'ar'
                ? 'لا يوجد مندوبون معيّنون حالياً لطلباتك'
                : 'No riders are currently assigned to your orders'}
            </Text>
          </View>
        }
        ListFooterComponent={
          hiddenRiders.length > 0 ? (
            <View style={styles.hiddenSection}>
              <View style={[styles.hiddenHeader, isRTL && styles.rowReverse]}>
                <MaterialIcons name="visibility-off" size={14} color={Colors.textMuted} />
                <Text style={[styles.hiddenTitle, isRTL && styles.rtlText]}>
                  {language === 'ar' ? `مخفيون (${hiddenRiders.length})` : `Hidden Riders (${hiddenRiders.length})`}
                </Text>
              </View>
              <Text style={[styles.hiddenDesc, isRTL && styles.rtlText]}>
                {language === 'ar'
                  ? 'هؤلاء المندوبون أكملوا التوصيل وتم إخفاؤهم تلقائياً'
                  : 'These riders completed delivery and were auto-hidden'}
              </Text>
              {hiddenRiders.map(rider => (
                <RiderCard
                  key={rider.id}
                  rider={rider}
                  orderNumber={getOrderNumber(rider.id)}
                  onToggleVisibility={updateRiderVisibility}
                />
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  pageTitle: { ...Typography.h3, color: Colors.text } as any,
  pageSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  list: { padding: Spacing.md },
  listHeader: { gap: Spacing.md, marginBottom: Spacing.sm },
  infoBanner: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.infoBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    alignItems: 'flex-start',
  },
  infoBannerIcon: {
    width: 28, height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { ...Typography.bodySmall, color: Colors.info, flex: 1 } as any,
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  sectionLabel: { ...Typography.label, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 } as any,
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { ...Typography.h4, color: Colors.textMuted } as any,
  emptyDesc: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' } as any,
  hiddenSection: { marginTop: Spacing.lg, gap: Spacing.sm },
  hiddenHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  hiddenTitle: { ...Typography.label, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' } as any,
  hiddenDesc: { ...Typography.caption, color: Colors.textMuted } as any,
  rtlText: { textAlign: 'right' },
});

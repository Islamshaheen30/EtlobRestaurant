// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Rider } from '@/services/mockData';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';

interface RiderCardProps {
  rider: Rider;
  orderNumber?: string;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

const riderStatusConfig = {
  on_the_way: { color: Colors.info, bg: Colors.infoBg, icon: 'directions-bike' as const },
  picked_up: { color: Colors.warning, bg: Colors.warningBg, icon: 'local-shipping' as const },
  delivered: { color: Colors.success, bg: Colors.successBg, icon: 'check-circle' as const },
};

export const RiderCard = memo(function RiderCard({ rider, orderNumber, onToggleVisibility }: RiderCardProps) {
  const { isRTL, t, language } = useLanguage();
  const config = riderStatusConfig[rider.status];

  const statusLabel = rider.status === 'on_the_way' ? t('onTheWay')
    : rider.status === 'picked_up' ? t('pickedUp')
    : t('riderDelivered');

  const badgeVariant = rider.status === 'delivered' ? 'success'
    : rider.status === 'picked_up' ? 'warning' : 'info';

  return (
    <View style={[styles.card, !rider.isVisible && styles.hiddenCard]}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        {/* Avatar */}
        <View style={[styles.avatarWrap, { backgroundColor: config.bg }]}>
          <MaterialIcons name={config.icon} size={22} color={config.color} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.riderName, isRTL && styles.rtlText]}>{rider.name}</Text>
          <Text style={[styles.riderPhone, isRTL && styles.rtlText]}>{rider.phone}</Text>
        </View>

        {/* Status + Toggle */}
        <View style={styles.rightCol}>
          <Badge label={statusLabel} variant={badgeVariant} size="sm" />
          <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
            <Text style={styles.toggleLabel}>
              {rider.isVisible
                ? (language === 'ar' ? 'ظاهر' : 'Visible')
                : (language === 'ar' ? 'مخفي' : 'Hidden')}
            </Text>
            <Switch
              value={rider.isVisible}
              onValueChange={(val) => onToggleVisibility(rider.id, val)}
              trackColor={{ false: Colors.charcoal500, true: 'rgba(255,215,0,0.3)' }}
              thumbColor={rider.isVisible ? Colors.primary : Colors.charcoal300}
              style={styles.switch}
            />
          </View>
        </View>
      </View>

      {/* Order Row */}
      {orderNumber ? (
        <View style={[styles.infoRow, isRTL && styles.rowReverse]}>
          <View style={styles.infoTag}>
            <MaterialIcons name="receipt" size={12} color={Colors.primary} />
            <Text style={styles.infoTagText}>{t('currentOrder')}: <Text style={styles.orderNum}>{orderNumber}</Text></Text>
          </View>
        </View>
      ) : null}

      {/* Location Row */}
      {rider.lastLocation ? (
        <View style={[styles.infoRow, isRTL && styles.rowReverse]}>
          <MaterialIcons name="my-location" size={13} color={Colors.charcoal300} />
          <Text style={[styles.locationText, isRTL && styles.rtlText]}>
            {rider.lastLocation.address}
          </Text>
          <Text style={styles.coords}>
            {rider.lastLocation.lat.toFixed(3)}, {rider.lastLocation.lng.toFixed(3)}
          </Text>
        </View>
      ) : null}

      {/* Hidden Banner */}
      {!rider.isVisible ? (
        <View style={styles.hiddenBanner}>
          <MaterialIcons name="visibility-off" size={12} color={Colors.textMuted} />
          <Text style={styles.hiddenText}>
            {language === 'ar' ? 'تم الإخفاء تلقائياً بعد اكتمال التوصيل' : 'Auto-hidden after delivery completion'}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  hiddenCard: { opacity: 0.5, borderStyle: 'dashed' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowReverse: { flexDirection: 'row-reverse' },
  avatarWrap: {
    width: 44, height: 44,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  riderName: { ...Typography.h4, color: Colors.text } as any,
  riderPhone: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  rightCol: { alignItems: 'flex-end', gap: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 10, color: Colors.textMuted },
  switch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  infoTagText: { ...Typography.caption, color: Colors.textSecondary } as any,
  orderNum: { fontWeight: '700', color: Colors.primary },
  locationText: { ...Typography.caption, color: Colors.textSecondary, flex: 1 } as any,
  coords: { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace' },
  hiddenBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.charcoal700,
    borderRadius: Radius.sm, padding: Spacing.sm,
  },
  hiddenText: { fontSize: 11, color: Colors.textMuted },
  rtlText: { textAlign: 'right' },
});

// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MenuItem } from '@/services/mockData';
import { useLanguage } from '@/hooks/useLanguage';
import { Badge } from '@/components/ui/Badge';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const MenuItemCard = memo(function MenuItemCard({ item, onEdit, onDelete, onToggle }: MenuItemCardProps) {
  const { language, isRTL, t } = useLanguage();
  const name = language === 'ar' ? item.nameAr : item.nameEn;
  const description = language === 'ar' ? item.descriptionAr : item.descriptionEn;

  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailableCard]}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="restaurant" size={26} color={Colors.charcoal400} />
        </View>
      )}

      <View style={styles.content}>
        <View style={[styles.topRow, isRTL && styles.rowReverse]}>
          <Text style={[styles.name, isRTL && styles.rtlText]} numberOfLines={1}>{name}</Text>
          <Badge
            label={item.isAvailable ? t('available') : t('unavailable')}
            variant={item.isAvailable ? 'success' : 'danger'}
            size="sm"
          />
        </View>

        <Text style={[styles.description, isRTL && styles.rtlText]} numberOfLines={2}>{description}</Text>

        <View style={[styles.footer, isRTL && styles.rowReverse]}>
          <View style={[styles.metaRow, isRTL && styles.rowReverse]}>
            <Text style={styles.price}>{item.price} <Text style={styles.currency}>{t('egp')}</Text></Text>
            <View style={styles.prepTag}>
              <MaterialIcons name="schedule" size={12} color={Colors.charcoal200} />
              <Text style={styles.prepText}>{item.prepTime}m</Text>
            </View>
          </View>

          <View style={[styles.actions, isRTL && styles.rowReverse]}>
            <Switch
              value={item.isAvailable}
              onValueChange={() => onToggle(item.id)}
              trackColor={{ false: Colors.charcoal500, true: 'rgba(255,215,0,0.3)' }}
              thumbColor={item.isAvailable ? Colors.primary : Colors.charcoal300}
              style={styles.switch}
            />
            <Pressable onPress={() => onEdit(item)} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <MaterialIcons name="edit" size={16} color={Colors.charcoal200} />
            </Pressable>
            <Pressable onPress={() => onDelete(item.id)} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <MaterialIcons name="delete-outline" size={16} color={Colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  unavailableCard: { opacity: 0.55 },
  image: { width: 88, height: 88 },
  imagePlaceholder: {
    width: 88, height: 88,
    backgroundColor: Colors.charcoal700,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, padding: Spacing.sm + 2, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  rowReverse: { flexDirection: 'row-reverse' },
  name: { ...Typography.h4, color: Colors.text, flex: 1 } as any,
  description: { ...Typography.caption, color: Colors.textMuted, lineHeight: 16 } as any,
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  price: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  currency: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  prepTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.charcoal700,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: Radius.full,
  },
  prepText: { fontSize: 10, color: Colors.charcoal200, fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionBtn: {
    width: 30, height: 30,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.charcoal700,
    borderRadius: Radius.sm,
  },
  pressed: { opacity: 0.6 },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  rtlText: { textAlign: 'right' },
});

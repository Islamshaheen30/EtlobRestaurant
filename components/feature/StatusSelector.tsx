// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography, Shadow } from '@/constants/theme';
import { RestaurantStatus } from '@/services/mockData';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKey } from '@/constants/i18n';

interface StatusOption {
  value: RestaurantStatus;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bg: string;
  border: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'open', labelKey: 'open', descKey: 'statusOpen', icon: 'check-circle', color: Colors.statusOpen, bg: Colors.statusOpenBg, border: 'rgba(34,197,94,0.3)' },
  { value: 'busy', labelKey: 'busy', descKey: 'statusBusy', icon: 'schedule', color: Colors.statusBusy, bg: Colors.statusBusyBg, border: 'rgba(245,158,11,0.3)' },
  { value: 'closed', labelKey: 'closed', descKey: 'statusClosed', icon: 'cancel', color: Colors.statusClosed, bg: Colors.statusClosedBg, border: 'rgba(239,68,68,0.3)' },
];

interface StatusSelectorProps {
  currentStatus: RestaurantStatus;
  onSelect: (status: RestaurantStatus) => void;
  isRTL?: boolean;
}

export const StatusSelector = memo(function StatusSelector({ currentStatus, onSelect, isRTL = false }: StatusSelectorProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {STATUS_OPTIONS.map((opt) => {
        const isSelected = currentStatus === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={({ pressed }) => [
              styles.option,
              isSelected && { backgroundColor: opt.bg, borderColor: opt.border },
              pressed && !isSelected && styles.pressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: isSelected ? opt.bg : Colors.charcoal700 }]}>
              <MaterialIcons name={opt.icon} size={20} color={isSelected ? opt.color : Colors.textMuted} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, isSelected && { color: opt.color }, isRTL && styles.rtlText]}>
                {t(opt.labelKey)}
              </Text>
              <Text style={[styles.optionDesc, isRTL && styles.rtlText]} numberOfLines={1}>
                {t(opt.descKey)}
              </Text>
            </View>
            {isSelected ? (
              <MaterialIcons name="check-circle" size={18} color={opt.color} />
            ) : (
              <View style={styles.emptyCheck} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.charcoal700,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pressed: { backgroundColor: Colors.charcoal600 },
  iconCircle: {
    width: 40, height: 40,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionLabel: { ...Typography.h4, color: Colors.text } as any,
  optionDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  emptyCheck: { width: 18, height: 18 },
  rtlText: { textAlign: 'right' },
});

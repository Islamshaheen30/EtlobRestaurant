// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Shadow, Radius } from '@/constants/theme';
import { useLanguage } from '@/hooks/useLanguage';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: { icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; label?: string };
  leftAction?: { icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void };
}

export const ScreenHeader = memo(function ScreenHeader({ title, subtitle, rightAction, leftAction }: ScreenHeaderProps) {
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.container, isRTL && styles.rowReverse]}>
      {leftAction ? (
        <Pressable onPress={leftAction.onPress} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <MaterialIcons name={leftAction.icon} size={22} color={Colors.textSecondary} />
        </Pressable>
      ) : <View style={styles.iconBtn} />}

      <View style={[styles.titleGroup, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{subtitle}</Text> : null}
      </View>

      {rightAction ? (
        <Pressable onPress={rightAction.onPress} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
          <MaterialIcons name={rightAction.icon} size={18} color={Colors.primaryText} />
          {rightAction.label ? <Text style={styles.addBtnText}>{rightAction.label}</Text> : null}
        </Pressable>
      ) : <View style={styles.iconBtn} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  titleGroup: { flex: 1, alignItems: 'flex-start' },
  title: { ...Typography.h3, color: Colors.text } as any,
  subtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 1 } as any,
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    ...Shadow.gold,
  },
  addBtnText: { ...Typography.label, color: Colors.primaryText, fontWeight: '700' } as any,
  rtlText: { textAlign: 'right' },
});

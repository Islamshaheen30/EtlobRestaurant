// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Typography, Spacing } from '@/constants/theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default' | 'open' | 'closed' | 'busy' | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  success: { bg: Colors.successBg, text: Colors.success },
  danger: { bg: Colors.dangerBg, text: Colors.danger },
  warning: { bg: Colors.warningBg, text: Colors.warning },
  info: { bg: Colors.infoBg, text: Colors.info },
  default: { bg: Colors.charcoal600, text: Colors.textSecondary },
  gold: { bg: 'rgba(255,215,0,0.15)', text: Colors.primary, border: 'rgba(255,215,0,0.3)' },
  open: { bg: Colors.statusOpenBg, text: Colors.statusOpen },
  closed: { bg: Colors.statusClosedBg, text: Colors.statusClosed },
  busy: { bg: Colors.statusBusyBg, text: Colors.statusBusy },
};

export const Badge = memo(function Badge({ label, variant = 'default', size = 'md', style }: BadgeProps) {
  const vs = variantStyles[variant];
  return (
    <View style={[
      styles.base,
      size === 'sm' && styles.small,
      { backgroundColor: vs.bg },
      vs.border ? { borderWidth: 1, borderColor: vs.border } : null,
      style,
    ]}>
      <Text style={[styles.text, size === 'sm' && styles.textSmall, { color: vs.text }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  small: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  text: { ...Typography.label, fontWeight: '600' } as any,
  textSmall: { fontSize: 10 },
});

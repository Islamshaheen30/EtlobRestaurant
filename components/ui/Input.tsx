// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { Colors, Radius, Typography, Spacing } from '@/constants/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  style?: ViewStyle;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rtl?: boolean;
}

export const Input = memo(function Input({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  keyboardType = 'default', multiline = false, numberOfLines = 1, error,
  style, editable = true, autoCapitalize = 'sentences', rtl = false,
}: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        editable={editable}
        autoCapitalize={autoCapitalize}
        textAlign={rtl ? 'right' : 'left'}
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
          rtl && styles.rtlInput,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { ...Typography.label, color: Colors.textSecondary } as any,
  input: {
    backgroundColor: Colors.charcoal700,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.body,
    color: Colors.text,
    minHeight: 46,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top', paddingTop: Spacing.sm + 2 },
  inputError: { borderColor: Colors.danger },
  inputDisabled: { backgroundColor: Colors.charcoal800, color: Colors.textMuted },
  rtlInput: { textAlign: 'right' },
  error: { ...Typography.caption, color: Colors.danger } as any,
});

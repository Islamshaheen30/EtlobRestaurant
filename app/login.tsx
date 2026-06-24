// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function LoginScreen() {
  const { user, login, isLoading } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();

  const [credential, setCredential] = useState('owner@etlob.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeHint, setActiveHint] = useState<'owner' | 'accountant' | 'call_center'>('owner');

  if (user) return <Redirect href="/(tabs)" />;

  const HINTS = [
    { key: 'owner' as const, labelEn: 'Owner', labelAr: 'صاحب المطعم', cred: 'owner@etlob.com', pass: '123456', color: Colors.primary, icon: 'store' as const },
    { key: 'accountant' as const, labelEn: 'Accountant', labelAr: 'محاسب', cred: 'hana_acc', pass: 'acc123', color: Colors.info, icon: 'calculate' as const },
    { key: 'call_center' as const, labelEn: 'Call Center', labelAr: 'مركز الاتصال', cred: 'karim_cc', pass: 'cc456', color: Colors.warning, icon: 'headset-mic' as const },
  ];

  const applyHint = (h: typeof HINTS[0]) => {
    setActiveHint(h.key);
    setCredential(h.cred);
    setPassword(h.pass);
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    if (!credential || !password) { setError(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    const success = await login(credential, password);
    if (!success) setError(t('invalidCredentials'));
  };

  return (
    <View style={styles.root}>
      {/* Left Panel */}
      <View style={styles.leftPanel}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
        <View style={styles.leftOverlay} />
        <View style={styles.leftContent}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🍽</Text>
          </View>
          <Text style={styles.leftTitle}>Etlob{'\n'}Restaurant</Text>
          <Text style={styles.leftSubtitle}>
            {language === 'ar' ? 'إدارة مطعمك بكفاءة عالية' : 'Manage your restaurant with confidence'}
          </Text>
          {[
            { icon: 'restaurant-menu' as const, textEn: 'Menu Management', textAr: 'إدارة القائمة' },
            { icon: 'receipt-long' as const, textEn: 'Order Tracking', textAr: 'إدارة الطلبات' },
            { icon: 'bar-chart' as const, textEn: 'Analytics & Financials', textAr: 'التحليلات والمالية' },
            { icon: 'group' as const, textEn: 'Staff Management', textAr: 'إدارة الموظفين' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}><MaterialIcons name={f.icon} size={15} color={Colors.primaryText} /></View>
              <Text style={styles.featureText}>{language === 'ar' ? f.textAr : f.textEn}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Right Panel */}
      <KeyboardAvoidingView style={styles.rightPanel} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Lang Toggle */}
          <Pressable
            onPress={toggleLanguage}
            style={({ pressed }) => [styles.langBtn, isRTL && styles.langBtnRTL, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="language" size={15} color={Colors.primary} />
            <Text style={styles.langBtnText}>{language === 'en' ? 'عربي' : 'English'}</Text>
          </Pressable>

          {/* Mobile Logo */}
          <View style={styles.mobileLogo}>
            <View style={styles.mobileLogoMark}><Text style={styles.logoEmoji}>🍽</Text></View>
            <View>
              <Text style={styles.mobileBrand}>Etlob Restaurant</Text>
              <Text style={styles.mobileTagline}>{language === 'ar' ? 'بوابة إدارة المطعم' : 'Restaurant Management Portal'}</Text>
            </View>
          </View>

          {/* Role Hint Chips */}
          <View style={styles.hintSection}>
            <Text style={[styles.hintTitle, isRTL && styles.rtlText]}>
              {language === 'ar' ? 'اختر حسابك التجريبي:' : 'Try a demo account:'}
            </Text>
            <View style={[styles.hintChips, isRTL && styles.rowReverse]}>
              {HINTS.map(h => (
                <Pressable
                  key={h.key}
                  onPress={() => applyHint(h)}
                  style={[styles.hintChip, activeHint === h.key && { borderColor: h.color, backgroundColor: `${h.color}12` }]}
                >
                  <MaterialIcons name={h.icon} size={14} color={activeHint === h.key ? h.color : Colors.textMuted} />
                  <Text style={[styles.hintChipText, activeHint === h.key && { color: h.color, fontWeight: '700' }]}>
                    {language === 'ar' ? h.labelAr : h.labelEn}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('loginTitle')}</Text>
              <Text style={[styles.cardSubtitle, isRTL && styles.rtlText]}>{t('loginSubtitle')}</Text>
            </View>

            <View style={styles.form}>
              <Input
                label={t('email')}
                value={credential}
                onChangeText={setCredential}
                placeholder={language === 'ar' ? 'البريد أو اسم المستخدم' : 'Email or username'}
                keyboardType="email-address"
                autoCapitalize="none"
                rtl={isRTL}
              />
              <View style={styles.passwordField}>
                <Input
                  label={t('password')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  rtl={isRTL}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={18} color={Colors.charcoal300} />
                </Pressable>
              </View>

              {error ? (
                <View style={[styles.errorRow, isRTL && styles.rowReverse]}>
                  <MaterialIcons name="error-outline" size={15} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button label={t('loginButton')} onPress={handleLogin} loading={isLoading} fullWidth size="lg" />
            </View>

            {/* Active creds */}
            <View style={[styles.demoHint, isRTL && styles.rowReverse]}>
              <MaterialIcons name="vpn-key" size={13} color={Colors.charcoal300} />
              <Text style={styles.demoText}>
                {credential} / {password}
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>© 2024 Etlob Platform</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  leftPanel: {
    width: '40%', minWidth: 280,
    display: Platform.OS === 'web' ? 'flex' : 'none',
    position: 'relative', backgroundColor: Colors.charcoal900,
  },
  leftOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.72)' },
  leftContent: { flex: 1, padding: Spacing.xl, justifyContent: 'center', gap: Spacing.lg },
  logoMark: { width: 52, height: 52, backgroundColor: Colors.primary, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', ...Shadow.gold },
  logoEmoji: { fontSize: 24 },
  leftTitle: { fontSize: 36, fontWeight: '800', color: Colors.text, lineHeight: 44 },
  leftSubtitle: { fontSize: 15, color: Colors.charcoal200, lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureIcon: { width: 28, height: 28, backgroundColor: Colors.primary, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 13, color: Colors.charcoal100, fontWeight: '500' },
  rightPanel: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.charcoal700, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  langBtnRTL: { alignSelf: 'flex-start' },
  langBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  mobileLogo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Platform.select({ web: { display: 'none' } }) },
  mobileLogoMark: { width: 42, height: 42, backgroundColor: Colors.primary, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  mobileBrand: { fontSize: 18, fontWeight: '800', color: Colors.text },
  mobileTagline: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  hintSection: { gap: Spacing.sm },
  hintTitle: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  hintChips: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  hintChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.charcoal700,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  hintChipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  formCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardHeader: { padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.charcoal700, gap: 4 },
  cardTitle: { ...Typography.h2, color: Colors.text } as any,
  cardSubtitle: { ...Typography.bodySmall, color: Colors.textMuted } as any,
  form: { padding: Spacing.xl, gap: Spacing.md },
  passwordField: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, bottom: 13, padding: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  errorText: { ...Typography.bodySmall, color: Colors.danger, flex: 1 } as any,
  demoHint: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.charcoal700, borderTopWidth: 1, borderTopColor: Colors.border },
  demoText: { ...Typography.caption, color: Colors.charcoal200, fontFamily: 'monospace' } as any,
  footer: { textAlign: 'center', ...Typography.caption, color: Colors.textMuted } as any,
  rowReverse: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right' },
});

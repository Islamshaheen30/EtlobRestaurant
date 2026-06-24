// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAlert } from '@/template';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

interface SectionProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
  isRTL?: boolean;
  accent?: string;
}

function Section({ icon, title, children, isRTL = false, accent = Colors.primary }: SectionProps) {
  return (
    <View style={[sectionStyles.wrap, { borderLeftColor: accent }]}>
      <View style={[sectionStyles.header, isRTL && sectionStyles.rowReverse]}>
        <View style={[sectionStyles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <MaterialIcons name={icon} size={16} color={accent} />
        </View>
        <Text style={[sectionStyles.title, isRTL && sectionStyles.rtlText]}>{title}</Text>
      </View>
      <View style={sectionStyles.content}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.charcoal700 },
  iconWrap: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.h4, color: Colors.text } as any,
  content: { padding: Spacing.lg, gap: Spacing.md },
  rowReverse: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right' },
});

export default function SettingsScreen() {
  const { restaurant, updateRestaurant } = useRestaurant();
  const { t, language, isRTL, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [nameEn, setNameEn] = useState(restaurant.nameEn);
  const [nameAr, setNameAr] = useState(restaurant.nameAr);
  const [addressEn, setAddressEn] = useState(restaurant.addressEn);
  const [addressAr, setAddressAr] = useState(restaurant.addressAr);
  const [phone, setPhone] = useState(restaurant.phone);
  const [email, setEmail] = useState(restaurant.email);
  const [lat, setLat] = useState(String(restaurant.latitude));
  const [lng, setLng] = useState(String(restaurant.longitude));
  const [prepTime, setPrepTime] = useState(String(restaurant.averagePrepTime));
  const [commission, setCommission] = useState(String(restaurant.adminCommissionEGP));
  const [closingTime, setClosingTime] = useState(restaurant.dailyClosingTime);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    setNameEn(restaurant.nameEn); setNameAr(restaurant.nameAr);
    setAddressEn(restaurant.addressEn); setAddressAr(restaurant.addressAr);
    setPhone(restaurant.phone); setEmail(restaurant.email);
    setLat(String(restaurant.latitude)); setLng(String(restaurant.longitude));
    setPrepTime(String(restaurant.averagePrepTime));
    setCommission(String(restaurant.adminCommissionEGP));
    setClosingTime(restaurant.dailyClosingTime);
  }, [restaurant]);

  // Non-owners see restricted view
  if (user?.role !== 'owner') {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('settings')}</Text>
        </View>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isRTL && styles.rtlText]}>{user?.name}</Text>
              <Text style={[styles.profileEmail, isRTL && styles.rtlText]}>@{user?.username}</Text>
            </View>
            <Badge label={user?.role === 'accountant' ? t('accountant') : t('call_center')} variant={user?.role === 'accountant' ? 'info' : 'warning'} size="sm" />
          </View>
          <Section icon="language" title={t('language')} isRTL={isRTL} accent={Colors.info}>
            <View style={styles.langRow}>
              {(['en', 'ar'] as const).map(lang => (
                <Pressable key={lang} onPress={() => setLanguage(lang)} style={[styles.langOption, language === lang && styles.langOptionActive]}>
                  <Text style={styles.langFlag}>{lang === 'en' ? '🇬🇧' : '🇸🇦'}</Text>
                  <Text style={[styles.langOptionText, language === lang && styles.langOptionTextActive]}>{lang === 'en' ? t('english') : t('arabic')}</Text>
                  {language === lang ? <MaterialIcons name="check-circle" size={16} color={Colors.primary} /> : null}
                </Pressable>
              ))}
            </View>
          </Section>
          <Pressable
            onPress={() => showAlert(t('logout'), language === 'ar' ? 'هل تريد تسجيل الخروج؟' : 'Are you sure you want to logout?', [
              { text: t('cancel'), style: 'cancel' },
              { text: t('logout'), style: 'destructive', onPress: logout },
            ])}
            style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="logout" size={18} color={Colors.danger} />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const handleSave = () => {
    updateRestaurant({
      nameEn, nameAr, addressEn, addressAr, phone, email,
      latitude: parseFloat(lat) || restaurant.latitude,
      longitude: parseFloat(lng) || restaurant.longitude,
      averagePrepTime: parseInt(prepTime) || restaurant.averagePrepTime,
      adminCommissionEGP: parseFloat(commission) || restaurant.adminCommissionEGP,
      dailyClosingTime: closingTime || restaurant.dailyClosingTime,
    });
    showAlert(t('success'), t('settingsSaved'));
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { showAlert(t('error'), language === 'ar' ? 'تم رفض إذن الموقع' : 'Location permission denied'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLat(loc.coords.latitude.toFixed(6));
      setLng(loc.coords.longitude.toFixed(6));
      showAlert(t('success'), t('locationUpdated'));
    } catch {
      showAlert(t('error'), language === 'ar' ? 'تعذر الحصول على الموقع' : 'Could not get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('restaurantSettings')}</Text>
        <Button label={t('saveSettings')} onPress={handleSave} variant="primary" size="sm" />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}>

          {/* Profile */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}><Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text></View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isRTL && styles.rtlText]}>{user?.name}</Text>
              <Text style={[styles.profileEmail, isRTL && styles.rtlText]}>{user?.email}</Text>
            </View>
            <Badge label="Owner" variant="gold" size="sm" />
          </View>

          {/* Language */}
          <Section icon="language" title={t('language')} isRTL={isRTL} accent={Colors.info}>
            <View style={styles.langRow}>
              {(['en', 'ar'] as const).map(lang => (
                <Pressable key={lang} onPress={() => setLanguage(lang)} style={[styles.langOption, language === lang && styles.langOptionActive]}>
                  <Text style={styles.langFlag}>{lang === 'en' ? '🇬🇧' : '🇸🇦'}</Text>
                  <Text style={[styles.langOptionText, language === lang && styles.langOptionTextActive]}>{lang === 'en' ? t('english') : t('arabic')}</Text>
                  {language === lang ? <MaterialIcons name="check-circle" size={16} color={Colors.primary} /> : null}
                </Pressable>
              ))}
            </View>
          </Section>

          {/* Restaurant Info */}
          <Section icon="restaurant" title={language === 'ar' ? 'معلومات المطعم' : 'Restaurant Info'} isRTL={isRTL} accent={Colors.warning}>
            <View style={styles.twoCol}>
              <Input label={t('restaurantName')} value={nameEn} onChangeText={setNameEn} style={styles.halfInput} />
              <Input label={t('restaurantNameAr')} value={nameAr} onChangeText={setNameAr} rtl style={styles.halfInput} />
            </View>
            <Input label={t('restaurantAddress')} value={addressEn} onChangeText={setAddressEn} />
            <Input label={t('restaurantAddressAr')} value={addressAr} onChangeText={setAddressAr} rtl />
            <View style={styles.twoCol}>
              <Input label={t('restaurantPhone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.halfInput} />
              <Input label={t('restaurantEmail')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.halfInput} />
            </View>
          </Section>

          {/* Commission & Closing Time */}
          <Section icon="payments" title={t('commissionSettings')} isRTL={isRTL} accent={Colors.success}>
            <View style={styles.twoCol}>
              <Input
                label={`${t('adminCommissionEGP')} *`}
                value={commission}
                onChangeText={setCommission}
                keyboardType="numeric"
                style={styles.halfInput}
              />
              <Input
                label={`${t('dailyClosingTime')} (HH:MM)`}
                value={closingTime}
                onChangeText={setClosingTime}
                placeholder="22:00"
                style={styles.halfInput}
              />
            </View>
            <View style={[styles.commHint, isRTL && styles.rowReverse]}>
              <MaterialIcons name="info-outline" size={13} color={Colors.textMuted} />
              <Text style={[styles.hintText, isRTL && styles.rtlText]}>
                {t('commissionDesc')}
              </Text>
            </View>
          </Section>

          {/* GPS */}
          <Section icon="location-on" title={t('gpsLocation')} isRTL={isRTL} accent={Colors.danger}>
            <View style={styles.twoCol}>
              <Input label={t('latitude')} value={lat} onChangeText={setLat} keyboardType="numeric" style={styles.halfInput} />
              <Input label={t('longitude')} value={lng} onChangeText={setLng} keyboardType="numeric" style={styles.halfInput} />
            </View>
            <Button label={t('useCurrentLocation')} onPress={handleGetLocation} variant="dark" size="sm" loading={isGettingLocation} style={{ alignSelf: 'flex-start' }} />
          </Section>

          {/* Prep Time */}
          <Section icon="schedule" title={t('averagePrepTime')} isRTL={isRTL} accent={Colors.primary}>
            <View style={styles.twoCol}>
              <Input label={`${t('averagePrepTime')} (${t('minutes')})`} value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" style={styles.halfInput} />
              <View style={styles.prepHintCard}>
                <MaterialIcons name="timer" size={20} color={Colors.primary} />
                <Text style={styles.prepHintText}>{language === 'ar' ? 'يظهر للعملاء في التطبيق' : 'Shown to customers in app'}</Text>
              </View>
            </View>
          </Section>

          {/* Notifications */}
          <Section icon="notifications" title={t('notifications')} isRTL={isRTL} accent={Colors.warning}>
            {[
              { label: t('enableNotifications'), value: notificationsEnabled, onChange: setNotificationsEnabled },
              { label: t('sound'), value: soundEnabled, onChange: setSoundEnabled },
            ].map((item, i) => (
              <View key={i} style={[styles.toggleRow, isRTL && styles.rowReverse]}>
                <Text style={[styles.toggleLabel, isRTL && styles.rtlText]}>{item.label}</Text>
                <Switch value={item.value} onValueChange={item.onChange} trackColor={{ false: Colors.charcoal500, true: 'rgba(255,215,0,0.3)' }} thumbColor={item.value ? Colors.primary : Colors.charcoal300} />
              </View>
            ))}
          </Section>

          {/* Logout */}
          <Pressable
            onPress={() => showAlert(t('logout'), language === 'ar' ? 'هل تريد تسجيل الخروج؟' : 'Are you sure you want to logout?', [
              { text: t('cancel'), style: 'cancel' },
              { text: t('logout'), style: 'destructive', onPress: logout },
            ])}
            style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="logout" size={18} color={Colors.danger} />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowReverse: { flexDirection: 'row-reverse' },
  pageTitle: { ...Typography.h3, color: Colors.text } as any,
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  avatarWrap: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.primaryText },
  profileInfo: { flex: 1 },
  profileName: { ...Typography.h4, color: Colors.text } as any,
  profileEmail: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  langRow: { flexDirection: 'row', gap: Spacing.md },
  langOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.charcoal700, borderWidth: 1.5, borderColor: Colors.border },
  langOptionActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,215,0,0.08)' },
  langFlag: { fontSize: 18 },
  langOptionText: { ...Typography.body, color: Colors.textSecondary, flex: 1 } as any,
  langOptionTextActive: { color: Colors.primary, fontWeight: '600' },
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  commHint: { flexDirection: 'row', gap: 5, alignItems: 'flex-start' },
  hintText: { ...Typography.caption, color: Colors.textMuted, flex: 1 } as any,
  prepHintCard: { flex: 1, backgroundColor: Colors.charcoal700, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border },
  prepHintText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  toggleLabel: { ...Typography.body, color: Colors.text } as any,
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.dangerBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { ...Typography.h4, color: Colors.danger } as any,
  rtlText: { textAlign: 'right' },
});

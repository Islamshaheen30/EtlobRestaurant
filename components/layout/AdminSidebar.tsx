// Powered by OnSpace.AI
// Admin-style sidebar navigation for web/tablet + bottom tab for mobile
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';

interface NavItem {
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
  labelAr: string;
  labelEn: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: '/(tabs)', icon: 'dashboard', labelKey: 'dashboard', labelEn: 'Dashboard', labelAr: 'الرئيسية' },
  { route: '/(tabs)/menu', icon: 'restaurant-menu', labelKey: 'menu', labelEn: 'Menu', labelAr: 'القائمة' },
  { route: '/(tabs)/orders', icon: 'receipt-long', labelKey: 'orders', labelEn: 'Orders', labelAr: 'الطلبات' },
  { route: '/(tabs)/riders', icon: 'delivery-dining', labelKey: 'riders', labelEn: 'Riders', labelAr: 'المندوبين' },
  { route: '/(tabs)/settings', icon: 'settings', labelKey: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات' },
];

interface SidebarProps {
  isCollapsed?: boolean;
}

export const AdminSidebar = memo(function AdminSidebar({ isCollapsed = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const { restaurant, orders } = useRestaurant();

  const newOrderCount = orders.filter(o => o.status === 'new').length;
  const restName = language === 'ar' ? restaurant.nameAr : restaurant.nameEn;

  const isActive = (route: string) => {
    if (route === '/(tabs)') return pathname === '/' || pathname === '/index' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  return (
    <View style={[styles.sidebar, isCollapsed && styles.collapsed]}>
      {/* Logo */}
      <View style={[styles.logoArea, isCollapsed && styles.logoCollapsed]}>
        <View style={styles.logoMark}>
          <Text style={styles.logoEmoji}>🍽</Text>
        </View>
        {!isCollapsed && (
          <View style={styles.logoText}>
            <Text style={styles.logoName}>Etlob</Text>
            <Text style={styles.logoSub}>Restaurant</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Restaurant Info */}
      {!isCollapsed && (
        <View style={styles.restInfo}>
          <View style={[styles.statusDot, {
            backgroundColor: restaurant.status === 'open' ? Colors.statusOpen
              : restaurant.status === 'closed' ? Colors.statusClosed : Colors.statusBusy
          }]} />
          <Text style={styles.restName} numberOfLines={1}>{restName}</Text>
        </View>
      )}

      {/* Nav Items */}
      <View style={styles.navList}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.route);
          const label = language === 'ar' ? item.labelAr : item.labelEn;
          const hasBadge = item.labelKey === 'orders' && newOrderCount > 0;

          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && !active && styles.navItemHover,
                isCollapsed && styles.navItemCollapsed,
              ]}
            >
              <View style={styles.navIconWrap}>
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={active ? Colors.primaryText : Colors.charcoal200}
                />
                {hasBadge && !isCollapsed ? null : hasBadge ? (
                  <View style={styles.dotBadge} />
                ) : null}
              </View>
              {!isCollapsed && (
                <>
                  <Text style={[styles.navLabel, active && styles.navLabelActive, isRTL && styles.rtlText]}>
                    {label}
                  </Text>
                  {hasBadge ? (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>{newOrderCount}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* User Footer */}
      {!isCollapsed ? (
        <View style={styles.userFooter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
            <Text style={styles.userRole}>Owner</Text>
          </View>
          <Pressable onPress={logout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.6 }]}>
            <MaterialIcons name="logout" size={18} color={Colors.charcoal200} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={logout} style={({ pressed }) => [styles.logoutBtnCollapsed, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="logout" size={18} color={Colors.charcoal200} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: Colors.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: Colors.sidebarBorder,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  collapsed: { width: 64 },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  logoCollapsed: { justifyContent: 'center', paddingHorizontal: Spacing.md },
  logoMark: {
    width: 36, height: 36,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 18 },
  logoText: { flex: 1 },
  logoName: { fontSize: 16, fontWeight: '800', color: Colors.text, letterSpacing: 0.5 },
  logoSub: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  restInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  restName: { ...Typography.caption, color: Colors.textSecondary, flex: 1 } as any,
  navList: { gap: 2, paddingHorizontal: Spacing.sm, flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  navItemCollapsed: { justifyContent: 'center', gap: 0 },
  navItemActive: { backgroundColor: Colors.primary },
  navItemHover: { backgroundColor: Colors.charcoal700 },
  navIconWrap: { position: 'relative' },
  dotBadge: {
    position: 'absolute',
    top: -2, right: -2,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.sidebarBg,
  },
  navLabel: { ...Typography.body, color: Colors.charcoal200, flex: 1 } as any,
  navLabelActive: { color: Colors.primaryText, fontWeight: '700' },
  navBadge: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  navBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  avatar: {
    width: 32, height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primaryText },
  userInfo: { flex: 1 },
  userName: { ...Typography.label, color: Colors.text, fontWeight: '600' } as any,
  userRole: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  logoutBtn: { padding: 4 },
  logoutBtnCollapsed: {
    alignSelf: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  rtlText: { textAlign: 'right' },
});

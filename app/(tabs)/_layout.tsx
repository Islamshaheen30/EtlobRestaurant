// Powered by OnSpace.AI
// RBAC-aware tab layout: Owner sees all tabs; Accountant → Analytics+Financials; Call Center → Orders
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useRestaurant } from '@/hooks/useRestaurant';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { orders } = useRestaurant();

  if (!user) return <Redirect href="/login" />;

  const role = user.role;
  const newOrderCount = orders.filter(o => o.status === 'new').length;

  const tabBarStyle = {
    height: Platform.select({ ios: insets.bottom + 58, android: insets.bottom + 58, default: 64 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    elevation: 0,
    shadowOpacity: 0,
  };

  const screenOpts = {
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: Colors.tabActive,
    tabBarInactiveTintColor: Colors.tabInactive,
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const, marginTop: 2 },
    tabBarActiveBackgroundColor: 'transparent',
    tabBarInactiveBackgroundColor: 'transparent',
  };

  const isOwner = role === 'owner';
  const isAccountant = role === 'accountant';
  const isCallCenter = role === 'call_center';

  return (
    <Tabs screenOptions={screenOpts}>
      {/* Dashboard — Owner only */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          href: isOwner ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="dashboard" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Menu — Owner only */}
      <Tabs.Screen
        name="menu"
        options={{
          title: t('menu'),
          href: isOwner ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="restaurant-menu" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Orders — Owner + Call Center */}
      <Tabs.Screen
        name="orders"
        options={{
          title: isCallCenter ? t('incomingOrders') : t('orders'),
          href: (isOwner || isCallCenter) ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="receipt-long" size={size} color={color} />
            </View>
          ),
          tabBarBadge: newOrderCount > 0 ? newOrderCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.danger,
            color: '#fff',
            fontSize: 10,
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
        }}
      />

      {/* Riders — Owner only */}
      <Tabs.Screen
        name="riders"
        options={{
          title: t('riders'),
          href: isOwner ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="delivery-dining" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Analytics — Owner + Accountant */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          href: (isOwner || isAccountant) ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="bar-chart" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Financials — Owner + Accountant */}
      <Tabs.Screen
        name="financials"
        options={{
          title: t('financials'),
          href: (isOwner || isAccountant) ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="account-balance-wallet" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Staff — Owner only */}
      <Tabs.Screen
        name="staff"
        options={{
          title: t('staff'),
          href: isOwner ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="group" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Settings — Owner only */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          href: isOwner ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeWrap : undefined}>
              <MaterialIcons name="settings" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeWrap: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: Radius.sm,
    padding: 4,
  },
});

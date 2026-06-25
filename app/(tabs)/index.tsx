
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '@/services/supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchStats = async () => {
    const { data: orders } = await supabase.from('orders').select('*');
    if (orders) {
      const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0);
      const active = orders.filter(o => ['pending', 'preparing', 'ready', 'delivering'].includes(o.status)).length;
      setStats({ orders: orders.length, revenue, active });
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>لوحة تحكم المطعم</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name="shopping-bag" size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{stats.orders}</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="attach-money" size={24} color="#4ECDC4" />
          <Text style={styles.statValue}>{stats.revenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>إجمالي الأرباح</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="delivery-dining" size={24} color="#45B7D1" />
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>طلبات نشطة</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'right' },
  statsGrid: { padding: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  statLabel: { fontSize: 14, color: '#666' }
});

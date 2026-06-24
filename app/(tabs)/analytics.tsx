// Powered by OnSpace.AI
// Analytics screen — accessible by Owner and Accountant
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

type Period = '7' | '30' | '90';

export default function AnalyticsScreen() {
  const { dailyReports, orders } = useRestaurant();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('30');

  // Guard
  if (user?.role === 'call_center') {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <MaterialIcons name="lock" size={48} color={Colors.charcoal500} />
        <Text style={styles.accessDenied}>{t('accessDenied')}</Text>
      </View>
    );
  }

  const days = parseInt(period);
  const filteredReports = useMemo(() => dailyReports.slice(0, days), [dailyReports, days]);

  const summary = useMemo(() => {
    const gross = filteredReports.reduce((s, r) => s + r.grossRevenue, 0);
    const commission = filteredReports.reduce((s, r) => s + r.totalCommission, 0);
    const net = filteredReports.reduce((s, r) => s + r.netRevenue, 0);
    const totalOrders = filteredReports.reduce((s, r) => s + r.totalOrders, 0);
    const completedOrders = filteredReports.reduce((s, r) => s + r.completedOrders, 0);
    const cancelledOrders = filteredReports.reduce((s, r) => s + r.cancelledOrders, 0);
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const avgOrderValue = completedOrders > 0 ? Math.round(gross / completedOrders) : 0;
    const dailyAvgGross = filteredReports.length > 0 ? Math.round(gross / filteredReports.length) : 0;
    return { gross, commission, net, totalOrders, completedOrders, cancelledOrders, completionRate, avgOrderValue, dailyAvgGross };
  }, [filteredReports]);

  const periods: { key: Period; labelEn: string; labelAr: string }[] = [
    { key: '7', labelEn: '7 Days', labelAr: '7 أيام' },
    { key: '30', labelEn: '30 Days', labelAr: '30 يوم' },
    { key: '90', labelEn: '90 Days', labelAr: '90 يوم' },
  ];

  // Simple bar chart from last 14 days
  const chartData = useMemo(() => {
    const slice = dailyReports.slice(0, 14).reverse();
    const max = Math.max(...slice.map(r => r.netRevenue), 1);
    return slice.map(r => ({
      date: r.date.slice(5),  // MM-DD
      gross: r.grossRevenue,
      net: r.netRevenue,
      pct: r.netRevenue / max,
      orders: r.totalOrders,
    }));
  }, [dailyReports]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('analyticsTitle')}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.rtlText]}>
            {language === 'ar' ? `تحليل آخر ${period} يوم` : `Analyzing last ${period} days`}
          </Text>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodBar}>
        {periods.map(p => (
          <Pressable
            key={p.key}
            onPress={() => setPeriod(p.key)}
            style={[styles.periodChip, period === p.key && styles.periodChipActive]}
          >
            <Text style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}>
              {language === 'ar' ? p.labelAr : p.labelEn}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* Revenue Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.revenueCard, { borderTopColor: Colors.success }]}>
            <View style={[styles.cardIcon, { backgroundColor: Colors.successBg }]}>
              <MaterialIcons name="trending-up" size={16} color={Colors.success} />
            </View>
            <Text style={[styles.cardValue, { color: Colors.success }]}>{summary.gross.toLocaleString()}</Text>
            <Text style={styles.cardLabel}>{t('grossRevenue')}</Text>
            <Text style={styles.cardSub}>{t('egp')}</Text>
          </View>
          <View style={[styles.revenueCard, { borderTopColor: Colors.danger }]}>
            <View style={[styles.cardIcon, { backgroundColor: Colors.dangerBg }]}>
              <MaterialIcons name="remove-circle-outline" size={16} color={Colors.danger} />
            </View>
            <Text style={[styles.cardValue, { color: Colors.danger }]}>{summary.commission.toLocaleString()}</Text>
            <Text style={styles.cardLabel}>{t('totalCommissions')}</Text>
            <Text style={styles.cardSub}>{t('egp')}</Text>
          </View>
          <View style={[styles.revenueCard, { borderTopColor: Colors.primary }]}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
              <MaterialIcons name="account-balance-wallet" size={16} color={Colors.primary} />
            </View>
            <Text style={[styles.cardValue, { color: Colors.primary }]}>{summary.net.toLocaleString()}</Text>
            <Text style={styles.cardLabel}>{t('netRevenue')}</Text>
            <Text style={styles.cardSub}>{t('egp')}</Text>
          </View>
        </View>

        {/* KPI Row */}
        <View style={styles.kpiRow}>
          {[
            { icon: 'receipt-long' as const, value: summary.totalOrders, label: language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', color: Colors.info },
            { icon: 'check-circle-outline' as const, value: `${summary.completionRate}%`, label: t('completionRate'), color: Colors.success },
            { icon: 'attach-money' as const, value: summary.avgOrderValue, label: t('avgOrderValue'), color: Colors.warning },
            { icon: 'today' as const, value: summary.dailyAvgGross, label: t('dailyAvg'), color: Colors.charcoal200 },
          ].map((k, i) => (
            <View key={i} style={styles.kpiCard}>
              <MaterialIcons name={k.icon} size={16} color={k.color} />
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {language === 'ar' ? 'الإيرادات الصافية — آخر 14 يوم' : 'Net Revenue — Last 14 Days'}
          </Text>
          <View style={styles.chart}>
            {chartData.map((d, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${Math.max(d.pct * 100, 3)}%` }]} />
                </View>
                <Text style={styles.barDate}>{d.date}</Text>
                <Text style={styles.barOrders}>{d.orders}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.chartLegend, isRTL && styles.rowReverse]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>{t('netRevenue')} ({t('egp')})</Text>
            </View>
            <View style={styles.legendItem}>
              <MaterialIcons name="receipt" size={10} color={Colors.textMuted} />
              <Text style={styles.legendText}>{language === 'ar' ? 'عدد الطلبات' : 'Order Count'}</Text>
            </View>
          </View>
        </View>

        {/* Orders Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('ordersOverview')}</Text>
          {[
            { label: language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: summary.totalOrders, color: Colors.info, pct: 100 },
            { label: language === 'ar' ? 'طلبات مكتملة' : 'Completed', value: summary.completedOrders, color: Colors.success, pct: summary.totalOrders > 0 ? (summary.completedOrders / summary.totalOrders) * 100 : 0 },
            { label: language === 'ar' ? 'طلبات ملغاة' : 'Cancelled', value: summary.cancelledOrders, color: Colors.danger, pct: summary.totalOrders > 0 ? (summary.cancelledOrders / summary.totalOrders) * 100 : 0 },
          ].map((row, i) => (
            <View key={i} style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: row.color }]} />
              <Text style={[styles.breakdownLabel, isRTL && styles.rtlText]}>{row.label}</Text>
              <View style={styles.breakdownBarTrack}>
                <View style={[styles.breakdownBarFill, { width: `${row.pct}%`, backgroundColor: row.color }]} />
              </View>
              <Text style={[styles.breakdownValue, { color: row.color }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Revenue Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('revenueBreakdown')}</Text>
          {[
            { label: t('grossRevenue'), value: summary.gross, color: Colors.success },
            { label: t('totalCommissions'), value: summary.commission, color: Colors.danger },
            { label: t('netRevenue'), value: summary.net, color: Colors.primary },
          ].map((row, i) => (
            <View key={i} style={[styles.revRow, isRTL && styles.rowReverse]}>
              <View style={[styles.revDot, { backgroundColor: row.color }]} />
              <Text style={[styles.revLabel, isRTL && styles.rtlText]}>{row.label}</Text>
              <Text style={[styles.revValue, { color: row.color }]}>{row.value.toLocaleString()} {t('egp')}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  pageTitle: { ...Typography.h3, color: Colors.text } as any,
  pageSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  accessDenied: { ...Typography.h4, color: Colors.textMuted, marginTop: Spacing.md } as any,

  periodBar: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  periodChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.charcoal700,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  periodLabelActive: { color: Colors.primaryText },

  scroll: { padding: Spacing.md, gap: Spacing.md },

  cardRow: { flexDirection: 'row', gap: Spacing.sm },
  revenueCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.sm, alignItems: 'center', gap: 4,
    borderTopWidth: 2, borderWidth: 1, borderColor: Colors.border,
  },
  cardIcon: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  cardValue: { fontSize: 16, fontWeight: '800' },
  cardLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },
  cardSub: { fontSize: 9, color: Colors.textMuted },

  kpiRow: { flexDirection: 'row', gap: Spacing.sm },
  kpiCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.sm, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  kpiValue: { fontSize: 14, fontWeight: '800' },
  kpiLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },

  chartCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm } as any,
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  barWrap: { flex: 1, alignItems: 'center', gap: 2 },
  barTrack: { flex: 1, width: '100%', backgroundColor: Colors.charcoal700, borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  barDate: { fontSize: 7, color: Colors.textMuted, textAlign: 'center' },
  barOrders: { fontSize: 7, color: Colors.primary, fontWeight: '700', textAlign: 'center' },
  chartLegend: { flexDirection: 'row', gap: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textMuted },

  breakdownCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  breakdownDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  breakdownLabel: { ...Typography.bodySmall, color: Colors.textSecondary, width: 100 } as any,
  breakdownBarTrack: { flex: 1, height: 6, backgroundColor: Colors.charcoal700, borderRadius: 3, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 3 },
  breakdownValue: { fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right' },

  revRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  revDot: { width: 8, height: 8, borderRadius: 4 },
  revLabel: { ...Typography.body, color: Colors.textSecondary, flex: 1 } as any,
  revValue: { fontSize: 14, fontWeight: '700' },
  rtlText: { textAlign: 'right' },
});

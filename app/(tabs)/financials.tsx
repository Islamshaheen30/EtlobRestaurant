// Powered by OnSpace.AI
// Financials screen — accessible by Owner and Accountant
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { DailyReport } from '@/services/mockData';

function formatCurrency(n: number) { return n.toLocaleString(); }
function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr);
  return lang === 'ar'
    ? d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function FinancialsScreen() {
  const { financials, dailyReports, triggerDailyClose, restaurant } = useRestaurant();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Guard
  if (user?.role === 'call_center') {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <MaterialIcons name="lock" size={48} color={Colors.charcoal500} />
        <Text style={styles.accessDenied}>{t('accessDenied')}</Text>
      </View>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const lastReport = dailyReports[0];
  const hasClosedToday = lastReport?.date === todayStr && lastReport?.closedAt;

  const handleTriggerClose = () => {
    showAlert(
      language === 'ar' ? 'تأكيد إغلاق اليوم' : 'Confirm Daily Close',
      language === 'ar'
        ? `سيتم إغلاق اليوم وإنشاء تقرير في ${restaurant.dailyClosingTime}. هل تريد المتابعة؟`
        : `This will generate today's closing report. Proceed?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'ar' ? 'إغلاق الآن' : 'Close Now',
          style: 'default',
          onPress: () => {
            setIsClosing(true);
            setTimeout(() => {
              const report = triggerDailyClose();
              setIsClosing(false);
              setSelectedReport(report);
            }, 800);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('financialsTitle')}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.rtlText]}>
            {language === 'ar' ? `وقت الإغلاق: ${restaurant.dailyClosingTime}` : `Closing time: ${restaurant.dailyClosingTime}`}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* Today Snapshot */}
        <View style={styles.snapshotCard}>
          <View style={[styles.snapshotHeader, isRTL && styles.rowReverse]}>
            <View style={[styles.snapshotIconWrap, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
              <MaterialIcons name="today" size={18} color={Colors.primary} />
            </View>
            <View style={isRTL ? { alignItems: 'flex-end' } : {}}>
              <Text style={[styles.snapshotTitle, isRTL && styles.rtlText]}>{t('todaySnapshot')}</Text>
              <Text style={[styles.snapshotDate, isRTL && styles.rtlText]}>
                {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
            {hasClosedToday ? (
              <View style={styles.closedBadge}>
                <MaterialIcons name="check-circle" size={12} color={Colors.success} />
                <Text style={styles.closedBadgeText}>{language === 'ar' ? 'مغلق' : 'Closed'}</Text>
              </View>
            ) : null}
          </View>

          {/* Stats */}
          <View style={styles.snapshotStats}>
            <View style={styles.snapStat}>
              <Text style={[styles.snapStatValue, { color: Colors.success }]}>{formatCurrency(financials.todayGross)}</Text>
              <Text style={styles.snapStatLabel}>{t('grossEarnings')}</Text>
              <Text style={styles.snapStatSub}>{t('egp')}</Text>
            </View>
            <View style={styles.snapDivider} />
            <View style={styles.snapStat}>
              <Text style={[styles.snapStatValue, { color: Colors.danger }]}>{formatCurrency(financials.todayCommission)}</Text>
              <Text style={styles.snapStatLabel}>{t('platformFees')}</Text>
              <Text style={styles.snapStatSub}>{restaurant.adminCommissionEGP} {t('egp')} × {financials.todayCompleted}</Text>
            </View>
            <View style={styles.snapDivider} />
            <View style={styles.snapStat}>
              <Text style={[styles.snapStatValue, { color: Colors.primary }]}>{formatCurrency(financials.todayNet)}</Text>
              <Text style={styles.snapStatLabel}>{t('netEarnings')}</Text>
              <Text style={styles.snapStatSub}>{t('egp')}</Text>
            </View>
          </View>

          {/* Order summary row */}
          <View style={[styles.orderSummaryRow, isRTL && styles.rowReverse]}>
            {[
              { label: language === 'ar' ? 'إجمالي' : 'Total', value: financials.todayTotal, color: Colors.info },
              { label: language === 'ar' ? 'مكتملة' : 'Completed', value: financials.todayCompleted, color: Colors.success },
              { label: language === 'ar' ? 'ملغاة' : 'Cancelled', value: financials.todayCancelled, color: Colors.danger },
            ].map((s, i) => (
              <View key={i} style={[styles.orderSumItem, { borderColor: `${s.color}30`, backgroundColor: `${s.color}10` }]}>
                <Text style={[styles.orderSumValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.orderSumLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Commission explanation */}
          <View style={[styles.commRow, isRTL && styles.rowReverse]}>
            <MaterialIcons name="info-outline" size={13} color={Colors.textMuted} />
            <Text style={[styles.commText, isRTL && styles.rtlText]}>
              {language === 'ar'
                ? `عمولة المنصة: ${restaurant.adminCommissionEGP} ج.م / طلب مكتمل`
                : `Platform commission: ${restaurant.adminCommissionEGP} EGP per completed order`}
            </Text>
          </View>

          {/* Close Button */}
          {user?.role === 'owner' ? (
            <Button
              label={hasClosedToday
                ? (language === 'ar' ? 'تم الإغلاق اليوم' : 'Already Closed Today')
                : t('triggerClose')}
              onPress={handleTriggerClose}
              variant={hasClosedToday ? 'dark' : 'primary'}
              loading={isClosing}
              fullWidth
            />
          ) : null}
        </View>

        {/* Last Closing Info */}
        {lastReport?.closedAt ? (
          <View style={[styles.lastCloseCard, isRTL && styles.rowReverse]}>
            <View style={[styles.lastCloseIcon]}>
              <MaterialIcons name="history" size={16} color={Colors.info} />
            </View>
            <View style={isRTL ? { alignItems: 'flex-end', flex: 1 } : { flex: 1 }}>
              <Text style={[styles.lastCloseTitle, isRTL && styles.rtlText]}>{t('lastClosed')}</Text>
              <Text style={[styles.lastCloseTime, isRTL && styles.rtlText]}>
                {new Date(lastReport.closedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-GB')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.lastCloseNet, { color: Colors.primary }]}>{formatCurrency(lastReport.netRevenue)}</Text>
              <Text style={styles.lastCloseNetLabel}>{t('egp')} {t('netEarnings')}</Text>
            </View>
          </View>
        ) : null}

        {/* History */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t('reportHistory')} ({language === 'ar' ? `آخر ${dailyReports.length} يوم` : `Last ${dailyReports.length} days`})
          </Text>
          {dailyReports.slice(0, 30).map((report, idx) => (
            <Pressable
              key={report.date}
              onPress={() => setSelectedReport(report)}
              style={({ pressed }) => [styles.historyRow, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.historyDate, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.historyDateText}>{formatDate(report.date, language)}</Text>
                {report.closedAt ? (
                  <View style={styles.historyClosedDot} />
                ) : (
                  <View style={styles.historyOpenDot} />
                )}
              </View>
              <View style={styles.historyBars}>
                <View style={[styles.historyBarFill, { width: `${Math.min((report.netRevenue / 5000) * 100, 100)}%` }]} />
              </View>
              <View style={[styles.historyValues, isRTL && { alignItems: 'flex-start' }]}>
                <Text style={[styles.historyNet, { color: Colors.primary }]}>{formatCurrency(report.netRevenue)}</Text>
                <Text style={styles.historyOrderCount}>{report.completedOrders} {language === 'ar' ? 'طلب' : 'orders'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={16} color={Colors.charcoal400} />
            </Pressable>
          ))}
        </View>

      </ScrollView>

      {/* Report Detail Modal */}
      <Modal visible={!!selectedReport} transparent animationType="slide" onRequestClose={() => setSelectedReport(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedReport(null)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            {selectedReport ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Invoice Header */}
                <View style={[styles.invoiceHeader, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={[styles.invoiceTitle, isRTL && styles.rtlText]}>{t('closingReport')}</Text>
                  <Text style={[styles.invoiceDate, isRTL && styles.rtlText]}>
                    {new Date(selectedReport.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                  {selectedReport.closedAt ? (
                    <Text style={styles.invoiceClosedAt}>
                      {t('closedAt')}: {new Date(selectedReport.closedAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  ) : null}
                </View>

                {/* Divider */}
                <View style={styles.invoiceDivider} />

                {/* Line Items */}
                {[
                  { label: language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: String(selectedReport.totalOrders), color: Colors.text },
                  { label: language === 'ar' ? 'طلبات مكتملة' : 'Completed Orders', value: String(selectedReport.completedOrders), color: Colors.success },
                  { label: language === 'ar' ? 'طلبات ملغاة' : 'Cancelled Orders', value: String(selectedReport.cancelledOrders), color: Colors.danger },
                ].map((row, i) => (
                  <View key={i} style={[styles.invoiceRow, isRTL && styles.rowReverse]}>
                    <Text style={[styles.invoiceRowLabel, isRTL && styles.rtlText]}>{row.label}</Text>
                    <Text style={[styles.invoiceRowValue, { color: row.color }]}>{row.value}</Text>
                  </View>
                ))}

                <View style={styles.invoiceDivider} />

                {[
                  { label: t('grossRevenue'), value: `${formatCurrency(selectedReport.grossRevenue)} ${t('egp')}`, color: Colors.success },
                  { label: t('totalCommissions'), value: `- ${formatCurrency(selectedReport.totalCommission)} ${t('egp')}`, color: Colors.danger },
                ].map((row, i) => (
                  <View key={i} style={[styles.invoiceRow, isRTL && styles.rowReverse]}>
                    <Text style={[styles.invoiceRowLabel, isRTL && styles.rtlText]}>{row.label}</Text>
                    <Text style={[styles.invoiceRowValue, { color: row.color }]}>{row.value}</Text>
                  </View>
                ))}

                <View style={styles.invoiceDivider} />

                {/* Net Total */}
                <View style={[styles.netTotalRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.netTotalLabel, isRTL && styles.rtlText]}>{t('netRevenue')}</Text>
                  <Text style={styles.netTotalValue}>{formatCurrency(selectedReport.netRevenue)} {t('egp')}</Text>
                </View>

                <Button label={language === 'ar' ? 'إغلاق' : 'Close'} onPress={() => setSelectedReport(null)} variant="dark" fullWidth style={{ marginTop: Spacing.md }} />
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
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
  scroll: { padding: Spacing.md, gap: Spacing.md },

  snapshotCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    borderTopWidth: 3, borderTopColor: Colors.primary,
  },
  snapshotHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  snapshotIconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  snapshotTitle: { ...Typography.h3, color: Colors.text } as any,
  snapshotDate: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  closedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.successBg, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    marginLeft: 'auto',
  },
  closedBadgeText: { fontSize: 11, color: Colors.success, fontWeight: '700' },

  snapshotStats: { flexDirection: 'row', gap: 0, backgroundColor: Colors.charcoal700, borderRadius: Radius.lg, overflow: 'hidden' },
  snapStat: { flex: 1, alignItems: 'center', padding: Spacing.md, gap: 3 },
  snapDivider: { width: 1, backgroundColor: Colors.border },
  snapStatValue: { fontSize: 20, fontWeight: '800' },
  snapStatLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },
  snapStatSub: { fontSize: 9, color: Colors.charcoal400, textAlign: 'center' },

  orderSummaryRow: { flexDirection: 'row', gap: Spacing.sm },
  orderSumItem: { flex: 1, alignItems: 'center', padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, gap: 3 },
  orderSumValue: { fontSize: 18, fontWeight: '800' },
  orderSumLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },

  commRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commText: { ...Typography.caption, color: Colors.textMuted, flex: 1 } as any,

  lastCloseCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  lastCloseIcon: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.infoBg, alignItems: 'center', justifyContent: 'center' },
  lastCloseTitle: { ...Typography.label, color: Colors.textMuted } as any,
  lastCloseTime: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  lastCloseNet: { fontSize: 18, fontWeight: '800' },
  lastCloseNetLabel: { fontSize: 10, color: Colors.textMuted },

  historySection: { gap: Spacing.sm },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.xs } as any,
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  historyDate: { width: 56, alignItems: 'flex-start', gap: 3 },
  historyDateText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  historyClosedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  historyOpenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.charcoal400 },
  historyBars: { flex: 1, height: 6, backgroundColor: Colors.charcoal700, borderRadius: 3, overflow: 'hidden' },
  historyBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  historyValues: { alignItems: 'flex-end', width: 70 },
  historyNet: { fontSize: 13, fontWeight: '700' },
  historyOrderCount: { fontSize: 10, color: Colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    maxHeight: '80%', borderTopWidth: 1, borderColor: Colors.border,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.charcoal500, alignSelf: 'center', marginTop: Spacing.md },
  modalContent: { padding: Spacing.xl, gap: Spacing.sm },
  invoiceHeader: { gap: 4, marginBottom: Spacing.sm },
  invoiceTitle: { ...Typography.h2, color: Colors.text } as any,
  invoiceDate: { ...Typography.body, color: Colors.textSecondary } as any,
  invoiceClosedAt: { fontSize: 12, color: Colors.success, marginTop: 4 },
  invoiceDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  invoiceRowLabel: { ...Typography.body, color: Colors.textSecondary } as any,
  invoiceRowValue: { fontSize: 14, fontWeight: '700' },
  netTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  netTotalLabel: { ...Typography.h3, color: Colors.text } as any,
  netTotalValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  rtlText: { textAlign: 'right' },
});

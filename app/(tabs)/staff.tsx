// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView, Pressable, Modal,
  KeyboardAvoidingView, Platform, Switch, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { StaffMember, StaffRole } from '@/services/mockData';

interface StaffForm {
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  isActive: boolean;
}

const EMPTY_FORM: StaffForm = { name: '', username: '', password: '', role: 'call_center', isActive: true };

const ROLES: { id: StaffRole; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
  { id: 'accountant', icon: 'calculate', color: Colors.info },
  { id: 'call_center', icon: 'headset-mic', color: Colors.warning },
];

function RoleBadge({ role, language }: { role: StaffRole; language: string }) {
  const r = ROLES.find(x => x.id === role);
  const label = role === 'accountant'
    ? (language === 'ar' ? 'محاسب' : 'Accountant')
    : (language === 'ar' ? 'مركز اتصال' : 'Call Center');
  return (
    <View style={[rbStyles.wrap, { backgroundColor: `${r?.color ?? Colors.charcoal500}18`, borderColor: `${r?.color ?? Colors.charcoal500}40` }]}>
      <MaterialIcons name={r?.icon ?? 'person'} size={11} color={r?.color ?? Colors.charcoal300} />
      <Text style={[rbStyles.label, { color: r?.color ?? Colors.charcoal300 }]}>{label}</Text>
    </View>
  );
}
const rbStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '600' },
});

export default function StaffScreen() {
  const { staff, addStaff, updateStaff, deleteStaff } = useRestaurant();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);

  // Guard: only owner
  if (user?.role !== 'owner') {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <MaterialIcons name="lock" size={48} color={Colors.charcoal500} />
        <Text style={styles.accessDenied}>{t('accessDenied')}</Text>
      </View>
    );
  }

  const openAdd = () => {
    setEditingStaff(null);
    setForm(EMPTY_FORM);
    setShowPass(false);
    setModalVisible(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setForm({ name: member.name, username: member.username, password: member.password, role: member.role, isActive: member.isActive });
    setShowPass(false);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      showAlert(t('error'), language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    if (editingStaff) {
      updateStaff(editingStaff.id, form);
      showAlert(t('success'), t('staffUpdated'));
    } else {
      const ok = addStaff(form);
      if (!ok) {
        showAlert(t('error'), t('usernameTaken'));
        return;
      }
      showAlert(t('success'), t('staffCreated'));
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string, name: string) => {
    showAlert(t('confirmDeleteStaff'), `${t('confirmDeleteStaffMsg')} (${name})`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteStaff(id) },
    ]);
  };

  const roleLabel = (role: StaffRole) =>
    role === 'accountant'
      ? (language === 'ar' ? 'محاسب' : 'Accountant')
      : (language === 'ar' ? 'مركز اتصال' : 'Call Center');

  const roleDesc = (role: StaffRole) =>
    role === 'accountant'
      ? t('roleAccountantDesc')
      : t('roleCallCenterDesc');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View style={isRTL ? { alignItems: 'flex-end' } : {}}>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('staffManagement')}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.rtlText]}>
            {staff.length} {language === 'ar' ? 'موظف' : 'member(s)'}
          </Text>
        </View>
        <Pressable onPress={openAdd} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}>
          <MaterialIcons name="person-add" size={16} color={Colors.primaryText} />
          <Text style={styles.addBtnText}>{t('addStaff')}</Text>
        </Pressable>
      </View>

      {/* RBAC Info Banner */}
      <View style={[styles.infoBanner, isRTL && styles.rowReverse]}>
        <MaterialIcons name="info" size={15} color={Colors.info} />
        <Text style={[styles.infoText, isRTL && styles.rtlText]}>
          {language === 'ar'
            ? 'المحاسب: التحليلات والمالية فقط • مركز الاتصال: الطلبات الواردة فقط'
            : 'Accountant: Analytics & Financials only • Call Center: Incoming Orders only'}
        </Text>
      </View>

      <FlatList
        data={staff}
        keyExtractor={s => s.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.staffCard, isRTL && styles.rowReverse]}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: item.role === 'accountant' ? `${Colors.info}20` : `${Colors.warning}20` }]}>
              <MaterialIcons
                name={item.role === 'accountant' ? 'calculate' : 'headset-mic'}
                size={20}
                color={item.role === 'accountant' ? Colors.info : Colors.warning}
              />
            </View>

            {/* Info */}
            <View style={[styles.staffInfo, isRTL && { alignItems: 'flex-end' }]}>
              <View style={[styles.staffNameRow, isRTL && styles.rowReverse]}>
                <Text style={[styles.staffName, isRTL && styles.rtlText]}>{item.name}</Text>
                {!item.isActive ? (
                  <View style={styles.inactivePill}>
                    <Text style={styles.inactivePillText}>{language === 'ar' ? 'غير نشط' : 'Inactive'}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.staffUsername, isRTL && styles.rtlText]}>@{item.username}</Text>
              <View style={styles.staffMeta}>
                <RoleBadge role={item.role} language={language} />
                <Text style={styles.staffDate}>
                  {language === 'ar' ? 'منذ' : 'Since'} {item.createdAt.toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.staffActions}>
              <Pressable onPress={() => openEdit(item)} style={({ pressed }) => [styles.actionIcon, pressed && { opacity: 0.6 }]}>
                <MaterialIcons name="edit" size={17} color={Colors.primary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id, item.name)} style={({ pressed }) => [styles.actionIcon, pressed && { opacity: 0.6 }]}>
                <MaterialIcons name="delete-outline" size={17} color={Colors.danger} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="group-add" size={48} color={Colors.charcoal500} />
            <Text style={styles.emptyTitle}>{t('noStaff')}</Text>
            <Button label={t('addStaff')} onPress={openAdd} variant="outline" size="sm" />
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Modal Header */}
                <View style={[styles.modalHeader, isRTL && styles.rowReverse]}>
                  <Text style={[styles.modalTitle, isRTL && styles.rtlText]}>
                    {editingStaff ? t('editStaff') : t('addStaff')}
                  </Text>
                  <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <MaterialIcons name="close" size={20} color={Colors.textMuted} />
                  </Pressable>
                </View>

                {/* Name & Username */}
                <Input label={`${t('staffName')} *`} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'} rtl={isRTL} />
                <Input label={`${t('staffUsername')} *`} value={form.username} onChangeText={v => setForm(p => ({ ...p, username: v.toLowerCase().replace(/\s/g, '_') }))} placeholder="username_here" autoCapitalize="none" rtl={isRTL} />

                {/* Password */}
                <View style={styles.passwordWrap}>
                  <Input label={`${t('staffPassword')} *`} value={form.password} onChangeText={v => setForm(p => ({ ...p, password: v }))} secureTextEntry={!showPass} placeholder="••••••••" rtl={isRTL} />
                  <Pressable onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                    <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={17} color={Colors.charcoal300} />
                  </Pressable>
                </View>

                {/* Role */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.groupLabel}>{t('staffRole')} *</Text>
                  {ROLES.map(r => {
                    const isSel = form.role === r.id;
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => setForm(p => ({ ...p, role: r.id }))}
                        style={[styles.roleOption, isSel && { borderColor: r.color, backgroundColor: `${r.color}10` }]}
                      >
                        <View style={[styles.roleIcon, { backgroundColor: `${r.color}20` }]}>
                          <MaterialIcons name={r.icon} size={18} color={r.color} />
                        </View>
                        <View style={styles.roleTextWrap}>
                          <Text style={[styles.roleLabel, isSel && { color: r.color }]}>{roleLabel(r.id)}</Text>
                          <Text style={styles.roleDesc}>{roleDesc(r.id)}</Text>
                        </View>
                        {isSel ? <MaterialIcons name="check-circle" size={18} color={r.color} /> : <View style={styles.radioEmpty} />}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Active Toggle */}
                <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
                  <Text style={styles.toggleLabel}>{t('staffActive')}</Text>
                  <Switch
                    value={form.isActive}
                    onValueChange={v => setForm(p => ({ ...p, isActive: v }))}
                    trackColor={{ false: Colors.charcoal500, true: 'rgba(255,215,0,0.3)' }}
                    thumbColor={form.isActive ? Colors.primary : Colors.charcoal300}
                  />
                </View>

                {/* Actions */}
                <View style={[styles.modalActions, isRTL && styles.rowReverse]}>
                  <Button label={t('cancel')} variant="dark" onPress={() => setModalVisible(false)} style={styles.actionBtn} />
                  <Button label={editingStaff ? t('save') : t('addStaff')} variant="primary" onPress={handleSave} style={styles.actionBtn} />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  pageTitle: { ...Typography.h3, color: Colors.text } as any,
  pageSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.md, ...Shadow.gold,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primaryText },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.infoBg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(59,130,246,0.15)',
  },
  infoText: { ...Typography.caption, color: Colors.info, flex: 1 } as any,
  list: { padding: Spacing.md, gap: Spacing.sm },
  staffCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  staffInfo: { flex: 1, gap: 3 },
  staffNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  staffName: { ...Typography.h4, color: Colors.text } as any,
  inactivePill: { backgroundColor: Colors.charcoal600, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  inactivePillText: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  staffUsername: { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },
  staffMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  staffDate: { fontSize: 11, color: Colors.textMuted },
  staffActions: { flexDirection: 'row', gap: Spacing.sm },
  actionIcon: {
    width: 34, height: 34, borderRadius: Radius.md,
    backgroundColor: Colors.charcoal700, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { ...Typography.h4, color: Colors.textMuted } as any,
  accessDenied: { ...Typography.h4, color: Colors.textMuted, marginTop: Spacing.md } as any,

  // Modal
  modalRoot: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    maxHeight: '92%', borderTopWidth: 1, borderColor: Colors.border,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.charcoal500, alignSelf: 'center', marginTop: Spacing.md },
  modalScroll: { padding: Spacing.xl, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  modalTitle: { ...Typography.h3, color: Colors.text } as any,
  closeBtn: { padding: 4 },
  passwordWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, bottom: 13, padding: 4 },
  fieldGroup: { gap: Spacing.sm },
  groupLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.charcoal700, borderWidth: 1.5, borderColor: Colors.border,
  },
  roleIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  roleTextWrap: { flex: 1 },
  roleLabel: { ...Typography.body, color: Colors.text, fontWeight: '600' } as any,
  roleDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  radioEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.charcoal400 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.charcoal700,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
  },
  toggleLabel: { ...Typography.body, color: Colors.text } as any,
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  actionBtn: { flex: 1 },
  rtlText: { textAlign: 'right' },
});

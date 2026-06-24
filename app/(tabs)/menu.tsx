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
import { MenuItemCard } from '@/components/feature/MenuItemCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useLanguage } from '@/hooks/useLanguage';
import { MenuItem, MENU_CATEGORIES } from '@/services/mockData';

interface ItemForm {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  category: string;
  prepTime: string;
  isAvailable: boolean;
  imageUrl: string;
}

const EMPTY_FORM: ItemForm = {
  nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
  price: '', category: 'main', prepTime: '15', isAvailable: true, imageUrl: '',
};

export default function MenuScreen() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } = useRestaurant();
  const { t, language, isRTL } = useLanguage();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'all' ? menuItems : menuItems.filter(i => i.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.nameEn.toLowerCase().includes(q) || i.nameAr.includes(q));
    }
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const availableCount = menuItems.filter(i => i.isAvailable).length;

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      nameEn: item.nameEn, nameAr: item.nameAr,
      descriptionEn: item.descriptionEn, descriptionAr: item.descriptionAr,
      price: String(item.price), category: item.category,
      prepTime: String(item.prepTime), isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || '',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.nameEn || !form.nameAr || !form.price) {
      showAlert(t('error'), 'Please fill required fields (Name EN, Name AR, Price)');
      return;
    }
    const itemData = {
      nameEn: form.nameEn, nameAr: form.nameAr,
      descriptionEn: form.descriptionEn, descriptionAr: form.descriptionAr,
      price: parseFloat(form.price) || 0,
      category: form.category,
      prepTime: parseInt(form.prepTime) || 15,
      isAvailable: form.isAvailable,
      imageUrl: form.imageUrl || undefined,
    };
    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    showAlert(t('confirmDelete'), t('confirmDeleteMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteMenuItem(id) },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View style={isRTL ? { alignItems: 'flex-end' } : {}}>
          <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('menuManagement')}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.rtlText]}>
            {availableCount}/{menuItems.length} {language === 'ar' ? 'متاح' : 'available'}
          </Text>
        </View>
        <Pressable
          onPress={openAdd}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <MaterialIcons name="add" size={18} color={Colors.primaryText} />
          <Text style={styles.addBtnText}>{t('addItem')}</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={18} color={Colors.charcoal300} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={language === 'ar' ? 'بحث في القائمة...' : 'Search menu...'}
          placeholderTextColor={Colors.textMuted}
          style={[styles.searchInput, isRTL && styles.rtlText]}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={16} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Category Filter */}
      <View style={styles.catBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
          {MENU_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' ? menuItems.length : menuItems.filter(i => i.category === cat.id).length;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.catChip, isSelected && styles.catChipActive]}
              >
                <Text style={[styles.catLabel, isSelected && styles.catLabelActive]}>
                  {language === 'ar' ? cat.labelAr : cat.labelEn}
                </Text>
                {count > 0 ? (
                  <Text style={[styles.catCount, isSelected && styles.catCountActive]}>{count}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Item List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={toggleItemAvailability}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="restaurant-menu" size={48} color={Colors.charcoal500} />
            <Text style={styles.emptyText}>{t('noItems')}</Text>
            <Button label={t('addItem')} onPress={openAdd} variant="outline" size="sm" />
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHandle} />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Modal Header */}
                <View style={[styles.modalHeader, isRTL && styles.rowReverse]}>
                  <Text style={[styles.modalTitle, isRTL && styles.rtlText]}>
                    {editingItem ? t('editItem') : t('addItem')}
                  </Text>
                  <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <MaterialIcons name="close" size={20} color={Colors.textMuted} />
                  </Pressable>
                </View>

                {/* Form Fields */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.groupLabel}>{language === 'ar' ? 'الاسم *' : 'Name *'}</Text>
                  <View style={styles.twoCol}>
                    <Input label="English" value={form.nameEn} onChangeText={v => setForm(p => ({ ...p, nameEn: v }))} placeholder="Classic Koshary" style={styles.halfInput} />
                    <Input label="عربي" value={form.nameAr} onChangeText={v => setForm(p => ({ ...p, nameAr: v }))} placeholder="كشري كلاسيك" rtl style={styles.halfInput} />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.groupLabel}>{language === 'ar' ? 'الوصف' : 'Description'}</Text>
                  <Input label="English" value={form.descriptionEn} onChangeText={v => setForm(p => ({ ...p, descriptionEn: v }))} multiline numberOfLines={2} />
                  <Input label="عربي" value={form.descriptionAr} onChangeText={v => setForm(p => ({ ...p, descriptionAr: v }))} multiline numberOfLines={2} rtl />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.groupLabel}>{language === 'ar' ? 'السعر والوقت' : 'Price & Time'}</Text>
                  <View style={styles.twoCol}>
                    <Input label={`${t('itemPrice')} *`} value={form.price} onChangeText={v => setForm(p => ({ ...p, price: v }))} keyboardType="numeric" style={styles.halfInput} />
                    <Input label={t('prepTime')} value={form.prepTime} onChangeText={v => setForm(p => ({ ...p, prepTime: v }))} keyboardType="numeric" style={styles.halfInput} />
                  </View>
                </View>

                {/* Category */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.groupLabel}>{t('itemCategory')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catPicker}>
                    {MENU_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                      const isSel = form.category === cat.id;
                      return (
                        <Pressable
                          key={cat.id}
                          onPress={() => setForm(p => ({ ...p, category: cat.id }))}
                          style={[styles.catChip, isSel && styles.catChipActive, { marginRight: Spacing.xs }]}
                        >
                          <Text style={[styles.catLabel, isSel && styles.catLabelActive]}>
                            {language === 'ar' ? cat.labelAr : cat.labelEn}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <Input label={t('itemImage')} value={form.imageUrl} onChangeText={v => setForm(p => ({ ...p, imageUrl: v }))} placeholder="https://..." />

                {/* Availability */}
                <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
                  <View>
                    <Text style={styles.toggleLabel}>{t('available')}</Text>
                    <Text style={styles.toggleDesc}>{language === 'ar' ? 'ظاهر للعملاء' : 'Visible to customers'}</Text>
                  </View>
                  <Switch
                    value={form.isAvailable}
                    onValueChange={v => setForm(p => ({ ...p, isAvailable: v }))}
                    trackColor={{ false: Colors.charcoal500, true: 'rgba(255,215,0,0.3)' }}
                    thumbColor={form.isAvailable ? Colors.primary : Colors.charcoal300}
                  />
                </View>

                <View style={[styles.modalActions, isRTL && styles.rowReverse]}>
                  <Button label={t('cancel')} variant="dark" onPress={() => setModalVisible(false)} style={styles.actionBtn} />
                  <Button label={t('saveItem')} variant="primary" onPress={handleSave} style={styles.actionBtn} />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  pageTitle: { ...Typography.h3, color: Colors.text } as any,
  pageSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    ...Shadow.gold,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primaryText },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text, paddingVertical: 6 } as any,

  // Categories
  catBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.charcoal700,
    borderWidth: 1.5, borderColor: Colors.border,
    height: 34,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  catLabelActive: { color: Colors.primaryText, fontWeight: '700' },
  catCount: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  catCountActive: { color: 'rgba(0,0,0,0.5)' },

  list: { padding: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyText: { ...Typography.body, color: Colors.textMuted } as any,

  // Modal
  modalRoot: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.charcoal500, alignSelf: 'center', marginTop: Spacing.md },
  modalScroll: { padding: Spacing.xl, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  modalTitle: { ...Typography.h3, color: Colors.text } as any,
  closeBtn: { padding: 4 },
  fieldGroup: { gap: Spacing.sm },
  groupLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  twoCol: { flexDirection: 'row', gap: Spacing.sm },
  halfInput: { flex: 1 },
  catPicker: { marginVertical: Spacing.xs },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.charcoal700,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
  },
  toggleLabel: { ...Typography.h4, color: Colors.text } as any,
  toggleDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 } as any,
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  actionBtn: { flex: 1 },
  rtlText: { textAlign: 'right' },
});

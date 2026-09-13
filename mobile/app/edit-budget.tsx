import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Chip, Card } from '../components/ui';
import { useBudgetStore } from '../stores/budgetStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { PREDEFINED_CATEGORIES, MAX_CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

interface EditableCategory {
  id?: string;
  name: string;
  icon: string;
  color: string;
  allocatedAmount: string;
}

export default function EditBudgetScreen() {
  const router = useRouter();
  const { currentBudget, createBudget, refreshBudget } = useBudgetStore();
  const [totalBudget, setTotalBudget] = useState('');
  const [categories, setCategories] = useState<EditableCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    if (currentBudget) {
      setTotalBudget(currentBudget.totalAmount.toString());
      setCategories(
        currentBudget.categories.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          allocatedAmount: c.allocatedAmount.toString(),
        }))
      );
    }
  }, [currentBudget]);

  const totalAllocated = categories.reduce(
    (sum, c) => sum + (parseFloat(c.allocatedAmount) || 0), 0
  );
  const budgetNum = parseFloat(totalBudget) || 0;
  const remaining = budgetNum - totalAllocated;

  const updateAllocation = (index: number, amount: string) => {
    setCategories(prev =>
      prev.map((c, i) => i === index ? { ...c, allocatedAmount: amount } : c)
    );
  };

  const removeCategory = (index: number) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const addCategory = (cat: typeof PREDEFINED_CATEGORIES[0]) => {
    if (categories.length >= MAX_CATEGORIES) return;
    if (categories.find(c => c.name === cat.name)) return;
    setCategories(prev => [...prev, { ...cat, allocatedAmount: '' }]);
    setShowCategoryPicker(false);
  };

  const handleSave = async () => {
    if (remaining < 0) {
      Alert.alert('Error', 'Allocations exceed total budget');
      return;
    }
    setIsSubmitting(true);
    try {
      await createBudget({
        month,
        year,
        totalAmount: budgetNum,
        categories: categories.map((c, i) => ({
          name: c.name,
          icon: c.icon,
          color: c.color,
          allocatedAmount: parseFloat(c.allocatedAmount) || 0,
          sortOrder: i,
        })),
      });
      await refreshBudget();
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Budget</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Total budget */}
      <Card style={styles.section}>
        <Text style={styles.label}>Total Monthly Budget</Text>
        <View style={styles.budgetRow}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            style={styles.budgetInput}
            value={totalBudget}
            onChangeText={setTotalBudget}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </Card>

      {/* Unallocated badge */}
      <View style={styles.remainingBadge}>
        <Text style={[styles.remainingText, remaining < 0 && { color: colors.error }]}>
          {remaining >= 0 ? `${formatCurrency(remaining)} unallocated` : `${formatCurrency(Math.abs(remaining))} over budget!`}
        </Text>
      </View>

      {/* Categories */}
      {categories.map((cat, idx) => (
        <View key={cat.name} style={styles.catRow}>
          <TouchableOpacity onPress={() => removeCategory(idx)} style={styles.removeBtn}>
            <MaterialIcons name="remove-circle" size={20} color={colors.error} />
          </TouchableOpacity>
          <View style={[styles.catDot, { backgroundColor: cat.color }]} />
          <Text style={styles.catName}>{cat.name}</Text>
          <View style={styles.catInputWrap}>
            <Text style={styles.catCurrency}>₹</Text>
            <TextInput
              style={styles.catInput}
              value={cat.allocatedAmount}
              onChangeText={(v) => updateAllocation(idx, v)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      ))}

      {/* Add category button */}
      {categories.length < MAX_CATEGORIES && (
        <TouchableOpacity
          style={styles.addCatBtn}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <MaterialIcons name="add" size={20} color={colors.primary} />
          <Text style={styles.addCatText}>Add category</Text>
        </TouchableOpacity>
      )}

      {showCategoryPicker && (
        <View style={styles.pickerGrid}>
          {PREDEFINED_CATEGORIES
            .filter(pc => !categories.find(c => c.name === pc.name))
            .map(pc => (
              <Chip
                key={pc.name}
                label={pc.name}
                icon={pc.icon}
                color={pc.color}
                onPress={() => addCategory(pc)}
              />
            ))}
        </View>
      )}

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={isSubmitting}
        disabled={totalAllocated === 0 || remaining < 0}
        size="lg"
        style={{ marginTop: spacing.xxl }}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  section: { marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  budgetRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: fontSize.xxl, color: colors.textSecondary, marginRight: spacing.xs },
  budgetInput: { flex: 1, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  remainingBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  remainingText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeBtn: { marginRight: spacing.sm },
  catDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  catName: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  catInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  catCurrency: { fontSize: fontSize.md, color: colors.textSecondary },
  catInput: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    minWidth: 80,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    textAlign: 'right',
  },
  addCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  addCatText: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});

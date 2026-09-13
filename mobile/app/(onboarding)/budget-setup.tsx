import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Chip } from '../../components/ui';
import { useBudgetStore } from '../../stores/budgetStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { PREDEFINED_CATEGORIES, MAX_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

interface SelectedCategory {
  name: string;
  icon: string;
  color: string;
  allocatedAmount: string;
}

export default function BudgetSetupScreen() {
  const { createBudget } = useBudgetStore();
  const { setOnboardingComplete } = useAuthStore();
  const [step, setStep] = useState(1);
  const [totalBudget, setTotalBudget] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const toggleCategory = (cat: typeof PREDEFINED_CATEGORIES[0]) => {
    const exists = selectedCategories.find(c => c.name === cat.name);
    if (exists) {
      setSelectedCategories(prev => prev.filter(c => c.name !== cat.name));
    } else if (selectedCategories.length < MAX_CATEGORIES) {
      setSelectedCategories(prev => [...prev, { ...cat, allocatedAmount: '' }]);
    }
  };

  const updateAllocation = (name: string, amount: string) => {
    setSelectedCategories(prev =>
      prev.map(c => c.name === name ? { ...c, allocatedAmount: amount } : c)
    );
  };

  const totalAllocated = selectedCategories.reduce(
    (sum, c) => sum + (parseFloat(c.allocatedAmount) || 0), 0
  );
  const budgetNum = parseFloat(totalBudget) || 0;
  const remaining = budgetNum - totalAllocated;

  const handleSubmit = async () => {
    if (remaining < 0) {
      Alert.alert('Error', 'Category allocations exceed total budget');
      return;
    }
    setIsSubmitting(true);
    try {
      await createBudget({
        month,
        year,
        totalAmount: budgetNum,
        categories: selectedCategories.map((c, i) => ({
          name: c.name,
          icon: c.icon,
          color: c.color,
          allocatedAmount: parseFloat(c.allocatedAmount) || 0,
          sortOrder: i,
        })),
      });
      setOnboardingComplete();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set up your budget</Text>
      <Text style={styles.subtitle}>for {new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</Text>

      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepLabel}>What's your total monthly budget?</Text>
          <View style={styles.budgetInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.budgetInput}
              value={totalBudget}
              onChangeText={setTotalBudget}
              keyboardType="numeric"
              placeholder="38,500"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <Button
            title="Next"
            onPress={() => setStep(2)}
            disabled={!budgetNum || budgetNum <= 0}
            size="lg"
            style={{ marginTop: spacing.xxl }}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepLabel}>Pick your categories (max {MAX_CATEGORIES})</Text>
          <Text style={styles.selectedCount}>
            {selectedCategories.length}/{MAX_CATEGORIES} selected
          </Text>
          <View style={styles.chipGrid}>
            {PREDEFINED_CATEGORIES.map(cat => (
              <Chip
                key={cat.name}
                label={cat.name}
                icon={cat.icon}
                color={cat.color}
                selected={!!selectedCategories.find(c => c.name === cat.name)}
                onPress={() => toggleCategory(cat)}
              />
            ))}
          </View>
          <Button
            title="Next — Set Allocations"
            onPress={() => setStep(3)}
            disabled={selectedCategories.length === 0}
            size="lg"
            style={{ marginTop: spacing.xxl }}
          />
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepLabel}>Allocate budget to each category</Text>
          <View style={styles.remainingBadge}>
            <Text style={[styles.remainingText, remaining < 0 && { color: colors.error }]}>
              {remaining >= 0 ? `${formatCurrency(remaining)} unallocated` : `${formatCurrency(Math.abs(remaining))} over budget!`}
            </Text>
          </View>

          {selectedCategories.map(cat => (
            <View key={cat.name} style={styles.allocRow}>
              <View style={[styles.allocDot, { backgroundColor: cat.color }]} />
              <Text style={styles.allocName}>{cat.name}</Text>
              <View style={styles.allocInputWrap}>
                <Text style={styles.allocCurrency}>₹</Text>
                <TextInput
                  style={styles.allocInput}
                  value={cat.allocatedAmount}
                  onChangeText={(v) => updateAllocation(cat.name, v)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
          ))}

          <Button
            title="Create Budget"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={totalAllocated === 0 || remaining < 0}
            size="lg"
            style={{ marginTop: spacing.xxl }}
          />
          <Button
            title="Back"
            onPress={() => setStep(2)}
            variant="ghost"
            size="md"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xxl, paddingTop: 60 },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
  },
  stepContainer: {},
  stepLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  currencySymbol: {
    fontSize: fontSize.xxxl,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  budgetInput: {
    flex: 1,
    fontSize: fontSize.xxxl,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  selectedCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  remainingBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  remainingText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  allocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allocDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  allocName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  allocInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  allocCurrency: { fontSize: fontSize.md, color: colors.textSecondary },
  allocInput: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    minWidth: 80,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    textAlign: 'right',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Chip, Card, BottomSheet } from '../../components/ui';
import { useBudgetStore } from '../../stores/budgetStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { useSplitStore } from '../../stores/splitStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string; prefillAmount?: string; prefillCategory?: string; prefillMerchant?: string; prefillNote?: string; prefillPayment?: string }>();

  const { currentBudget, refreshBudget } = useBudgetStore();
  const { createTransaction, updateTransaction, fetchRecent } = useTransactionStore();
  const splitStore = useSplitStore();

  const isEditMode = !!params.editId;

  const [amount, setAmount] = useState(params.prefillAmount || '');
  const [categoryId, setCategoryId] = useState(params.prefillCategory || '');
  const [note, setNote] = useState(params.prefillNote || '');
  const [showMore, setShowMore] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(params.prefillPayment || 'UPI');
  const [merchant, setMerchant] = useState(params.prefillMerchant || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  const categories = currentBudget?.categories ?? [];

  // When amount changes, update split store if active
  useEffect(() => {
    const amt = parseFloat(amount);
    if (splitStore.isActive && amt > 0) {
      splitStore.setTotalAmount(amt);
    }
  }, [amount]);

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (!categoryId) return Alert.alert('Error', 'Select a category');

    setIsSubmitting(true);
    try {
      const txnData: any = {
        categoryId,
        amount: amt,
        transactionDate: new Date().toISOString(),
        paymentMethod,
        merchant: merchant || undefined,
        note: note || undefined,
      };

      // Attach split data if active
      if (splitStore.isActive) {
        txnData.yourShare = splitStore.yourShare;
        txnData.split = splitStore.getSplitPayload();
      }

      if (isEditMode) {
        await updateTransaction(params.editId!, txnData);
      } else {
        await createTransaction(txnData);
      }

      // Cleanup
      splitStore.deactivate();
      await Promise.all([refreshBudget(), fetchRecent(5)]);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSplit = () => {
    const amt = parseFloat(amount) || 0;
    if (!splitStore.isActive) {
      splitStore.activate(amt);
    }
    router.push('/add-expense/split');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { splitStore.deactivate(); router.back(); }}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit expense' : 'Add expense'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Amount */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            autoFocus={!isEditMode}
          />
        </View>
        {splitStore.isActive && (
          <View style={styles.splitBadge}>
            <MaterialIcons name="call-split" size={14} color={colors.primary} />
            <Text style={styles.splitBadgeText}>
              Split active — your share: {formatCurrency(splitStore.yourShare)}
            </Text>
          </View>
        )}
      </Card>

      {/* Category */}
      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.chipGrid}>
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            icon={cat.icon}
            color={cat.color}
            selected={categoryId === cat.id}
            onPress={() => setCategoryId(cat.id)}
          />
        ))}
      </View>

      {/* Note */}
      <View style={styles.noteRow}>
        <MaterialIcons name="edit" size={16} color={colors.primary} />
        <TextInput
          style={styles.noteInput}
          placeholder="Add note"
          placeholderTextColor={colors.textTertiary}
          value={note}
          onChangeText={setNote}
        />
      </View>

      {/* More details */}
      <TouchableOpacity style={styles.moreRow} onPress={() => setShowMore(!showMore)}>
        <Text style={styles.moreText}>More details</Text>
        <MaterialIcons name={showMore ? 'expand-less' : 'expand-more'} size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      {showMore && (
        <Card style={styles.moreCard}>
          <TouchableOpacity style={styles.detailRow} onPress={() => setShowPaymentSheet(true)}>
            <Text style={styles.detailLabel}>Payment method</Text>
            <View style={styles.detailValue}>
              <Text style={styles.detailValueText}>{paymentMethod}</Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            <TextInput
              style={styles.detailInput}
              placeholder="Add merchant"
              placeholderTextColor={colors.textTertiary}
              value={merchant}
              onChangeText={setMerchant}
              textAlign="right"
            />
          </View>

          <TouchableOpacity style={styles.detailRow} onPress={handleOpenSplit}>
            <Text style={styles.detailLabel}>Split bill</Text>
            <View style={styles.detailValue}>
              <Text style={[styles.detailValueText, splitStore.isActive && { color: colors.primary }]}>
                {splitStore.isActive ? `${splitStore.method} · ${splitStore.totalPeople} people` : 'Off'}
              </Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </Card>
      )}

      {/* Save */}
      <Button
        title={isEditMode ? 'Update expense' : 'Save expense'}
        onPress={handleSave}
        loading={isSubmitting}
        size="lg"
        style={{ marginTop: spacing.xxl }}
      />

      {/* Payment method bottom sheet */}
      <BottomSheet visible={showPaymentSheet} onClose={() => setShowPaymentSheet(false)} height={250}>
        <Text style={styles.sheetTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.sheetOption, paymentMethod === m && styles.sheetOptionActive]}
            onPress={() => { setPaymentMethod(m); setShowPaymentSheet(false); }}
          >
            <Text style={[styles.sheetOptionText, paymentMethod === m && { color: colors.primary }]}>
              {m}
            </Text>
            {paymentMethod === m && <MaterialIcons name="check" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>
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
  amountCard: { marginBottom: spacing.xl },
  amountLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: fontSize.xxxl, color: colors.textSecondary, marginRight: spacing.xs },
  amountInput: { flex: 1, fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.text },
  splitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  splitBadgeText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  noteInput: { flex: 1, fontSize: fontSize.md, color: colors.text },
  moreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  moreText: { fontSize: fontSize.md, color: colors.textSecondary },
  moreCard: { marginTop: spacing.sm },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: { fontSize: fontSize.md, color: colors.text },
  detailValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailValueText: { fontSize: fontSize.sm, color: colors.textSecondary },
  detailInput: { fontSize: fontSize.sm, color: colors.textSecondary, minWidth: 100 },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.lg },
  sheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionActive: { backgroundColor: colors.primaryFaded, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm },
  sheetOptionText: { fontSize: fontSize.md, color: colors.text },
});

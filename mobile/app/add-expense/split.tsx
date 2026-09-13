import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card } from '../../components/ui';
import { useSplitStore, SplitMethod } from '../../stores/splitStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

export default function SplitScreen() {
  const router = useRouter();
  const {
    method, totalAmount, totalPeople, participants, yourShare,
    setMethod, setTotalAmount, setTotalPeople, updateParticipantValue, recalculate,
  } = useSplitStore();

  useEffect(() => { recalculate(); }, []);

  const methods: { key: SplitMethod; label: string; hint: string }[] = [
    { key: 'evenly', label: 'Evenly', hint: 'Equal shares' },
    { key: 'amount', label: 'Amount', hint: 'Enter exact INR amounts' },
    { key: 'fraction', label: 'Frac', hint: 'Enter relative weights (e.g. 1, 2, 1)' },
    { key: 'percentage', label: '%', hint: 'Enter percentages (must add up to 100)' },
  ];

  const currentMethodHint = methods.find(m => m.key === method)?.hint || '';

  // Validation
  const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
  const isValid = totalAmount > 0 && Math.abs(totalShares - totalAmount) < 1;

  const getInputPlaceholder = (): string => {
    switch (method) {
      case 'amount': return '₹';
      case 'fraction': return 'wt';
      case 'percentage': return '%';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Split Bill</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Total amount */}
      <Card style={styles.amountCard}>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={totalAmount > 0 ? totalAmount.toString() : ''}
            onChangeText={(v) => setTotalAmount(parseFloat(v) || 0)}
            keyboardType="numeric"
            placeholder="Total amount"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </Card>

      {/* People counter */}
      <View style={styles.peopleRow}>
        <Text style={styles.peopleLabel}>Total People</Text>
        <View style={styles.counter}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setTotalPeople(Math.max(2, totalPeople - 1))}
          >
            <MaterialIcons name="remove" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{totalPeople}</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setTotalPeople(Math.min(10, totalPeople + 1))}
          >
            <MaterialIcons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Split method tabs */}
      <View style={styles.methodRow}>
        {methods.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.methodTab, method === m.key && styles.methodTabActive]}
            onPress={() => setMethod(m.key)}
          >
            <Text style={[styles.methodText, method === m.key && styles.methodTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Method hint */}
      <Text style={styles.methodHint}>{currentMethodHint}</Text>

      {/* Participants */}
      {participants.map((p, idx) => (
        <View key={`${p.label}-${idx}`} style={styles.participantRow}>
          <View style={[styles.youIndicator, p.isYou && styles.youIndicatorActive]} />
          <Text style={[styles.participantLabel, p.isYou && { color: colors.primary, fontWeight: fontWeight.bold }]}>
            {p.label}
          </Text>

          {method !== 'evenly' ? (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.participantInput}
                value={p.customValue}
                onChangeText={(v) => updateParticipantValue(idx, v)}
                keyboardType="numeric"
                placeholder={getInputPlaceholder()}
                placeholderTextColor={colors.textTertiary}
                textAlign="right"
              />
              <View style={styles.shareDisplay}>
                <Text style={styles.shareText}>{formatCurrency(p.share)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.shareDisplay}>
              <Text style={styles.shareText}>{formatCurrency(p.share)}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total assigned</Text>
          <Text style={[styles.summaryValue, !isValid && totalAmount > 0 && { color: colors.error }]}>
            {formatCurrency(totalShares)} / {formatCurrency(totalAmount)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Your share</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatCurrency(yourShare)}
          </Text>
        </View>
        {!isValid && totalAmount > 0 && (
          <Text style={styles.errorText}>
            {totalShares > totalAmount ? 'Shares exceed total!' : 'Shares don\'t add up to total'}
          </Text>
        )}
      </Card>

      <Button
        title="Apply Split"
        onPress={() => router.back()}
        size="lg"
        disabled={!isValid}
        style={{ marginTop: spacing.xl }}
      />
      <Button
        title="Remove Split"
        onPress={() => { useSplitStore.getState().deactivate(); router.back(); }}
        variant="ghost"
        size="md"
        style={{ marginTop: spacing.sm }}
      />
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
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: fontSize.xxl, color: colors.textSecondary, marginRight: spacing.xs },
  amountInput: { flex: 1, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  peopleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  peopleLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary, minWidth: 24, textAlign: 'center' },
  methodRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  methodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  methodTabActive: { backgroundColor: colors.primaryFaded },
  methodText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  methodTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  methodHint: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  youIndicator: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
  },
  youIndicatorActive: { backgroundColor: colors.primary },
  participantLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  inputGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  participantInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    minWidth: 60,
    textAlign: 'right',
  },
  shareDisplay: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  shareText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  summaryCard: { marginTop: spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  summaryValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar } from '../ui';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { formatCurrency, getPercentUsed } from '../../utils/formatters';
import type { Budget } from '../../types';

interface Props {
  budget: Budget;
}

export function RemainingBudgetCard({ budget }: Props) {
  const percentUsed = getPercentUsed(budget.totalSpent, budget.totalAmount);
  const isOnTrack = percentUsed < 50;

  return (
    <Card>
      <Text style={styles.label}>REMAINING</Text>
      <Text style={styles.amount}>{formatCurrency(budget.remainingBudget)}</Text>
      <Text style={styles.totalLabel}>of {formatCurrency(budget.totalAmount)}</Text>

      <View style={styles.progressRow}>
        <ProgressBar progress={percentUsed} />
        <Text style={styles.percentText}>{percentUsed}% USED</Text>
      </View>

      <View style={[styles.statusPill, isOnTrack ? styles.onTrack : styles.overSpending]}>
        <View style={[styles.dot, { backgroundColor: isOnTrack ? colors.primary : colors.warning }]} />
        <Text style={[styles.statusText, { color: isOnTrack ? colors.primary : colors.warning }]}>
          {isOnTrack ? 'On Track' : 'Watch Spending'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  amount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  percentText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    minWidth: 60,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 100,
    gap: spacing.xs,
  },
  onTrack: { backgroundColor: colors.primaryFaded },
  overSpending: { backgroundColor: colors.warningFaded },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});

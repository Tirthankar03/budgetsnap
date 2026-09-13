import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar } from '../ui';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { formatCurrency, getSafeToSpendPerDay, getPercentUsed } from '../../utils/formatters';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
}

export function SafeToSpendCard({ categories }: Props) {
  return (
    <Card>
      <Text style={styles.title}>Safe to spend today</Text>
      {categories.map((cat) => {
        const daily = getSafeToSpendPerDay(cat.remainingAmount);
        const pct = getPercentUsed(cat.spentAmount, cat.allocatedAmount);
        return (
          <View key={cat.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.dailyAmount}>{formatCurrency(daily)}/day</Text>
            </View>
            <ProgressBar progress={pct} color={cat.color} height={4} />
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    marginBottom: spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  catName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  dailyAmount: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});

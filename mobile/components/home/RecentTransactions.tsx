import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../ui';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import type { Transaction } from '../../types';

interface Props {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function RecentTransactions({ transactions, onViewAll }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Recent</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <Card>
        {transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet</Text>
        ) : (
          transactions.map((txn, idx) => (
            <View key={txn.id} style={[styles.row, idx < transactions.length - 1 && styles.rowBorder]}>
              <View style={[styles.iconCircle, { backgroundColor: txn.categoryColor + '20' }]}>
                <MaterialIcons name={txn.categoryIcon as any} size={18} color={txn.categoryColor} />
              </View>
              <View style={styles.info}>
                <Text style={styles.method}>{txn.paymentMethod}</Text>
                <Text style={styles.category}>{txn.categoryName}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amount}>{formatCurrency(txn.yourShare)}</Text>
                <Text style={styles.time}>{formatTimeAgo(txn.transactionDate)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  viewAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  method: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});

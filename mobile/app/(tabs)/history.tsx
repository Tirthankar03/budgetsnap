import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTransactionStore } from '../../stores/transactionStore';
import { useDraftStore } from '../../stores/draftStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { formatCurrency, formatDateFull } from '../../utils/formatters';
import type { Transaction, Draft } from '../../types';

type TimelineItem = (Transaction & { _type: 'transaction' }) | (Draft & { _type: 'draft' });

export default function HistoryScreen() {
  const router = useRouter();
  const { monthTransactions, fetchMonth } = useTransactionStore();
  const { drafts, fetchDrafts } = useDraftStore();
  const now = new Date();

  useFocusEffect(useCallback(() => {
    fetchMonth(now.getMonth() + 1, now.getFullYear());
    fetchDrafts();
  }, [fetchDrafts, fetchMonth]));

  const grouped: Record<string, TimelineItem[]> = {};

  monthTransactions.forEach((txn) => {
    const dateKey = new Date(txn.transactionDate).toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push({ ...txn, _type: 'transaction' });
  });

  const todayKey = new Date().toDateString();
  if (drafts.length > 0) {
    if (!grouped[todayKey]) grouped[todayKey] = [];
    drafts.forEach((d) => {
      grouped[todayKey].push({ ...d, _type: 'draft' } as any);
    });
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleTapTransaction = (txn: Transaction) => {
    router.push({
      pathname: '/add-expense',
      params: {
        editId: txn.id,
        prefillAmount: txn.amount.toString(),
        prefillCategory: txn.categoryId,
        prefillMerchant: txn.merchant || '',
        prefillNote: txn.note || '',
        prefillPayment: txn.paymentMethod,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      {sortedDates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt-long" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={sortedDates}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: dateKey }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{formatDateFull(dateKey)}</Text>
              {grouped[dateKey].map((item, idx) => {
                const isDraft = item._type === 'draft';
                const isLast = idx === grouped[dateKey].length - 1;
                return (
                  <TouchableOpacity
                    key={isDraft ? (item as Draft).id : (item as Transaction).id}
                    style={styles.timelineRow}
                    onPress={() => !isDraft && handleTapTransaction(item as Transaction)}
                    activeOpacity={isDraft ? 1 : 0.7}
                  >
                    <View style={styles.timelineCol}>
                      <View style={[styles.dot, isDraft && styles.draftDot]} />
                      {!isLast && <View style={[styles.line, isDraft && styles.draftLine]} />}
                    </View>

                    <View style={[styles.card, isDraft && styles.draftCard]}>
                      {isDraft ? (
                        <View style={styles.cardRow}>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{(item as Draft).merchant || 'Draft'}</Text>
                            <Text style={styles.cardSub}>
                              {(item as Draft).amount ? formatCurrency((item as Draft).amount!) : 'Amount pending'}
                            </Text>
                          </View>
                          <MaterialIcons name="warning" size={20} color={colors.warning} />
                        </View>
                      ) : (
                        <View style={styles.cardRow}>
                          <View style={[styles.catDot, { backgroundColor: (item as Transaction).categoryColor }]} />
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>
                              {(item as Transaction).merchant || (item as Transaction).categoryName}
                            </Text>
                            <Text style={styles.cardSub}>{(item as Transaction).categoryName} · {(item as Transaction).paymentMethod}</Text>
                          </View>
                          <View style={styles.cardRight}>
                            <Text style={styles.cardAmount}>{formatCurrency((item as Transaction).yourShare)}</Text>
                            <MaterialIcons name="chevron-right" size={16} color={colors.textTertiary} />
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 50 },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary },
  dateGroup: { marginBottom: spacing.xl },
  dateLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  timelineCol: { width: 24, alignItems: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 14,
  },
  draftDot: { backgroundColor: colors.warning },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primary + '40',
    marginVertical: 2,
  },
  draftLine: { backgroundColor: colors.warning + '40' },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  draftCard: {
    borderColor: colors.warning + '50',
    backgroundColor: colors.warningFaded,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  catDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  cardSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
});

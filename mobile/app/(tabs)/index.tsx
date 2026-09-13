import React, { useEffect, useCallback } from 'react';
import { ScrollView, Text, StyleSheet, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useBudgetStore } from '../../stores/budgetStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { useDraftStore } from '../../stores/draftStore';
import { RemainingBudgetCard, SafeToSpendCard, RecentTransactions, CategoryGrid, DraftAlertBanner } from '../../components/home';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { MONTH_NAMES } from '../../utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { currentBudget, fetchCurrentBudget, isLoading } = useBudgetStore();
  const { recentTransactions, fetchRecent } = useTransactionStore();
  const { draftCount, fetchDrafts } = useDraftStore();

  const loadData = useCallback(async () => {
    await Promise.all([fetchCurrentBudget(), fetchRecent(5), fetchDrafts()]);
  }, []);

  useEffect(() => { loadData(); }, []);

  const now = new Date();
  const monthName = MONTH_NAMES[now.getMonth()];

  if (!currentBudget) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No budget set for this month.</Text>
        <Text style={styles.emptyHint}>Restart the app to set up your budget.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>BUDGET</Text>
          <Text style={styles.headerMonth}>{monthName} {now.getFullYear()}</Text>
        </View>
      </View>

      <RemainingBudgetCard budget={currentBudget} />

      <View style={styles.spacer} />
      <SafeToSpendCard categories={currentBudget.categories} />

      <View style={styles.spacer} />
      <DraftAlertBanner count={draftCount} onPress={() => router.push('/drafts')} />

      <View style={styles.spacer} />
      <RecentTransactions
        transactions={recentTransactions}
        onViewAll={() => router.push('/(tabs)/history')}
      />

      <View style={styles.spacer} />
      <CategoryGrid
        categories={currentBudget.categories}
        onEdit={() => router.push('/edit-budget')}
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
  headerLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.5,
  },
  headerMonth: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  spacer: { height: spacing.lg },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

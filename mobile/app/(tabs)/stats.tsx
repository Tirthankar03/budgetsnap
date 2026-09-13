import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, ProgressBar } from '../../components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { formatCurrency, getPercentUsed } from '../../utils/formatters';
import { MONTH_NAMES } from '../../utils/constants';
import api from '../../services/api';
import type { ArchiveStats } from '../../types';

export default function StatsScreen() {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stats/archive');
      setStats(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Budget Archive</Text>
      <Text style={styles.subtitle}>Your spending across past months</Text>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{stats?.monthsCount ?? '—'}</Text>
          <Text style={styles.summaryLabel}>MONTHS</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {stats?.avgUsedPercent !== undefined ? `${stats.avgUsedPercent}%` : '—'}
          </Text>
          <Text style={styles.summaryLabel}>AVG USED</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{stats?.bestMonth ?? '—'}</Text>
          <Text style={styles.summaryLabel}>BEST MONTH</Text>
        </View>
      </View>

      {/* Monthly list */}
      {stats?.budgetsList?.map((budget) => {
        const pct = getPercentUsed(budget.totalSpent, budget.totalAmount);
        const now = new Date();
        const isCurrent = budget.month === now.getMonth() + 1 && budget.year === now.getFullYear();
        return (
          <Card key={budget.id} style={styles.monthCard}>
            <View style={styles.monthHeader}>
              <View>
                <Text style={styles.monthName}>{MONTH_NAMES[budget.month - 1]}</Text>
                <Text style={styles.monthSpent}>
                  {formatCurrency(budget.totalSpent)}{' '}
                  <Text style={styles.monthTotal}>/ {formatCurrency(budget.totalAmount)}</Text>
                </Text>
              </View>
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentText}>CURRENT</Text>
                </View>
              )}
            </View>
            <ProgressBar progress={pct} height={4} />
          </Card>
        );
      })}

      {(!stats || stats.monthsCount === 0) && !loading && (
        <Text style={styles.emptyText}>Future months will show up here as you go.</Text>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 50 },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  monthCard: { marginBottom: spacing.md },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  monthName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  monthSpent: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: 2,
  },
  monthTotal: { color: colors.textSecondary, fontWeight: fontWeight.regular },
  currentBadge: {
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  currentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});

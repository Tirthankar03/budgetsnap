import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, ProgressBar } from '../ui';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { formatCurrency, getPercentUsed } from '../../utils/formatters';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
  onEdit: () => void;
}

export function CategoryGrid({ categories, onEdit }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editBtn}>Edit</Text>
        </TouchableOpacity>
      </View>

      {categories.map((cat) => {
        const pct = getPercentUsed(cat.spentAmount, cat.allocatedAmount);
        return (
          <Card key={cat.id} style={styles.catCard}>
            <View style={styles.catRow}>
              <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <View style={styles.catInfo}>
                <Text style={styles.catName}>{cat.name}</Text>
                <ProgressBar progress={pct} color={cat.color} height={4} />
              </View>
              <Text style={styles.catAmount}>
                {formatCurrency(cat.spentAmount)}{' '}
                <Text style={styles.catTotal}>/ {formatCurrency(cat.allocatedAmount)}</Text>
              </Text>
            </View>
          </Card>
        );
      })}
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
  editBtn: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  catCard: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  catInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  catName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  catAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  catTotal: {
    color: colors.textSecondary,
    fontWeight: fontWeight.regular,
  },
});

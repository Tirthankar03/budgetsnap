import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '../../theme';

interface ChipProps {
  label: string;
  icon?: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, icon, color, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <MaterialIcons
          name={icon as any}
          size={18}
          color={selected ? colors.primary : (color || colors.textSecondary)}
        />
      )}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  selectedLabel: {
    color: colors.primary,
  },
});

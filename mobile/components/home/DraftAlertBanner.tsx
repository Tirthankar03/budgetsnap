import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

interface Props {
  count: number;
  onPress: () => void;
}

export function DraftAlertBanner({ count, onPress }: Props) {
  if (count <= 0) return null;

  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.7}>
      <MaterialIcons name="warning" size={20} color={colors.warning} />
      <Text style={styles.text}>
        {count} draft{count > 1 ? 's' : ''} pending — tap to complete
      </Text>
      <MaterialIcons name="chevron-right" size={20} color={colors.warning} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningFaded,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: fontWeight.medium,
  },
});

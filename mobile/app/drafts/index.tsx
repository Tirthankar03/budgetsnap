import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button } from '../../components/ui';
import { useDraftStore } from '../../stores/draftStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { formatCurrency, getExpiresInText } from '../../utils/formatters';

export default function DraftsScreen() {
  const router = useRouter();
  const { drafts, fetchDrafts, deleteDraft } = useDraftStore();

  useEffect(() => { fetchDrafts(); }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Discard Draft', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => deleteDraft(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pending Drafts</Text>
        <View style={{ width: 24 }} />
      </View>

      {drafts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle" size={48} color={colors.primary} />
          <Text style={styles.emptyText}>No pending drafts!</Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.draftCard}>
              <View style={styles.draftRow}>
                <MaterialIcons name="warning" size={20} color={colors.warning} />
                <View style={styles.draftInfo}>
                  <Text style={styles.draftAmount}>
                    {item.amount ? formatCurrency(item.amount) : 'Amount unknown'}
                  </Text>
                  {item.merchant && <Text style={styles.draftMerchant}>{item.merchant}</Text>}
                  <Text style={styles.draftExpiry}>{getExpiresInText(item.expiresAt)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete-outline" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  draftCard: { marginBottom: spacing.md },
  draftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  draftInfo: { flex: 1 },
  draftAmount: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  draftMerchant: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  draftExpiry: { fontSize: fontSize.xs, color: colors.warning, marginTop: 2 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary },
});

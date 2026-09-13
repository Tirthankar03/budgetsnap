import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

export default function SettingsScreen() {
  const { user, logout, deleteAccount } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => { fetchSettings(); }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteAccount },
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onToggle }: {
    icon: string; label: string; value: boolean; onToggle: (v: boolean) => void;
  }) => (
    <View style={styles.settingRow}>
      <MaterialIcons name={icon as any} size={20} color={colors.textSecondary} />
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceBright, true: colors.primaryFaded }}
        thumbColor={value ? colors.primary : colors.textSecondary}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      {/* Notifications */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingRow
          icon="warning"
          label="Near category limit (80%)"
          value={settings?.notifCategoryLimit ?? true}
          onToggle={(v) => updateSettings({ notifCategoryLimit: v })}
        />
        <SettingRow
          icon="today"
          label="Daily spend summary"
          value={settings?.notifDailySummary ?? false}
          onToggle={(v) => updateSettings({ notifDailySummary: v })}
        />
        <SettingRow
          icon="event"
          label="Monthly reset reminder"
          value={settings?.notifMonthlyReset ?? true}
          onToggle={(v) => updateSettings({ notifMonthlyReset: v })}
        />
      </Card>

      {/* App */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <SettingRow
          icon="drafts"
          label="Draft mode"
          value={settings?.draftMode ?? false}
          onToggle={(v) => updateSettings({ draftMode: v })}
        />
        <Text style={styles.settingHint}>
          When enabled, shared screenshots save as drafts without opening the full form.
        </Text>
      </Card>

      {/* Account actions */}
      <View style={styles.section}>
        <Button title="Log Out" onPress={logout} variant="secondary" size="lg" />
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          variant="danger"
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </View>

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
    marginBottom: spacing.xl,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  settingHint: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    paddingLeft: spacing.xxxl,
  },
});

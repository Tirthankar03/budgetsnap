import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start tracking your budget today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            leftIcon="person"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            leftIcon="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            leftIcon="lock"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create Account" onPress={handleRegister} loading={isLoading} size="lg" />

          <TouchableOpacity style={styles.switchRow} onPress={() => router.back()}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xxxl },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  form: { gap: spacing.xs },
  error: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  switchRow: { alignItems: 'center', marginTop: spacing.xl },
  switchText: { fontSize: fontSize.sm, color: colors.textSecondary },
  switchLink: { color: colors.primary, fontWeight: fontWeight.semibold },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>BudgetSnap</Text>
          <Text style={styles.subtitle}>Track your spending, effortlessly.</Text>
        </View>

        <View style={styles.form}>
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Log In" onPress={handleLogin} loading={isLoading} size="lg" />

          <TouchableOpacity style={styles.switchRow} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchLink}>Sign up</Text>
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
  logo: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: -1,
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

import { Stack } from 'expo-router';
import { colors } from '../../theme';

export default function AddExpenseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="split" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

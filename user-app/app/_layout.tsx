import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';

/**
 * Jangan saring rute lewat kondisional: semua stack screen harus terdaftar
 * (order, payment) supaya `router.push` bekerja. Arah buka-app pakai `app/index.tsx` + `Redirect`.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Linking, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';

function paramOne(v: string | string[] | undefined) {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function PaymentMethodScreen() {
  const { orderId: orderIdP, type: typeP } = useLocalSearchParams<{
    orderId?: string | string[];
    type?: string | string[];
  }>();
  const orderId = paramOne(orderIdP);
  const type = paramOne(typeP) as 'dp_design' | 'dp_production' | 'full_payment' | undefined;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [snapUrl, setSnapUrl] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!orderId || !type) {
      setLoading(false);
      Alert.alert('Gagal', 'Parameter order tidak valid.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const apiUrl = getApiBaseUrl();
        const response = await fetchWithTimeout(`${apiUrl}/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            payment_type: type,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            (data as { message?: string }).message || `Gagal inisiasi (${response.status})`,
          );
        }
        if (data.success && data.payment?.snap_redirect_url) {
          if (mounted) {
            setSnapUrl(data.payment.snap_redirect_url);
          }
        } else {
          throw new Error((data as { message?: string }).message || 'Gagal inisiasi');
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        Alert.alert('Gagal', err?.message || 'Terjadi kesalahan saat inisiasi pembayaran.');
        router.back();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId, type, token, router]);

  const openInBrowser = async (url: string) => {
    const result = await WebBrowser.openBrowserAsync(url, { showInRecents: true } as any);
    if (orderId && (result.type === 'dismiss' || result.type === 'cancel')) {
      router.replace(`/order/${orderId}` as any);
    }
  };

  if (!orderId || !type) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Parameter kurang.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pembayaran Midtrans</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Menyiapkan halaman pembayaran...</Text>
        </View>
      ) : snapUrl ? (
        <View style={styles.centerContainer}>
          <Text style={styles.hintText}>
            Tap tombol di bawah untuk membayar di {Platform.OS === 'web' ? 'jendela baru' : 'browser'}. Selesaikan pembayaran, lalu kembali; status order akan terbarui setelah webhook
            Midtrans.
          </Text>
          <TouchableOpacity style={styles.openBtn} onPress={() => openInBrowser(snapUrl)}>
            <Text style={styles.openBtnText}>Buka Midtrans</Text>
          </TouchableOpacity>
          <Text
            style={styles.link}
            onPress={() => (snapUrl ? Linking.openURL(snapUrl) : undefined)}
          >
            Atau buka manual (copy link)
          </Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Gagal memuat halaman pembayaran.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: { color: '#FFF', marginTop: 16, textAlign: 'center' },
  errorText: { color: '#EF4444' },
  hintText: { color: '#94A3B8', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  openBtn: { backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  openBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  link: { color: '#3B82F6', marginTop: 20, textDecorationLine: 'underline' },
});

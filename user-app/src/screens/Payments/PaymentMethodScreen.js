import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview'; // Need to install this
import { useAuth } from '../../context/AuthContext';

export default function PaymentMethodScreen({ route, navigation }) {
  const { orderId, type } = route.params;
  const [loading, setLoading] = useState(true);
  const [snapUrl, setSnapUrl] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_type: type,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSnapUrl(data.payment.snap_redirect_url);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat inisiasi pembayaran.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onNavigationStateChange = (navState) => {
    // Detect Midtrans finish/error/close URLs
    if (navState.url.includes('finish') || navState.url.includes('settlement')) {
      Alert.alert('Sukses', 'Pembayaran berhasil dikonfirmasi!', [
        { text: 'OK', onPress: () => navigation.navigate('OrderDetail', { orderId }) }
      ]);
    } else if (navState.url.includes('error') || navState.url.includes('failed')) {
      Alert.alert('Gagal', 'Pembayaran gagal. Silakan coba lagi.');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pembayaran Midtrans</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Menyiapkan gerbang pembayaran...</Text>
        </View>
      ) : snapUrl ? (
        <WebView
          source={{ uri: snapUrl }}
          onNavigationStateChange={onNavigationStateChange}
          style={{ flex: 1 }}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Gagal memuat halaman pembayaran.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', // White for WebView
  },
  header: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
  },
});

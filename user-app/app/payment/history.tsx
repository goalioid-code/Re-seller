import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import { stitchColors } from '../../src/theme/stitch';

type PayRow = {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  created_at: string;
  order_id: string;
  order?: { po_number?: string; customer_name?: string | null } | null;
};

export default function PaymentHistoryScreen() {
  const [payments, setPayments] = useState<PayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const fetchPayments = useCallback(async () => {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetchWithTimeout(`${apiUrl}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error('[PaymentHistory] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchPayments();
  };

  const renderItem = ({ item }: { item: PayRow }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => router.push(`/order/${item.order_id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.paymentType}>
          {String(item.payment_type).replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text
          style={[
            styles.statusPill,
            { backgroundColor: item.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)' },
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Text style={styles.amount}>Rp {Number(item.amount).toLocaleString('id-ID')}</Text>
      <Text style={styles.poLine}>{item.order?.po_number || `Order: ${item.order_id}`}</Text>
      <Text style={styles.date}>{item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : ''}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={stitchColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Pembayaran</Text>
        <View style={{ width: 72 }} />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada transaksi.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={stitchColors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: stitchColors.pageSoft },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { color: stitchColors.primary, fontSize: 16, fontWeight: '600' },
  title: { color: stitchColors.primary, fontSize: 18, fontWeight: '700' },
  center: { flex: 1, backgroundColor: stitchColors.pageSoft, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 40 },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: stitchColors.borderLight,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  paymentType: { color: stitchColors.textOnLight, fontWeight: '700' },
  statusPill: { color: '#FCD34D', fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  amount: { color: stitchColors.primary, fontSize: 20, fontWeight: '800' },
  poLine: { color: stitchColors.textMutedLight, fontSize: 14, marginTop: 4 },
  date: { color: stitchColors.textMutedLight, fontSize: 12, marginTop: 6 },
  empty: { color: stitchColors.textMutedLight, textAlign: 'center', marginTop: 40 },
});

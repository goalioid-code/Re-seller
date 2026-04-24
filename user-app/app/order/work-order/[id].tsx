import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../../src/lib/api';

export default function WorkOrderReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workOrder, setWorkOrder] = useState<any>(null);

  const fetchWorkOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(`${apiUrl}/production/work-orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal mengambil lembar kerja');
      setWorkOrder(data.work_order);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Gagal mengambil lembar kerja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWorkOrder();
  }, [orderId, token]);

  const approveWorkOrder = async () => {
    if (!orderId) return;
    setSubmitting(true);
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(`${apiUrl}/production/work-orders/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal approve lembar kerja');
      Alert.alert('Sukses', 'Lembar kerja berhasil di-approve.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Gagal approve lembar kerja');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review LK</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <InfoRow label="Nomor LK" value={workOrder?.lk_number || '-'} />
          <InfoRow label="Status" value={workOrder?.status || '-'} />
          <InfoRow label="Size Run" value={workOrder?.size_run || '-'} />
          <InfoRow label="Back Name" value={workOrder?.back_name || '-'} />
          <InfoRow label="Back Number" value={workOrder?.back_number || '-'} />
          <InfoRow label="Detail Tambahan" value={workOrder?.additional_details || '-'} />
          <InfoRow
            label="Approved At"
            value={workOrder?.approved_at ? new Date(workOrder.approved_at).toLocaleString('id-ID') : '-'}
          />
        </View>

        <TouchableOpacity
          style={[styles.approveBtn, submitting && styles.disabled]}
          onPress={approveWorkOrder}
          disabled={submitting || workOrder?.approved_by_reseller}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.approveText}>
              {workOrder?.approved_by_reseller ? 'Sudah Di-approve' : 'Approve Lembar Kerja'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { color: '#3B82F6', fontWeight: '700' },
  headerTitle: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    padding: 14,
  },
  row: { marginBottom: 10 },
  label: { color: '#94A3B8', fontSize: 12 },
  value: { color: '#FFF', marginTop: 3, fontWeight: '600' },
  approveBtn: {
    marginTop: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.6 },
});

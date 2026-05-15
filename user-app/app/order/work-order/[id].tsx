import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { safeRouterBack } from '../../../src/lib/safeRouterBack';
import { useAuth } from '../../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../../src/lib/api';
import { stitchColors } from '../../../src/theme/stitch';

export default function WorkOrderReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchWorkOrder = useCallback(
    async (silent = false) => {
      if (!orderId) return;
      if (!silent) setLoading(true);
      try {
        const apiUrl = getApiBaseUrl();
        const res = await fetchWithTimeout(`${apiUrl}/production/work-orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Gagal mengambil lembar kerja');
        if (data.success === false) throw new Error(data?.message || 'Gagal mengambil lembar kerja');
        if (!data.work_order) {
          setWorkOrder(null);
          setLoadError('Lembar kerja untuk order ini belum tersedia. Hubungi admin setelah order diproses.');
        } else {
          setWorkOrder(data.work_order);
          setLoadError(null);
        }
      } catch (e: any) {
        setLoadError(e?.message || 'Gagal mengambil lembar kerja');
        setWorkOrder(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId, token],
  );

  useEffect(() => {
    void fetchWorkOrder();
  }, [fetchWorkOrder]);

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
      safeRouterBack(router, '/(tabs)/orders' as Href);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Gagal approve lembar kerja');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={stitchColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouterBack(router, '/(tabs)/orders' as Href)}>
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review lembar kerja</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void fetchWorkOrder(true);
            }}
            tintColor={stitchColors.primary}
          />
        }
      >
        {loadError ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnTitle}>Tidak ada lembar kerja</Text>
            <Text style={styles.warnBody}>{loadError}</Text>
          </View>
        ) : null}

        {workOrder ? (
          <>
            <View style={styles.card}>
              <InfoRow label="Nomor LK" value={workOrder.lk_number || '-'} />
              <InfoRow label="Status" value={String(workOrder.status || '-')} />
              <InfoRow label="Ukuran & jumlah (size run)" value={workOrder.size_run || '-'} />
              <InfoRow label="Nama punggung" value={workOrder.back_name || '-'} />
              <InfoRow label="Nomor punggung" value={workOrder.back_number || '-'} />
              <InfoRow label="Detail tambahan" value={workOrder.additional_details || '-'} />
              <InfoRow
                label="Disetujui pada"
                value={workOrder.approved_at ? new Date(workOrder.approved_at).toLocaleString('id-ID') : '-'}
              />
            </View>

            <TouchableOpacity
              style={[styles.approveBtn, submitting && styles.disabled]}
              onPress={approveWorkOrder}
              disabled={submitting || workOrder.approved_by_reseller}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.approveText}>
                  {workOrder.approved_by_reseller ? 'Sudah disetujui' : 'Setujui lembar kerja'}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : null}
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
  container: { flex: 1, backgroundColor: stitchColors.pageSoft },
  center: { flex: 1, backgroundColor: stitchColors.pageSoft, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { color: stitchColors.primary, fontWeight: '700' },
  headerTitle: { color: stitchColors.primary, fontWeight: '700', fontSize: 18 },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    padding: 14,
  },
  row: { marginBottom: 10 },
  label: { color: stitchColors.textMutedLight, fontSize: 12 },
  value: { color: stitchColors.textOnLight, marginTop: 3, fontWeight: '600' },
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
  warnBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  warnTitle: { color: stitchColors.warning, fontWeight: '800', marginBottom: 6 },
  warnBody: { color: stitchColors.textOnLight, fontSize: 14, lineHeight: 20 },
});

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../../src/lib/api';

type TimelineRow = {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | string;
  started_at?: string | null;
  completed_at?: string | null;
  duration_minutes?: number | null;
  updated_at?: string | null;
  stage: {
    id: string;
    name: string;
    order_index: number;
    description?: string | null;
  };
};

const STATUS_META = {
  completed: { label: 'Selesai', color: '#10B981', dot: '●' },
  in_progress: { label: 'Berlangsung', color: '#3B82F6', dot: '●' },
  pending: { label: 'Menunggu', color: '#64748B', dot: '●' },
} as const;

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID');
};

const formatDuration = (mins?: number | null) => {
  if (!mins || mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h} jam ${m} menit`;
  return `${m} menit`;
};

export default function ProductionTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [production, setProduction] = useState<any>(null);

  const fetchProduction = async (silent = false) => {
    if (!orderId) return;
    if (!silent) setLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetchWithTimeout(`${apiUrl}/production/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal mengambil status produksi');
      setProduction(data.production);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchProduction();
    const timer = setInterval(() => {
      void fetchProduction(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [orderId, token]);

  const currentBanner = useMemo(() => {
    const current = production?.current_stage;
    if (!current) return null;
    const meta = STATUS_META[current.status as keyof typeof STATUS_META] || STATUS_META.pending;
    return {
      title: current?.stage?.name || 'Belum ada tahap',
      status: meta.label,
      color: meta.color,
    };
  }, [production]);

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
        <Text style={styles.headerTitle}>Tracking Produksi</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void fetchProduction(true); }} tintColor="#3B82F6" />}
      >
        {currentBanner && (
          <View style={[styles.banner, { borderColor: `${currentBanner.color}66` }]}>
            <Text style={styles.bannerLabel}>Status Saat Ini</Text>
            <Text style={styles.bannerTitle}>{currentBanner.title}</Text>
            <Text style={[styles.bannerStatus, { color: currentBanner.color }]}>{currentBanner.status}</Text>
          </View>
        )}

        <View style={styles.timeline}>
          {(production?.timeline || []).map((row: TimelineRow) => {
            const meta = STATUS_META[row.status as keyof typeof STATUS_META] || STATUS_META.pending;
            return (
              <View key={row.id} style={styles.stageCard}>
                <View style={styles.stageHead}>
                  <Text style={styles.stageName}>{row.stage.order_index}. {row.stage.name}</Text>
                  <View style={[styles.badge, { borderColor: `${meta.color}88` }]}>
                    <Text style={[styles.badgeText, { color: meta.color }]}>{meta.dot} {meta.label}</Text>
                  </View>
                </View>
                <Text style={styles.stageDesc}>{row.stage.description || '-'}</Text>
                <Text style={styles.metaLine}>Mulai: {formatDateTime(row.started_at)}</Text>
                <Text style={styles.metaLine}>Selesai: {formatDateTime(row.completed_at)}</Text>
                <Text style={styles.metaLine}>Durasi: {formatDuration(row.duration_minutes)}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.lastUpdated}>
          Terakhir diperbarui: {formatDateTime(production?.last_updated)}
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  banner: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  bannerLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 6 },
  bannerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  bannerStatus: { marginTop: 4, fontWeight: '700' },
  timeline: { gap: 10 },
  stageCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    padding: 14,
  },
  stageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stageName: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  badge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  stageDesc: { color: '#94A3B8', marginTop: 6, marginBottom: 10 },
  metaLine: { color: '#CBD5E1', fontSize: 12, marginBottom: 2 },
  lastUpdated: { color: '#94A3B8', textAlign: 'center', marginTop: 18, fontSize: 12 },
});

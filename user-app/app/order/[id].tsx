import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { uploadToR2 } from '../../src/utils/upload';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetchWithTimeout(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error('[OrderDetail] Fetch error:', e);
      Alert.alert('Error', 'Gagal mengambil detail order.');
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const putOrder = async (body: Record<string, unknown>) => {
    const apiUrl = getApiBaseUrl();
    const res = await fetchWithTimeout(`${apiUrl}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: (data as { message?: string }).message || `HTTP ${res.status}`,
        ...data,
      };
    }
    return data;
  };

  const handleUploadMockup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/zip'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      setUploading(true);

      const fileUrl = await uploadToR2(file.uri, file.name, 'mockups', token as string);
      const data = await putOrder({ mockup_file_url: fileUrl });
      if (data.success) {
        Alert.alert('Sukses', 'Mockup berhasil diunggah.');
        fetchOrderDetail();
      } else {
        throw new Error(data.message);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Error', err?.message || 'Gagal mengunggah mockup.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDesign = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/zip'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      setUploading(true);

      const fileUrl = await uploadToR2(file.uri, file.name, 'designs', token as string);
      const data = await putOrder({ design_file_url: fileUrl });
      if (data.success) {
        Alert.alert('Sukses', 'File desain berhasil diunggah.');
        fetchOrderDetail();
      } else {
        throw new Error(data.message);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Error', err?.message || 'Gagal mengunggah desain.');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !orderId) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order tidak ditemukan.</Text>
      </View>
    );
  }

  const showPayDesign = order.status === 'draft' || order.status === 'pending';
  const showMockup = order.status === 'design';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Order</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <Text style={styles.poNumber}>{order.po_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{String(order.status).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
          <View style={styles.card}>
            <InfoRow label="Nama Pemesan" value={order.customer_name} />
            <InfoRow label="Nama Brand" value={order.brand_name} />
            <InfoRow label="Tipe Order" value={order.order_type} />
            <InfoRow
              label="Tanggal Order"
              value={order.order_date ? new Date(order.order_date).toLocaleDateString('id-ID') : '-'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian Produk</Text>
          {(order.items || []).map((item: { id?: string; product_name: string; quantity: number; unit_price: number; fabric_type?: string; collar_type?: string }, index: number) => (
            <View key={item.id || `line-${index}`} style={styles.card}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.productSub}>
                {item.quantity} pcs x Rp {Number(item.unit_price).toLocaleString('id-ID')}
              </Text>
              {item.fabric_type ? <Text style={styles.productDetail}>Kain: {item.fabric_type}</Text> : null}
              {item.collar_type ? <Text style={styles.productDetail}>Kerah: {item.collar_type}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pembayaran</Text>
          <View style={styles.card}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total PO</Text>
              <Text style={styles.totalValue}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</Text>
            </View>
          </View>

          {showMockup && (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.buttonDisabled]}
              onPress={handleUploadMockup}
              disabled={uploading}
            >
              {uploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.uploadButtonText}>Upload Mockup ACC</Text>}
            </TouchableOpacity>
          )}

          {order.status === 'draft' && (
            <TouchableOpacity style={styles.uploadButtonSeconday} onPress={handleUploadDesign} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.uploadButtonText}>Upload file desain</Text>}
            </TouchableOpacity>
          )}

          {showPayDesign ? (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                router.push(
                  `/payment/method?orderId=${encodeURIComponent(String(order.id))}&type=dp_design` as any,
                )
              }
            >
              <Text style={styles.payButtonText}>Bayar DP Desain (Rp 100.000)</Text>
            </TouchableOpacity>
          ) : null}

          {order.status === 'design' && (
            <TouchableOpacity
              style={styles.payButtonSecondary}
              onPress={() =>
                router.push(
                  `/payment/method?orderId=${encodeURIComponent(String(order.id))}&type=dp_production` as any,
                )
              }
            >
              <Text style={styles.payButtonText}>Bayar DP Produksi (50% − DP desain jika sudah)</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getStatusColor(status: string) {
  switch (String(status)) {
    case 'draft':
      return '#94A3B8';
    case 'pending':
      return '#F59E0B';
    case 'design':
      return '#3B82F6';
    case 'production':
      return '#8B5CF6';
    case 'completed':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#64748B';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  backButton: { padding: 8 },
  backButtonText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 24 },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  poNumber: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  section: { marginBottom: 32 },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 },
  infoValue: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  productName: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  productSub: { color: '#3B82F6', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  productDetail: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  totalValue: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  payButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonSecondary: {
    backgroundColor: '#8B5CF6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  uploadButton: {
    backgroundColor: '#8B5CF6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  uploadButtonSeconday: {
    backgroundColor: '#475569',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
  errorText: { color: '#EF4444', fontSize: 16 },
});

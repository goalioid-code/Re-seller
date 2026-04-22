import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToR2 } from '../../utils/upload';
import { useAuth } from '../../context/AuthContext';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const handleUploadDesign = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/zip'],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      const fileUrl = await uploadToR2(file.uri, file.name, 'designs', token);

      // Update order with design URL
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          design_mockup_url: fileUrl,
          status: 'design_acc' // Update status jika perlu
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Sukses', 'Desain berhasil diunggah!');
        fetchOrderDetail();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mengunggah desain.');
    } finally {
      setUploading(false);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('[OrderDetail] Fetch error:', error);
      Alert.alert('Error', 'Gagal mengambil detail order.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Order</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <Text style={styles.poNumber}>{order.po_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
          <View style={styles.card}>
            <InfoRow label="Nama Pemesan" value={order.customer_name} />
            <InfoRow label="Nama Brand" value={order.brand_name} />
            <InfoRow label="Tipe Order" value={order.order_type} />
            <InfoRow label="Tanggal Order" value={new Date(order.order_date).toLocaleDateString('id-ID')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian Produk</Text>
          {order.items.map((item, index) => (
            <View key={item.id || index} style={styles.card}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.productSub}>{item.quantity} pcs x Rp {item.unit_price.toLocaleString('id-ID')}</Text>
              {item.fabric_type && <Text style={styles.productDetail}>Kain: {item.fabric_type}</Text>}
              {item.collar_type && <Text style={styles.productDetail}>Kerah: {item.collar_type}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pembayaran</Text>
          <View style={styles.card}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total PO</Text>
              <Text style={styles.totalValue}>Rp {order.total_amount.toLocaleString('id-ID')}</Text>
            </View>
          </View>
          
          {order.status === 'design' && (
            <TouchableOpacity 
              style={[styles.uploadButton, uploading && styles.buttonDisabled]}
              onPress={handleUploadDesign}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.uploadButtonText}>📁 Upload Mockup ACC</Text>
              )}
            </TouchableOpacity>
          )}

          {order.status === 'draft' || order.status === 'pending' ? (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => navigation.navigate('PaymentMethod', { orderId: order.id, type: 'dp_design' })}
            >
              <Text style={styles.payButtonText}>Bayar DP Desain (Rp 100.000)</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return '#94A3B8';
    case 'pending': return '#F59E0B';
    case 'design': return '#3B82F6';
    case 'production': return '#8B5CF6';
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#64748B';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
  },
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
  poNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    marginBottom: 32,
  },
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  productSub: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  productDetail: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  payButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadButton: {
    backgroundColor: '#8B5CF6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
});

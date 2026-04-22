import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const ORDER_TYPES = ['BASIC', 'LIGA', 'MAKLOON'];

export default function CreateOrderScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState('BASIC');
  const [customerName, setCustomerName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [items, setItems] = useState([{ product_name: '', quantity: '', unit_price: '' }]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleAddItem = () => {
    setItems([...items, { product_name: '', quantity: '', unit_price: '' }]);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const q = parseInt(item.quantity) || 0;
      const p = parseInt(item.unit_price) || 0;
      return sum + (q * p);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!customerName || !brandName) {
      Alert.alert('Error', 'Mohon isi data pelanggan.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_type: orderType,
          customer_name: customerName,
          brand_name: brandName,
          order_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 hari
          items: items.map(item => ({
            product_name: item.product_name,
            quantity: parseInt(item.quantity),
            unit_price: parseInt(item.unit_price),
          }))
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Sukses', 'Order berhasil dibuat!', [
          { text: 'Lihat Detail', onPress: () => navigation.replace('OrderDetail', { orderId: data.order.id }) }
        ]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat membuat order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Batal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Order Baru</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Pilih Tipe Order</Text>
            <View style={styles.typeContainer}>
              {ORDER_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeCard, orderType === type && styles.typeCardActive]}
                  onPress={() => setOrderType(type)}
                >
                  <Text style={[styles.typeText, orderType === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nama Pemesan / Instansi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Tim Futsal Jaya"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={styles.label}>Nama Brand / Logo</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: CALSUB"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={brandName}
              onChangeText={setBrandName}
            />

            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
              <Text style={styles.nextButtonText}>Lanjut ke Rincian Produk →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Rincian Produk</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Text style={styles.itemIndex}>Item #{index + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama Produk (Misal: Jersey Home)"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={item.product_name}
                  onChangeText={(val) => handleUpdateItem(index, 'product_name', val)}
                />
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Qty"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                      value={item.quantity}
                      onChangeText={(val) => handleUpdateItem(index, 'quantity', val)}
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Harga Satuan"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                      value={item.unit_price}
                      onChangeText={(val) => handleUpdateItem(index, 'unit_price', val)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
              <Text style={styles.addItemButtonText}>+ Tambah Produk</Text>
            </TouchableOpacity>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Estimasi Total PO</Text>
              <Text style={styles.summaryValue}>Rp {calculateTotal().toLocaleString('id-ID')}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Buat Order & Lanjut ke Pembayaran</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.backStepButton} onPress={() => setStep(1)}>
              <Text style={styles.backStepButtonText}>← Kembali</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  scrollContent: {
    padding: 24,
  },
  stepTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  typeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '700',
  },
  typeTextActive: {
    color: '#3B82F6',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemIndex: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
  },
  addItemButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#10B981',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backStepButton: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  backStepButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

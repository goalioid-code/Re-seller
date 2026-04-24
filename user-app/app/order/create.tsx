import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';

const ORDER_TYPES = ['BASIC', 'LIGA', 'MAKLOON'] as const;
const PRODUCT_OPTIONS: Record<string, string[]> = {
  BASIC: ['Jersey BASIC v1', 'Jersey BASIC v2', 'Jersey BASIC Training'],
  LIGA: ['Jersey LIGA Premium', 'Jersey LIGA Match', 'Jersey LIGA Long Sleeve'],
  MAKLOON: ['Jersey MAKLOON Custom', 'Jersey MAKLOON Full Print', 'Jersey MAKLOON Team Pack'],
};
const COLLAR_OPTIONS = ['Kerah O-Neck', 'Kerah V-Neck', 'Kerah Berdiri', 'Kerah Polo'];
const PATTERN_OPTIONS = ['Polos', 'Striped', 'Gradient', 'Custom Print', 'Full Design'];
const FABRIC_OPTIONS = ['Dry-fit', 'Polyester', 'Cotton Combed', 'Mesh Breathable', 'Hyget'];
const ATTRIBUTE_OPTIONS = ['Lengan Pendek', 'Lengan Panjang', 'Tanpa Nama', 'Dengan Nama & Nomor'];

const emptyItem = () => ({
  product_name: '',
  quantity: '',
  unit_price: '',
  collar_type: '',
  pattern: '',
  fabric_type: '',
  additional_attrs: '',
});

export default function CreateOrderScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<string>('BASIC');
  const [customerName, setCustomerName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerField, setPickerField] = useState<string>('');
  const [pickerItemIndex, setPickerItemIndex] = useState<number>(0);

  const handleAddItem = () => {
    setItems((prev) => [...prev, emptyItem()]);
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      return next;
    });
  };

  const openPicker = (index: number, field: string, title: string, options: string[]) => {
    setPickerItemIndex(index);
    setPickerField(field);
    setPickerTitle(title);
    setPickerOptions(options);
    setPickerOpen(true);
  };

  const selectPickerValue = (value: string) => {
    handleUpdateItem(pickerItemIndex, pickerField, value);
    setPickerOpen(false);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const q = parseInt(String(item.quantity), 10) || 0;
      const p = parseInt(String(item.unit_price), 10) || 0;
      return sum + q * p;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!customerName || !brandName) {
      Alert.alert('Error', 'Mohon isi data pelanggan.');
      return;
    }
    for (const it of items) {
      if (!it.product_name || !it.quantity || !it.unit_price) {
        Alert.alert('Error', 'Lengkapi setiap item (nama, qty, harga satuan).');
        return;
      }
    }

    setLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      const body = {
        order_type: orderType,
        customer_name: customerName,
        brand_name: brandName,
        order_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        items: items.map((item) => {
          const row: Record<string, unknown> = {
            product_name: item.product_name,
            quantity: parseInt(String(item.quantity), 10),
            unit_price: parseInt(String(item.unit_price), 10),
          };
          if (item.collar_type?.trim()) row.collar_type = item.collar_type.trim();
          if (item.pattern?.trim()) row.pattern = item.pattern.trim();
          if (item.fabric_type?.trim()) row.fabric_type = item.fabric_type.trim();
          if (item.additional_attrs?.trim()) row.additional_attrs = item.additional_attrs.trim();
          return row;
        }),
      };
      const response = await fetchWithTimeout(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        router.replace(`/order/${data.order.id}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Gagal', err?.message || 'Terjadi kesalahan saat membuat order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              {ORDER_TYPES.map((type) => (
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
                  editable={false}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() =>
                    openPicker(
                      index,
                      'product_name',
                      'Pilih Produk',
                      PRODUCT_OPTIONS[orderType] || PRODUCT_OPTIONS.BASIC,
                    )
                  }
                >
                  <Text style={styles.dropdownBtnText}>
                    {item.product_name || 'Pilih produk'}
                  </Text>
                </TouchableOpacity>
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
                <Text style={styles.optionalLabel}>Atribut (opsional)</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => openPicker(index, 'collar_type', 'Pilih Kerah', COLLAR_OPTIONS)}
                >
                  <Text style={styles.dropdownBtnText}>{item.collar_type || 'Pilih kerah'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => openPicker(index, 'pattern', 'Pilih Pola', PATTERN_OPTIONS)}
                >
                  <Text style={styles.dropdownBtnText}>{item.pattern || 'Pilih pola'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => openPicker(index, 'fabric_type', 'Pilih Kain', FABRIC_OPTIONS)}
                >
                  <Text style={styles.dropdownBtnText}>{item.fabric_type || 'Pilih kain'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() =>
                    openPicker(index, 'additional_attrs', 'Pilih Atribut', ATTRIBUTE_OPTIONS)
                  }
                >
                  <Text style={styles.dropdownBtnText}>
                    {item.additional_attrs || 'Pilih atribut'}
                  </Text>
                </TouchableOpacity>
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
                <Text style={styles.submitButtonText}>Buat Order & Lanjut</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backStepButton} onPress={() => setStep(1)}>
              <Text style={styles.backStepButtonText}>← Kembali</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            {pickerOptions.map((opt) => (
              <TouchableOpacity key={opt} style={styles.modalOption} onPress={() => selectPickerValue(opt)}>
                <Text style={styles.modalOptionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
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
  backButtonText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 },
  scrollContent: { padding: 24 },
  stepTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeCardActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  typeText: { color: 'rgba(255, 255, 255, 0.5)', fontWeight: '700' },
  typeTextActive: { color: '#3B82F6' },
  label: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginBottom: 8 },
  optionalLabel: { color: 'rgba(255, 255, 255, 0.45)', fontSize: 12, marginTop: 4, marginBottom: 6 },
  dropdownBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
  row: { flexDirection: 'row' },
  nextButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemIndex: { color: '#3B82F6', fontSize: 12, fontWeight: '800', marginBottom: 12 },
  addItemButton: { paddingVertical: 12, alignItems: 'center' },
  addItemButtonText: { color: '#3B82F6', fontWeight: '700' },
  summaryCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryLabel: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, marginBottom: 4 },
  summaryValue: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  submitButton: {
    backgroundColor: '#10B981',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
  backStepButton: { paddingVertical: 20, alignItems: 'center' },
  backStepButtonText: { color: 'rgba(255, 255, 255, 0.5)' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalOptionText: {
    color: '#E2E8F0',
    fontSize: 15,
  },
});

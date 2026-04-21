import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../../components/ProgressBar';
import { supabase } from '../../config/supabase';

export default function SignUpScreen({ navigation, route }) {
  const { onboardingData } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });
  const [scaleValue] = useState(new Animated.Value(0));

  const showCustomModal = (type, title, message) => {
    setModalConfig({ type, title, message });
    setShowModal(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSignUp = async () => {
    if (!name || !phone || !address) {
      showCustomModal('error', 'Ops! Data Belum Lengkap', 'Silakan isi kolom Nama Lengkap, No. Handphone, dan Alamat Pengiriman.');
      return;
    }

    setLoading(true);

    // Simulate auth & saving preferences
    setTimeout(() => {
      setLoading(false);
      
      // Tampilkan Modal Custom Success
      showCustomModal(
        'success', 
        'Selamat Bergabung!', 
        `Akun ${name} berhasil disiapkan. Bersiaplah melesatkan omset penjualan pertamamu sekarang!`
      );
    }, 1500);
  };

  const handleModalOk = () => {
    setShowModal(false);
    scaleValue.setValue(0);
    if (modalConfig.type === 'success') {
      // Trik Mockup: Melakukan navigasi paksa ke Dashboard Utama
      navigation.replace('MainApp');
    }
  };

  const firstCategory = onboardingData?.categories?.[0] || 'Produk';
  const target = onboardingData?.target || 'Penghasilan';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ProgressBar currentStep={4} totalSteps={4} />

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBox}>
            <Text style={styles.badge}>Luar Biasa! 🎉</Text>
            <Text style={styles.summaryText}>
              Kami sudah menyiapkan produk <Text style={styles.highlight}>{firstCategory}</Text> terbaik agar kamu bisa meraih <Text style={styles.highlight}>{target}</Text> pertamamu!
            </Text>
          </View>

          <Text style={styles.formTitle}>Langkah terakhir, buat akunmu</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan namamu"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>No. Handphone (WhatsApp aktif)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 08123456789"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Alamat Lengkap Pengiriman</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Masukkan alamat lengkap rumah/toko Anda"
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Menyiapkan Akun...' : 'Mulai Berjualan'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* MODERN GENERIC MODAL */}
      <Modal
        transparent={true}
        visible={showModal}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleValue }] }]}>
            <View style={[
              styles.iconCircle,
              modalConfig.type === 'error' && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }
            ]}>
              <Text style={styles.successIcon}>
                {modalConfig.type === 'error' ? '⚠️' : '🚀'}
              </Text>
            </View>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            <TouchableOpacity 
              style={[
                styles.modalButton,
                modalConfig.type === 'error' && { backgroundColor: '#EF4444' }
              ]}
              onPress={handleModalOk}
            >
              <Text style={styles.modalButtonText}>
                {modalConfig.type === 'error' ? 'Kembali Mengisi' : 'Lanjut ke Dashboard'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerBox: {
    backgroundColor: 'rgba(255,140,0,0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.3)',
    marginBottom: 32,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF8C00',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: '800',
    color: '#FF8C00',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
  },
  button: {
    backgroundColor: '#FF8C00',
    height: 56,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,140,0,0.5)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
  },
  eyeButton: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,140,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,140,0,0.3)',
  },
  successIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#FF8C00',
    height: 52,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

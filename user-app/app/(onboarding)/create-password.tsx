import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { safeRouterBack } from '../../src/lib/safeRouterBack';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import { localFileUriToDataUrl } from '../../src/lib/localImageToBase64';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export default function CreatePasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = passwordValid && passwordsMatch && !isSubmitting;

  const handleSubmit = async () => {
    if (!passwordValid) {
      Alert.alert('Kata Sandi Lemah', 'Kata sandi minimal 6 karakter.');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Tidak Cocok', 'Konfirmasi kata sandi tidak sama.');
      return;
    }

    // Susun ulang payload sama persis seperti yang dulu disubmit dari review.tsx,
    // tambah field `password` agar backend bisa hash & simpan.
    let addressObj: any = {};
    try {
      if (params.address) addressObj = JSON.parse(params.address as string);
    } catch (e) {}
    let ktpObj: any = {};
    try {
      if (params.finalKtpData) ktpObj = JSON.parse(params.finalKtpData as string);
    } catch (e) {}
    let focusArr: string[] = [];
    try {
      if (params.sellingFocus) focusArr = JSON.parse(params.sellingFocus as string);
    } catch (e) {}
    let targetArr: string[] = [];
    try {
      if (params.targets) targetArr = JSON.parse(params.targets as string);
    } catch (e) {}

    const fullAddress = addressObj.detail
      ? `${addressObj.detail}, ${addressObj.kelurahan}, ${addressObj.kecamatan}, ${addressObj.kota}, ${addressObj.provinsi} ${addressObj.kodePos}`
      : '';

    setIsSubmitting(true);

    let ktp_image_base64: string | undefined;
    let selfie_image_base64: string | undefined;
    try {
      const uriKtp = params.imageUri as string | undefined;
      const uriSelfie = params.selfieUri as string | undefined;
      if (uriKtp && String(uriKtp).startsWith('file')) {
        ktp_image_base64 = await localFileUriToDataUrl(uriKtp);
      }
      if (uriSelfie && String(uriSelfie).startsWith('file')) {
        selfie_image_base64 = await localFileUriToDataUrl(uriSelfie);
      }
    } catch (imgErr) {
      console.warn('Read onboarding images:', imgErr);
      Alert.alert(
        'Foto tidak terbaca',
        'Tidak bisa membaca foto KTP atau selfie dari perangkat. Coba ulang foto di langkah sebelumnya.',
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      email: params.email as string,
      name: params.name as string,
      phone: (params.phone as string) || null,
      address: fullAddress || null,
      password,
      ktp_image_base64,
      selfie_image_base64,
      onboarding_data: {
        addressDetails: addressObj,
        businessProfile: {
          brand: (params.brandStatus as string) || '-',
          fokus: focusArr.join(', ') || '-',
          target: targetArr.join(', ') || '-',
          targetPO: (params.targetPO as string) || '-',
        },
        bankDetails: {
          bank: params.bank,
          accountNumber: params.accountNumber,
          accountName: params.accountName,
        },
        ktpData: ktpObj,
        media: {
          ktpUri: params.imageUri,
          selfieUri: params.selfieUri,
        },
      },
    };

    try {
      const response = await fetch(`${API_URL}/dev-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        router.replace({ pathname: '/(onboarding)/success', params });
      } else {
        Alert.alert('Gagal Submit', data.message || 'Terjadi kesalahan saat menyimpan data.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Gagal Terhubung', 'Gagal menghubungi server. Pastikan backend menyala.');
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={100} totalSteps={14} currentStep={14} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerArea}>
          <Text style={styles.heading}>Buat Kata Sandi 🔐</Text>
          <Text style={styles.subheading}>
            Kata sandi ini akan kamu pakai untuk login berikutnya pakai email{'  '}
            <Text style={styles.emailHighlight}>{params.email as string}</Text>.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>KATA SANDI</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {password.length > 0 && !passwordValid && (
            <Text style={styles.errorText}>Kata sandi minimal 6 karakter.</Text>
          )}

          <Text style={[styles.label, { marginTop: 18 }]}>KONFIRMASI KATA SANDI</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ulangi kata sandi"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {confirm.length > 0 && !passwordsMatch && (
            <Text style={styles.errorText}>Konfirmasi tidak sama dengan kata sandi.</Text>
          )}

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Tips kata sandi kuat</Text>
            <Text style={styles.tipText}>• Minimal 6 karakter (lebih panjang lebih baik)</Text>
            <Text style={styles.tipText}>• Gabungkan huruf & angka</Text>
            <Text style={styles.tipText}>• Jangan pakai tanggal lahir / nama</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#1A0606" />
          ) : (
            <Text style={styles.submitBtnText}>Buat Akun & Lanjutkan</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => safeRouterBack(router, '/(onboarding)' as Href)} disabled={isSubmitting}>
          <Text style={[styles.backText, isSubmitting && { opacity: 0.5 }]}>Kembali</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: stitchColors.page,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subheading: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  emailHighlight: {
    color: stitchColors.gold,
    fontWeight: '700',
  },
  form: {
    paddingHorizontal: 24,
  },
  label: {
    color: stitchColors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: stitchColors.warning,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  tipBox: {
    marginTop: 24,
    backgroundColor: 'rgba(212,168,71,0.08)',
    borderColor: 'rgba(212,168,71,0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  tipTitle: {
    color: stitchColors.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 14,
  },
  submitBtn: {
    backgroundColor: stitchColors.gold,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(212,168,71,0.3)',
  },
  submitBtnText: {
    color: '#1A0606',
    fontSize: 16,
    fontWeight: '700',
  },
  backText: {
    color: stitchColors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

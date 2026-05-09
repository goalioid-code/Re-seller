import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [agreed, setAgreed] = useState(false);

  // Parse dynamic data safely
  let addressObj: any = {};
  try { if (params.address) addressObj = JSON.parse(params.address as string); } catch (e) {}

  let ktpObj: any = {};
  try { if (params.finalKtpData) ktpObj = JSON.parse(params.finalKtpData as string); } catch (e) {}

  // Param keys harus cocok dengan yang dipakai di selling-focus.tsx, target.tsx, earning-potential.tsx
  let focusArr: string[] = [];
  try { if (params.sellingFocus) focusArr = JSON.parse(params.sellingFocus as string); } catch (e) {}

  let targetArr: string[] = [];
  try { if (params.targets) targetArr = JSON.parse(params.targets as string); } catch (e) {}

  const dynamicData = {
    dataDiri: {
      nama: (params.name as string) || '-',
      wa: (params.phone as string) || '-',
      email: (params.email as string) || '-',
    },
    alamat: addressObj.detail 
      ? `${addressObj.detail}, ${addressObj.kelurahan}, ${addressObj.kecamatan}, ${addressObj.kota}, ${addressObj.provinsi} ${addressObj.kodePos}`
      : '-',
    profilBisnis: {
      brand: (params.brandStatus as string) || '-',
      fokus: focusArr.join(', ') || '-',
      target: targetArr.join(', ') || '-',
      targetPO: (params.targetPO as string) || '-',
    },
    verifikasi: {
      ktp: ktpObj.nik ? 'Verified' : 'Belum',
      rekening: params.bank ? `${params.bank} ${params.accountNumber}` : '-',
      nama: (params.accountName as string) || '-',
      match: params.accountName && ktpObj.nama && (params.accountName as string).toLowerCase() === ktpObj.nama.toLowerCase(),
    },
  };

  // Tidak submit langsung dari sini. User harus buat password dulu di screen
  // berikutnya, baru di sana payload dikirim ke backend (POST /dev-auth/register).
  const goToCreatePassword = () => {
    router.push({
      pathname: '/(onboarding)/create-password',
      params,
    });
  };

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={100} totalSteps={14} currentStep={14} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Calman avatar */}
        <View style={styles.avatarCenter}>
          <Image
            source={require('../../assets/stitch/calman-avatar.jpg')}
            style={styles.avatar}
          />
        </View>

        {/* Chat messages */}
        <View style={styles.chatArea}>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>🎊 Yes! Semua udah lengkap 🎉</Text>
          </View>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>Cek lagi data kamu sebelum submit ya.</Text>
          </View>
        </View>

        {/* Data Diri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Data Diri</Text>
            <TouchableOpacity onPress={() => router.push('/(onboarding)/name')}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>
            Nama: <Text style={styles.fieldBold}>{dynamicData.dataDiri.nama}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            WA: <Text style={styles.fieldBold}>{dynamicData.dataDiri.wa}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Email: <Text style={styles.fieldBold}>{dynamicData.dataDiri.email}</Text>
          </Text>
        </View>

        {/* Alamat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alamat</Text>
            <TouchableOpacity onPress={() => router.push('/(onboarding)/address')}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>{dynamicData.alamat}</Text>
        </View>

        {/* Profil Bisnis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profil Bisnis</Text>
            <TouchableOpacity onPress={() => router.push('/(onboarding)/brand-status')}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>
            Brand: <Text style={styles.fieldBold}>{dynamicData.profilBisnis.brand}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Fokus: <Text style={styles.fieldBold}>{dynamicData.profilBisnis.fokus}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Target Pasar: <Text style={styles.fieldBold}>{dynamicData.profilBisnis.target}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Target PO: <Text style={styles.fieldBold}>{dynamicData.profilBisnis.targetPO}</Text>
          </Text>
        </View>

        {/* Verifikasi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verifikasi</Text>
            <TouchableOpacity onPress={() => router.push('/(onboarding)/ktp-upload')}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>
            KTP: <Text style={styles.fieldBold}>✅ {dynamicData.verifikasi.ktp}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Rekening: <Text style={styles.fieldBold}>{dynamicData.verifikasi.rekening}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Nama: <Text style={styles.fieldBold}>{dynamicData.verifikasi.nama}</Text>
            {dynamicData.verifikasi.match ? (
              <Text style={styles.matchText}>  (Match)</Text>
            ) : (
              <Text style={styles.mismatchText}>  (Not Match)</Text>
            )}
          </Text>
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Saya menyatakan data ini benar dan menyetujui{' '}
            <Text style={styles.termsLink}>Syarat & Ketentuan</Text> serta{' '}
            <Text style={styles.termsLink}>Kebijakan Privasi</Text> Calsub.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !agreed && styles.submitBtnDisabled]}
          onPress={goToCreatePassword}
          disabled={!agreed}
        >
          <Text style={styles.submitText}>Lanjut Buat Kata Sandi</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backEditText}>Kembali edit</Text>
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
  avatarCenter: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(212,168,71,0.4)',
  },
  chatArea: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  chatBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: stitchColors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  editIcon: {
    fontSize: 16,
  },
  fieldRow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 2,
  },
  fieldBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  matchText: {
    color: stitchColors.success,
    fontWeight: '600',
    fontSize: 12,
  },
  mismatchText: {
    color: stitchColors.warning,
    fontWeight: '600',
    fontSize: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: stitchColors.gold,
    borderColor: stitchColors.gold,
  },
  checkMark: {
    color: '#1A0606',
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  termsLink: {
    color: stitchColors.gold,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 10,
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
  submitText: {
    color: '#1A0606',
    fontSize: 16,
    fontWeight: '700',
  },
  backEditText: {
    color: stitchColors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

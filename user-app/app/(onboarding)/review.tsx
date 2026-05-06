import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';

const REVIEW_DATA = {
  dataDiri: {
    nama: 'Eko Fadly',
    wa: '+62 812-3456-7890',
    email: 'eko@email.com',
  },
  alamat: 'Jl. Mawar No. 12, RT 03/RW 05, Kel. Kranji, Kec. Bekasi Barat, Kota Bekasi, Jawa Barat 17135',
  profilBisnis: {
    brand: 'Sudah punya & berjalan',
    fokus: 'Klub bola, Komunitas hobi',
    target: '1-50 pcs/bulan',
  },
  verifikasi: {
    ktp: 'Verified',
    rekening: 'BCA 1234...',
    nama: 'Eko Fadly',
    match: true,
  },
};

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [agreed, setAgreed] = useState(false);

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
            <TouchableOpacity>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>
            Nama: <Text style={styles.fieldBold}>{REVIEW_DATA.dataDiri.nama}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            WA: <Text style={styles.fieldBold}>{REVIEW_DATA.dataDiri.wa}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Email: <Text style={styles.fieldBold}>{REVIEW_DATA.dataDiri.email}</Text>
          </Text>
        </View>

        {/* Alamat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alamat</Text>
            <TouchableOpacity>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>{REVIEW_DATA.alamat}</Text>
        </View>

        {/* Profil Bisnis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profil Bisnis</Text>
            <TouchableOpacity>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>
            Brand: <Text style={styles.fieldBold}>{REVIEW_DATA.profilBisnis.brand}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Fokus: <Text style={styles.fieldBold}>{REVIEW_DATA.profilBisnis.fokus}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Target: <Text style={styles.fieldBold}>{REVIEW_DATA.profilBisnis.target}</Text>
          </Text>
        </View>

        {/* Verifikasi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verifikasi</Text>
            <TouchableOpacity>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldRow}>
            KTP: <Text style={styles.fieldBold}>✅ {REVIEW_DATA.verifikasi.ktp}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Rekening: <Text style={styles.fieldBold}>{REVIEW_DATA.verifikasi.rekening}</Text>
          </Text>
          <Text style={styles.fieldRow}>
            Nama: <Text style={styles.fieldBold}>{REVIEW_DATA.verifikasi.nama}</Text>
            {REVIEW_DATA.verifikasi.match && (
              <Text style={styles.matchText}>  (Match)</Text>
            )}
          </Text>
        </View>

        {/* Terms */}
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
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
          onPress={() => router.push({ pathname: '/(onboarding)/success', params })}
          disabled={!agreed}
        >
          <Text style={styles.submitText}>Submit Pendaftaran  →</Text>
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

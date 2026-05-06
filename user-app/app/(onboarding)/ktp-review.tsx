import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';

// Mock KTP data for UI demonstration
const MOCK_KTP = {
  nik: '3174123456789012',
  nama: 'Budi Santoso',
  tempatTglLahir: 'Jakarta, 17-08-1990',
  jenisKelamin: 'Laki-laki',
  alamat: 'Jl. Sudirman Kav. 52-53, Senayan, Kebayoran Baru, Jakarta Selatan',
};

export default function KtpReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const fields = [
    { label: 'NIK', value: MOCK_KTP.nik },
    { label: 'NAMA LENGKAP', value: MOCK_KTP.nama, match: true },
    { label: 'TEMPAT / TGL LAHIR', value: MOCK_KTP.tempatTglLahir },
    { label: 'JENIS KELAMIN', value: MOCK_KTP.jenisKelamin },
    { label: 'ALAMAT', value: MOCK_KTP.alamat },
  ];

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={85} totalSteps={14} currentStep={12} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Calman with message */}
        <View style={styles.avatarRow}>
          <Image
            source={require('../../assets/stitch/calman-avatar.jpg')}
            style={styles.avatar}
          />
          <View style={styles.chatCol}>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>Sip! Data berhasil dibaca ✨</Text>
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>
                Cek datanya, kalau ada yang salah bisa diedit.
              </Text>
            </View>
          </View>
        </View>

        {/* KTP Photo preview */}
        <View style={styles.ktpRow}>
          <View style={styles.ktpThumb}>
            <Text style={styles.ktpPlaceholder}>🪪</Text>
          </View>
          <Text style={styles.ktpLabel}>FOTO KTP</Text>
          <TouchableOpacity>
            <Text style={styles.retakeBtn}>🔄 Foto Ulang</Text>
          </TouchableOpacity>
        </View>

        {/* Data fields */}
        <View style={styles.fieldsArea}>
          {fields.map((field, i) => (
            <View key={i} style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.fieldValueRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                  {field.match && (
                    <Text style={styles.matchBadge}>✓ COCOK DENGAN REKENING</Text>
                  )}
                </View>
                <View style={styles.fieldActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionIcon}>✅</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/selfie',
              params,
            })
          }
        >
          <Text style={styles.confirmBtnText}>Konfirmasi & Lanjut  →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.muteRow}>
          <Text style={{ fontSize: 16 }}>🔇</Text>
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(212,168,71,0.4)',
    marginRight: 12,
  },
  chatCol: {
    flex: 1,
    gap: 8,
  },
  chatBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  ktpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  ktpThumb: {
    width: 70,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ktpPlaceholder: {
    fontSize: 24,
  },
  ktpLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  retakeBtn: {
    color: stitchColors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldsArea: {
    paddingHorizontal: 20,
    gap: 10,
  },
  fieldCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
  },
  fieldLabel: {
    color: stitchColors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fieldValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  matchBadge: {
    color: stitchColors.success,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: stitchColors.gold,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
  muteRow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

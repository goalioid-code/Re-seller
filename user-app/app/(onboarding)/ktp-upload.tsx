import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

export default function KtpUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={85} totalSteps={14} currentStep={12} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="avatar" size={150} showGlow />

        <CalmanChat
          messages={[
            'Yuk verifikasi! 📸',
            'Foto KTP kamu, sistem akan otomatis baca data (OCR Smart). Cuma butuh 3 detik!',
          ]}
        />

        {/* Upload area */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadBox}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.uploadTitle}>Tap untuk ambil foto KTP</Text>
            <Text style={styles.uploadSubtitle}>atau pilih dari galeri</Text>
            <View style={styles.cardPreview}>
              <View style={styles.cardRect} />
              <View style={styles.cardLines}>
                <View style={styles.cardLine} />
                <View style={[styles.cardLine, { width: '60%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* OCR Smart info */}
        <View style={styles.ocrBox}>
          <Text style={styles.ocrTitle}>✨ OCR Smart aktif</Text>
          <Text style={styles.ocrDesc}>
            Sistem otomatis baca: NIK, Nama, Tempat/Tgl Lahir, Alamat. Cek hasil setelah foto diupload.
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsRow}>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>Pencahayaan{'\n'}cukup</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📐</Text>
            <Text style={styles.tipText}>Sejajar{'\n'}bingkai</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🚫</Text>
            <Text style={styles.tipText}>Tidak{'\n'}buram</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/ktp-review',
              params,
            })
          }
        >
          <Text style={styles.cameraBtnText}>Buka Kamera  📷</Text>
        </TouchableOpacity>

        <View style={styles.skipRow}>
          <TouchableOpacity style={styles.muteBtn}>
            <Text style={{ fontSize: 18 }}>🔇</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(onboarding)/ktp-review', params })}
          >
            <Text style={styles.skipText}>Lewati ↓</Text>
          </TouchableOpacity>
        </View>
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
  uploadSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: stitchColors.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  cameraIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtitle: {
    color: stitchColors.gold,
    fontSize: 13,
    marginBottom: 16,
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.4,
  },
  cardRect: {
    width: 30,
    height: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
  },
  cardLines: {
    gap: 5,
  },
  cardLine: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  ocrBox: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(212,168,71,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,71,0.25)',
    borderRadius: 14,
    padding: 14,
  },
  ocrTitle: {
    color: stitchColors.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  ocrDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
  },
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
  },
  tipItem: {
    alignItems: 'center',
    gap: 6,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  cameraBtn: {
    backgroundColor: stitchColors.gold,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cameraBtnText: {
    color: '#1A0606',
    fontSize: 16,
    fontWeight: '700',
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});

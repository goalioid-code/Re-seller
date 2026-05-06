import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

export default function AddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState({
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    kodePos: '',
    detail: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const isValid = form.provinsi && form.kota && form.kecamatan && form.kelurahan;

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={28} totalSteps={14} currentStep={4} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CalmanHero variant="hero" size={150} showGlow />

        <CalmanChat messages={['Mantap! 📍', 'Sekarang isi alamat lengkap. Buat pengiriman & verifikasi data.']} />

        <View style={styles.formArea}>
          {/* Provinsi */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PROVINSI</Text>
            <TouchableOpacity style={styles.selectField}>
              <Text style={form.provinsi ? styles.selectValue : styles.selectPlaceholder}>
                {form.provinsi || 'Pilih provinsi'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kota */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KOTA / KABUPATEN</Text>
            <TouchableOpacity style={styles.selectField}>
              <Text style={form.kota ? styles.selectValue : styles.selectPlaceholder}>
                {form.kota || 'Pilih kota'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kecamatan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KECAMATAN</Text>
            <TouchableOpacity style={styles.selectField}>
              <Text style={form.kecamatan ? styles.selectValue : styles.selectPlaceholder}>
                {form.kecamatan || 'Pilih kecamatan'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kelurahan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KELURAHAN / DESA</Text>
            <TouchableOpacity style={styles.selectField}>
              <Text style={form.kelurahan ? styles.selectValue : styles.selectPlaceholder}>
                {form.kelurahan || 'Pilih kelurahan'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kode Pos */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KODE POS</Text>
            <View style={styles.inputField}>
              <TextInput
                style={styles.textInput}
                placeholder="Kode pos"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.kodePos}
                onChangeText={(v) => update('kodePos', v)}
                keyboardType="number-pad"
                maxLength={5}
              />
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          </View>

          {/* Detail Alamat */}
          <View style={styles.fieldGroup}>
            <View style={styles.inputField}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Nama jalan, RT/RW, no rumah, patokan..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.detail}
                onChangeText={(v) => update('detail', v)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <OnboardingFooter
        onContinue={() =>
          router.push({
            pathname: '/(onboarding)/brand-status',
            params: { ...params, address: JSON.stringify(form) },
          })
        }
        onSkip={() =>
          router.push({
            pathname: '/(onboarding)/brand-status',
            params: { ...params },
          })
        }
        continueLabel="Lanjutkan"
        continueDisabled={false}
      />
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
  formArea: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  fieldGroup: {
    marginBottom: 2,
  },
  fieldLabel: {
    color: stitchColors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  selectValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  selectPlaceholder: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 15,
  },
  chevron: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
});

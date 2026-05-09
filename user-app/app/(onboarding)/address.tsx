import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';
import AddressSelectModal from '../../src/components/onboarding/AddressSelectModal';

export default function AddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [form, setForm] = useState({
    provinsi: { id: '', nama: '' },
    kota: { id: '', nama: '' },
    kecamatan: { id: '', nama: '' },
    kelurahan: { id: '', nama: '' },
    kodePos: '',
    detail: '',
  });

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'provinsi' | 'kota' | 'kecamatan' | 'kelurahan';
    title: string;
    parentId?: string;
  }>({
    visible: false,
    type: 'provinsi',
    title: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelect = (item: { id: string; nama: string }) => {
    if (modalConfig.type === 'provinsi') {
      setForm((prev) => ({
        ...prev,
        provinsi: item,
        kota: { id: '', nama: '' },
        kecamatan: { id: '', nama: '' },
        kelurahan: { id: '', nama: '' },
      }));
    } else if (modalConfig.type === 'kota') {
      setForm((prev) => ({
        ...prev,
        kota: item,
        kecamatan: { id: '', nama: '' },
        kelurahan: { id: '', nama: '' },
      }));
    } else if (modalConfig.type === 'kecamatan') {
      setForm((prev) => ({
        ...prev,
        kecamatan: item,
        kelurahan: { id: '', nama: '' },
      }));
    } else if (modalConfig.type === 'kelurahan') {
      setForm((prev) => ({ ...prev, kelurahan: item }));
    }
  };

  const openModal = (type: 'provinsi' | 'kota' | 'kecamatan' | 'kelurahan') => {
    let title = '';
    let parentId = '';

    if (type === 'provinsi') {
      title = 'Pilih Provinsi';
    } else if (type === 'kota') {
      title = 'Pilih Kota / Kabupaten';
      parentId = form.provinsi.id;
    } else if (type === 'kecamatan') {
      title = 'Pilih Kecamatan';
      parentId = form.kota.id;
    } else if (type === 'kelurahan') {
      title = 'Pilih Kelurahan / Desa';
      parentId = form.kecamatan.id;
    }

    setModalConfig({ visible: true, type, title, parentId });
  };

  const isValid = form.provinsi.id && form.kota.id && form.kecamatan.id && form.kelurahan.id && form.detail.trim();

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
            <TouchableOpacity style={styles.selectField} onPress={() => openModal('provinsi')}>
              <Text style={form.provinsi.nama ? styles.selectValue : styles.selectPlaceholder}>
                {form.provinsi.nama || 'Pilih provinsi'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kota */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KOTA / KABUPATEN</Text>
            <TouchableOpacity 
              style={[styles.selectField, !form.provinsi.id && styles.selectFieldDisabled]} 
              onPress={() => form.provinsi.id && openModal('kota')}
              activeOpacity={form.provinsi.id ? 0.2 : 1}
            >
              <Text style={form.kota.nama ? styles.selectValue : styles.selectPlaceholder}>
                {form.kota.nama || 'Pilih kota'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kecamatan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KECAMATAN</Text>
            <TouchableOpacity 
              style={[styles.selectField, !form.kota.id && styles.selectFieldDisabled]} 
              onPress={() => form.kota.id && openModal('kecamatan')}
              activeOpacity={form.kota.id ? 0.2 : 1}
            >
              <Text style={form.kecamatan.nama ? styles.selectValue : styles.selectPlaceholder}>
                {form.kecamatan.nama || 'Pilih kecamatan'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Kelurahan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>KELURAHAN / DESA</Text>
            <TouchableOpacity 
              style={[styles.selectField, !form.kecamatan.id && styles.selectFieldDisabled]} 
              onPress={() => form.kecamatan.id && openModal('kelurahan')}
              activeOpacity={form.kecamatan.id ? 0.2 : 1}
            >
              <Text style={form.kelurahan.nama ? styles.selectValue : styles.selectPlaceholder}>
                {form.kelurahan.nama || 'Pilih kelurahan'}
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
            params: { 
              ...params, 
              address: JSON.stringify({
                provinsi: form.provinsi.nama,
                kota: form.kota.nama,
                kecamatan: form.kecamatan.nama,
                kelurahan: form.kelurahan.nama,
                kodePos: form.kodePos,
                detail: form.detail
              }) 
            },
          })
        }
        onSkip={() =>
          router.push({
            pathname: '/(onboarding)/brand-status',
            params: { ...params },
          })
        }
        continueLabel="Lanjutkan"
        continueDisabled={!isValid}
      />

      <AddressSelectModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
        onSelect={handleSelect}
        title={modalConfig.title}
        type={modalConfig.type}
        parentId={modalConfig.parentId}
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
  selectFieldDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.02)',
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
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import BankSelectModal from '../../src/components/onboarding/BankSelectModal';

export default function BankSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const isFormValid = bank.trim() !== '' && accountNumber.trim() !== '' && accountName.trim() !== '';

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={78} totalSteps={14} currentStep={11} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Calman avatar with chat */}
        <View style={styles.avatarRow}>
          <Image
            source={require('../../assets/stitch/calman-avatar.jpg')}
            style={styles.avatar}
          />
          <View style={styles.chatCol}>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>Hampir selesai! 💰</Text>
            </View>
            <View style={styles.chatBubbleLarge}>
              <Text style={styles.chatText}>
                Daftar rekening untuk pencairan komisi.{' '}
                <Text style={styles.bold}>PENTING:</Text> nama rekening{' '}
                <Text style={[styles.bold, styles.underline]}>HARUS SAMA</Text> dengan KTP/Kartu Pelajar.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formArea}>
          {/* Bank Select */}
          <Text style={styles.fieldLabel}>Pilih Bank</Text>
          <TouchableOpacity style={styles.selectField} onPress={() => setModalVisible(true)}>
            <Text style={styles.bankIcon}>🏦</Text>
            <Text style={bank ? styles.selectValue : styles.selectPlaceholder}>
              {bank || 'Pilih bank'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>

          {/* Account Number */}
          <Text style={styles.fieldLabel}>Nomor Rekening</Text>
          <View style={styles.inputField}>
            <TextInput
              style={styles.textInput}
              placeholder="1234 5678 9012"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
            />
          </View>

          {/* Account Name */}
          <Text style={styles.fieldLabel}>Nama Pemilik Rekening</Text>
          <View style={styles.inputField}>
            <TextInput
              style={styles.textInput}
              placeholder="Sesuai buku tabungan"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={accountName}
              onChangeText={setAccountName}
            />
          </View>

          <View style={styles.warningRow}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Harus SAMA PERSIS dengan nama di KTP
            </Text>
          </View>

          {/* Warning box */}
          <View style={styles.warningBox}>
            <Text style={styles.warningBoxIcon}>⚠️</Text>
            <Text style={styles.warningBoxText}>
              Nama rekening akan dicocokkan otomatis dengan KTP. Jika tidak sama, akun tidak bisa diverifikasi.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !isFormValid && styles.continueBtnDisabled]}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/ktp-upload',
              params: { ...params, bank, accountNumber, accountName },
            })
          }
          disabled={!isFormValid}
        >
          <Text style={[styles.continueBtnText, !isFormValid && styles.continueBtnTextDisabled]}>
            Lanjutkan ke Upload KTP 🪪
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(onboarding)/ktp-upload', params })}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      <BankSelectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={setBank}
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chatBubbleLarge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
  },
  bold: {
    fontWeight: '800',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  formArea: {
    paddingHorizontal: 20,
    gap: 4,
  },
  fieldLabel: {
    color: stitchColors.gold,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 10,
  },
  bankIcon: {
    fontSize: 20,
  },
  selectValue: {
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
  },
  selectPlaceholder: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  warningIcon: {
    fontSize: 13,
  },
  warningText: {
    color: stitchColors.warning,
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  warningBoxIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  warningBoxText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 10,
  },
  continueBtn: {
    backgroundColor: stitchColors.gold,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(212,168,71,0.3)',
  },
  continueBtnText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
  continueBtnTextDisabled: {
    color: 'rgba(26,6,6,0.5)',
  },
  skipBtn: {
    paddingVertical: 6,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

export default function WhatsAppScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string }>();
  const [phone, setPhone] = useState('');

  const userName = params.name || 'Kamu';

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={21} totalSteps={14} currentStep={3} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CalmanHero variant="avatar" size={170} showGlow />

          <CalmanChat
            messages={[
              `Mantap ${userName}! 📱`,
              'Boleh share nomor WhatsApp aktif? Buat verifikasi & notifikasi PO.',
            ]}
          />

          <View style={styles.inputArea}>
            <View style={styles.phoneInputContainer}>
              <View style={styles.prefixBox}>
                <Text style={styles.flag}>🇮🇩</Text>
                <Text style={styles.prefixText}>+62</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.phoneInputWrapper}>
                <Text
                  style={[styles.phoneInput, !phone && styles.phonePlaceholder]}
                  onPress={() => {}}
                >
                  {phone || '812 3456 7890'}
                </Text>
              </View>
            </View>
            {/* Actual hidden input */}
            <View style={styles.realInputWrap}>
              <View style={styles.phoneRow}>
                <View style={styles.prefixBoxReal}>
                  <Text style={styles.flag}>🇮🇩</Text>
                  <Text style={styles.prefixText}>+62</Text>
                </View>
                <View style={styles.dividerReal} />
                <View style={{ flex: 1 }}>
                  <View style={styles.inputInner}>
                    {React.createElement(
                      require('react-native').TextInput,
                      {
                        style: styles.phoneTextInput,
                        placeholder: '812 3456 7890',
                        placeholderTextColor: 'rgba(255,255,255,0.35)',
                        value: phone,
                        onChangeText: setPhone,
                        keyboardType: 'phone-pad',
                        maxLength: 13,
                      }
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.securityText}>Kode OTP akan dikirim ke nomor ini</Text>
            </View>

            <TouchableOpacity
              style={[styles.otpButton, !phone.trim() && styles.otpButtonDisabled]}
              onPress={() =>
                router.push({
                  pathname: '/(onboarding)/otp',
                  params: { name: params.name || '', email: params.email || '', phone },
                })
              }
              disabled={!phone.trim()}
            >
              <Text style={[styles.otpButtonText, !phone.trim() && styles.otpButtonTextDisabled]}>
                Kirim Kode OTP  →
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.muteBtn}>
            <Text style={{ fontSize: 18 }}>🔇</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(onboarding)/address',
                params: { name: params.name || '', email: params.email || '', phone: '' },
              })
            }
          >
            <Text style={styles.skipText}>Lewati ↓</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  inputArea: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  phoneInputContainer: {
    display: 'none',
  },
  realInputWrap: {
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  prefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  prefixBoxReal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  flag: {
    fontSize: 20,
    marginRight: 6,
  },
  prefixText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerReal: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  phoneInputWrapper: {
    flex: 1,
    paddingHorizontal: 14,
  },
  phoneInput: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  phonePlaceholder: {
    color: 'rgba(255,255,255,0.35)',
  },
  inputInner: {
    paddingHorizontal: 12,
  },
  phoneTextInput: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  lockIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  otpButton: {
    backgroundColor: stitchColors.gold,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 32,
  },
  otpButtonDisabled: {
    backgroundColor: 'rgba(212,168,71,0.3)',
  },
  otpButtonText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
  otpButtonTextDisabled: {
    color: 'rgba(26,6,6,0.5)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
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
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
});

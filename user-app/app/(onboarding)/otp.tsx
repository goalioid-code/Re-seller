import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string; phone?: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={21} totalSteps={14} currentStep={3} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="avatar" size={160} showGlow />

        <CalmanChat
          messages={[
            'Cek WhatsApp kamu! 📲',
            `Masukkan 6 digit kode yang dikirim ke\n+62 ${params.phone || '812-3456-7890'}`,
          ]}
        />

        <View style={styles.otpContainer}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Belum dapat kode? </Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>Kirim ulang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.verifyButton, !isComplete && styles.verifyButtonDisabled]}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/address',
              params: {
                name: params.name || '',
                email: params.email || '',
                phone: params.phone || '',
              },
            })
          }
          disabled={!isComplete}
        >
          <Text style={[styles.verifyText, !isComplete && styles.verifyTextDisabled]}>
            Verifikasi
          </Text>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
    paddingHorizontal: 24,
  },
  otpBox: {
    width: 50,
    height: 56,
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: stitchColors.gold,
    backgroundColor: 'rgba(212,168,71,0.1)',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  resendLink: {
    color: stitchColors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'flex-end',
  },
  verifyButton: {
    backgroundColor: stitchColors.gold,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(212,168,71,0.3)',
  },
  verifyText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
  verifyTextDisabled: {
    color: 'rgba(26,6,6,0.5)',
  },
});

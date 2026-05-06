import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import GoldInput from '../../src/components/onboarding/GoldInput';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

export default function EmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const [email, setEmail] = useState('');

  const userName = params.name || 'Kamu';

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={14} totalSteps={14} currentStep={2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CalmanHero variant="coach" size={180} showGlow />

          <CalmanChat
            messages={[
              'Sip! 🎊',
              'Masukkan email aktif kamu. Buat receipt komisi & info penting.',
            ]}
          />

          <View style={styles.inputArea}>
            <GoldInput
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="📧"
            />
          </View>
        </ScrollView>

        <OnboardingFooter
          onContinue={() =>
            router.push({
              pathname: '/(onboarding)/whatsapp',
              params: { name: params.name || '', email },
            })
          }
          onSkip={() =>
            router.push({
              pathname: '/(onboarding)/whatsapp',
              params: { name: params.name || '', email: '' },
            })
          }
          continueLabel="Lanjutkan"
          continueDisabled={!email.trim() || !email.includes('@')}
        />
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
  },
});

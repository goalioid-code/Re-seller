import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import GoldInput from '../../src/components/onboarding/GoldInput';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={7} totalSteps={14} currentStep={1} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CalmanHero variant="hero" size={180} showGlow />

          <CalmanChat
            messages={[
              'Halo! Saya Calman 👋',
              'Kenalan dulu yuk! Siapa nama kamu?',
            ]}
          />

          <View style={styles.inputArea}>
            <GoldInput
              placeholder="Ketik nama kamu..."
              value={name}
              onChangeText={setName}
              maxChars={50}
              currentLength={name.length}
              autoFocus
              returnKeyType="next"
            />
          </View>
        </ScrollView>

        <OnboardingFooter
          onContinue={() =>
            router.push({
              pathname: '/(onboarding)/email',
              params: { name },
            })
          }
          onSkip={() =>
            router.push({
              pathname: '/(onboarding)/email',
              params: { name: '' },
            })
          }
          continueLabel="Lanjutkan"
          continueDisabled={!name.trim()}
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

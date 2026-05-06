import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import SelectableOption from '../../src/components/onboarding/SelectableOption';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

const OPTIONS = [
  'Ya, sudah punya brand & sedang berjalan',
  'Ya, punya nama brand tapi belum berjalan',
  'Belum, tapi berencana bikin brand sendiri',
  'Tidak, hanya ingin jualan sebagai reseller',
];

export default function BrandStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={35} totalSteps={14} currentStep={5} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="coach" size={180} showGlow />

        <CalmanChat
          messages={[
            'Mantap! 🔥',
            'Boleh tahu, kamu sudah punya brand jersey sendiri?',
          ]}
        />

        <View style={styles.options}>
          {OPTIONS.map((opt, i) => (
            <SelectableOption
              key={i}
              label={opt}
              selected={selected === i}
              onPress={() => setSelected(i)}
            />
          ))}
        </View>
      </ScrollView>

      <OnboardingFooter
        onContinue={() =>
          router.push({
            pathname: '/(onboarding)/brand-identity',
            params: { ...params, brandStatus: selected !== null ? OPTIONS[selected] : '' },
          })
        }
        onSkip={() =>
          router.push({ pathname: '/(onboarding)/brand-identity', params })
        }
        continueLabel="Lanjutkan"
        continueDisabled={selected === null}
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
  options: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

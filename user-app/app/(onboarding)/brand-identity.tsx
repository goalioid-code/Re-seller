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
  {
    label: 'Ya, saya butuh bantuan ✨',
    subtitle: 'Tim Calsub bantu setup brand kamu',
  },
  {
    label: 'Tidak, cukup jualan saja',
    subtitle: 'Langsung mulai dengan toko digital',
  },
];

export default function BrandIdentityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={42} totalSteps={14} currentStep={6} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="hero" size={180} showGlow />

        <CalmanChat
          messages={[
            'Sip!',
            'Mau dibantu Calsub bikin identitas brand kamu? (logo, nama, dll)',
          ]}
        />

        <View style={styles.options}>
          {OPTIONS.map((opt, i) => (
            <SelectableOption
              key={i}
              label={opt.label}
              subtitle={opt.subtitle}
              selected={selected === i}
              onPress={() => setSelected(i)}
            />
          ))}
        </View>
      </ScrollView>

      <OnboardingFooter
        onContinue={() =>
          router.push({
            pathname: '/(onboarding)/selling-focus',
            params: { ...params, brandIdentity: selected !== null ? OPTIONS[selected].label : '' },
          })
        }
        onSkip={() =>
          router.push({ pathname: '/(onboarding)/selling-focus', params })
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

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import SelectableOption from '../../src/components/onboarding/SelectableOption';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

const OPTIONS = [
  { label: 'Klub sepak bola lokal / komunitas bola', emoji: '⚽' },
  { label: 'Klub futsal / sekolah & kampus', emoji: '🏟️' },
  { label: 'Komunitas non-olahraga (motor, hobi)', emoji: '🏍️' },
  { label: 'Organisasi/instansi (sekolah, perusahaan)', emoji: '🏢' },
  { label: 'Brand sendiri untuk online (brand owner)', emoji: '🛍️' },
  { label: 'Supplier ke toko fisik / marketplace', emoji: '📦' },
];

export default function SellingFocusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<number[]>([]);
  const [other, setOther] = useState('');

  const toggle = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={50} totalSteps={14} currentStep={7} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanChat
          messages={[
            'Keren! 🎯',
            'Apa fokus utama kamu dalam menjual jersey?\n(boleh pilih lebih dari satu)',
          ]}
        />

        <View style={styles.options}>
          {OPTIONS.map((opt, i) => (
            <SelectableOption
              key={i}
              label={opt.label}
              emoji={opt.emoji}
              selected={selected.includes(i)}
              onPress={() => toggle(i)}
              multiSelect
            />
          ))}

          {/* Lainnya input */}
          <View style={styles.otherField}>
            <TextInput
              style={styles.otherInput}
              placeholder="Lainnya... (opsional)"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={other}
              onChangeText={setOther}
            />
          </View>
        </View>
      </ScrollView>

      <OnboardingFooter
        onContinue={() =>
          router.push({
            pathname: '/(onboarding)/target',
            params: {
              ...params,
              sellingFocus: JSON.stringify(selected.map((i) => OPTIONS[i].label)),
            },
          })
        }
        onSkip={() => router.push({ pathname: '/(onboarding)/target', params })}
        continueLabel={`Lanjutkan${selected.length ? ` (${selected.length} dipilih)` : ''}`}
        continueDisabled={selected.length === 0}
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
    paddingTop: 8,
  },
  options: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  otherField: {
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  otherInput: {
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
});

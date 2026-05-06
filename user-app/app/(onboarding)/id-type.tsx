import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';
import OnboardingFooter from '../../src/components/onboarding/OnboardingFooter';

const ID_TYPES = [
  {
    key: 'ktp',
    icon: '🪪',
    title: 'KTP',
    subtitle: 'Kartu Tanda Penduduk',
    desc: 'Untuk usia 17 tahun ke atas',
  },
  {
    key: 'ktm',
    icon: '🎓',
    title: 'KTM',
    subtitle: 'Kartu Pelajar / Mahasiswa',
    desc: 'Untuk pelajar di bawah 17 tahun',
  },
];

export default function IdTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={71} totalSteps={14} currentStep={10} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="hero" size={160} showGlow />

        <CalmanChat
          messages={[
            'Hampir selesai! 🆔',
            'Untuk verifikasi identitas, kamu pakai KTP atau Kartu Pelajar?',
          ]}
        />

        <View style={styles.cards}>
          {ID_TYPES.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.card, selected === item.key && styles.cardSelected]}
              onPress={() => setSelected(item.key)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, selected === item.key && styles.iconCircleSelected]}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>
                <View style={[styles.radioOuter, selected === item.key && styles.radioOuterSelected]}>
                  {selected === item.key && <View style={styles.radioInner} />}
                </View>
              </View>
              <Text style={[styles.cardTitle, selected === item.key && styles.cardTitleSelected]}>
                {item.title}
              </Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBulb}>💡</Text>
          <Text style={styles.infoText}>
            Calsub menerima reseller pelajar untuk membangun masa depan finansial sejak dini.
          </Text>
        </View>
      </ScrollView>

      <OnboardingFooter
        onContinue={() =>
          router.push({
            pathname: '/(onboarding)/bank-setup',
            params: { ...params, idType: selected || '' },
          })
        }
        onSkip={() => router.push({ pathname: '/(onboarding)/bank-setup', params })}
        continueLabel="Lanjutkan"
        continueDisabled={!selected}
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
  cards: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 14,
  },
  card: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
  },
  cardSelected: {
    borderColor: stitchColors.gold,
    backgroundColor: 'rgba(212,168,71,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(212,168,71,0.2)',
  },
  iconText: {
    fontSize: 24,
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: stitchColors.gold,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: stitchColors.gold,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: stitchColors.gold,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212,168,71,0.12)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,168,71,0.25)',
  },
  infoBulb: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  infoText: {
    color: stitchColors.gold,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});

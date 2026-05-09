import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';
import CalmanHero from '../../src/components/onboarding/CalmanHero';

const TIERS = [
  {
    label: '1-50 pcs',
    subtitle: 'Sambil belajar, mulai pelan',
    estimate: 'EST. RP 250RB-1.5JT/BLN',
  },
  {
    label: '51-200 pcs',
    subtitle: 'Sudah cukup serius',
    estimate: 'EST. RP 1.5JT-6JT/BLN',
  },
  {
    label: '201-500 pcs',
    subtitle: 'Power reseller mode',
    estimate: 'EST. RP 6JT-15JT/BLN',
  },
  {
    label: '500+ pcs',
    subtitle: 'Top tier reseller',
    estimate: 'EST. RP 15JT+/BLN',
  },
];

export default function EarningPotentialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={styles.screen}>
      {/* Light theme header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        <Text style={styles.stepText}>STEP 6 OF 6</Text>
        <Text style={styles.stepPercent}>90%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '90%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="avatar" size={140} showGlow />

        <Text style={styles.heading}>Hampir selesai! 🏁</Text>

        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            Berapa target PO yang kamu mau capai per bulan?
          </Text>
        </View>

        <View style={styles.grid}>
          {TIERS.map((tier, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.tierCard,
                selected === i && styles.tierCardSelected,
              ]}
              onPress={() => setSelected(i)}
              activeOpacity={0.7}
            >
              {selected === i && (
                <View style={styles.tierCheck}>
                  <Text style={styles.tierCheckMark}>✓</Text>
                </View>
              )}
              <Text style={[styles.tierLabel, selected === i && styles.tierLabelSelected]}>
                {tier.label}
              </Text>
              <Text style={styles.tierSubtitle}>{tier.subtitle}</Text>
              <View style={styles.tierDivider} />
              <Text style={styles.tierEstimate}>{tier.estimate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, selected === null && styles.submitBtnDisabled]}
          onPress={() =>
            router.push({
              pathname: '/(onboarding)/id-type',
              params: { ...params, targetPO: selected !== null ? TIERS[selected].label : '' },
            })
          }
          disabled={selected === null}
        >
          <Text style={styles.submitText}>Selesaikan Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipRow}
          onPress={() => router.push({ pathname: '/(onboarding)/id-type', params })}
        >
          <Text style={styles.skipIcon}></Text>
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: stitchColors.pageSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: stitchColors.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    color: stitchColors.textOnLight,
    fontSize: 18,
    fontWeight: '700',
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CCBBBB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    color: '#8C716E',
    fontSize: 16,
    fontWeight: '600',
  },
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  stepText: {
    color: stitchColors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stepPercent: {
    color: stitchColors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E8D8D5',
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: stitchColors.primary,
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  heading: {
    color: stitchColors.primary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  questionBox: {
    backgroundColor: '#FFF0EE',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  questionText: {
    color: stitchColors.textOnLight,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  tierCard: {
    width: '47%',
    borderWidth: 1.5,
    borderColor: '#E0BFBC',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  tierCardSelected: {
    borderColor: stitchColors.primary,
    backgroundColor: '#FFF8F7',
  },
  tierCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: stitchColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCheckMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tierLabel: {
    color: stitchColors.textOnLight,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  tierLabelSelected: {
    color: stitchColors.primary,
  },
  tierSubtitle: {
    color: '#8C716E',
    fontSize: 12,
    marginBottom: 12,
  },
  tierDivider: {
    height: 1,
    backgroundColor: '#E0BFBC',
    marginBottom: 10,
  },
  tierEstimate: {
    color: '#5F5E5E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: stitchColors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    backgroundColor: '#C4A3A2',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skipIcon: {
    fontSize: 14,
  },
  skipText: {
    color: '#8C716E',
    fontSize: 14,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { stitchColors } from '../../theme/stitch';

interface OnboardingFooterProps {
  onContinue: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showSkip?: boolean;
  showMute?: boolean;
}

export default function OnboardingFooter({
  onContinue,
  onSkip,
  continueLabel = 'Lanjutkan',
  continueDisabled = false,
  showSkip = true,
  showMute = true,
}: OnboardingFooterProps) {
  return (
    <View style={styles.container}>
      {showMute && (
        <TouchableOpacity style={styles.muteButton}>
          <Text style={styles.muteIcon}>🔇</Text>
        </TouchableOpacity>
      )}

      {showSkip && onSkip && (
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Lewati ↓</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          continueDisabled && styles.continueButtonDisabled,
        ]}
        onPress={onContinue}
        disabled={continueDisabled}
      >
        <Text style={[styles.continueText, continueDisabled && styles.continueTextDisabled]}>
          {continueLabel}  →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 12,
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'auto',
  },
  muteIcon: {
    fontSize: 18,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: stitchColors.gold,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 160,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(212,168,71,0.3)',
  },
  continueText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
  continueTextDisabled: {
    color: 'rgba(26,6,6,0.5)',
  },
});

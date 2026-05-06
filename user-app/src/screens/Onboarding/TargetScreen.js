import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import OptionCard from '../../components/OptionCard';
import { stitchColors } from '../../theme/stitch';

const OPTIONS = [
  { id: '1', label: '< Rp 1 Juta', sublabel: 'Untuk tambahan uang jajan', emoji: '🌱' },
  { id: '2', label: 'Rp 1-5 Juta', sublabel: 'Penghasilan sampingan stabil', emoji: '💸' },
  { id: '3', label: 'Rp 5-10 Juta', sublabel: 'Fokus bisnis serius', emoji: '🚀' },
  { id: '4', label: '> Rp 10 Juta', sublabel: 'Bangun kerajaan bisnismu', emoji: '👑' },
];

export default function TargetScreen({ navigation, route }) {
  const [selectedId, setSelectedId] = useState(null);
  const [onboardingData, setOnboardingData] = useState({});

  const handleNext = () => {
    if (selectedId) {
      const selectedOption = OPTIONS.find(o => o.id === selectedId);
      navigation.navigate('Category', {
        onboardingData: { ...onboardingData, target: selectedOption.label }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={4} />
      
      <View style={styles.content}>
        <Image source={require('../../../assets/stitch/calman-coach.jpg')} style={styles.hero} />
        <Text style={styles.title}>Berapa target komisi yang ingin kamu raih per bulan?</Text>
        <Text style={styles.subtitle}>Kami akan merekomendasikan strategi penjualan jersey yang tepat untukmu.</Text>
        
        <View style={styles.optionsContainer}>
          {OPTIONS.map((opt) => (
            <OptionCard
              key={opt.id}
              label={opt.label}
              sublabel={opt.sublabel}
              emoji={opt.emoji}
              selected={selectedId === opt.id}
              onPress={() => setSelectedId(opt.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !selectedId && styles.buttonDisabled]} 
          disabled={!selectedId}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Lanjutkan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stitchColors.page,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: stitchColors.textOnDark,
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: stitchColors.textMutedDark,
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
  },
  button: {
    backgroundColor: stitchColors.gold,
    height: 56,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(212,168,71,0.35)',
  },
  buttonText: {
    color: stitchColors.page,
    fontSize: 16,
    fontWeight: '700',
  },
  hero: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 16,
    alignSelf: 'center',
  },
});

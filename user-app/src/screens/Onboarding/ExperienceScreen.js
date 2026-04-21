import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import OptionCard from '../../components/OptionCard';

const EXP_LEVELS = [
  { id: 'exp1', label: 'Baru Mulai', sublabel: 'Belum pernah jual jersey sebelumnya', emoji: '🐣' },
  { id: 'exp2', label: 'Pernah Coba', sublabel: 'Sudah pernah dapat beberapa order', emoji: '🧑‍🎓' },
  { id: 'exp3', label: 'Reseller Aktif', sublabel: 'Punya pelanggan tetap & order rutin', emoji: '🏅' },
];

export default function ExperienceScreen({ navigation, route }) {
  const { onboardingData } = route.params;
  const [selectedId, setSelectedId] = useState(null);

  const handleNext = () => {
    if (selectedId) {
      const selectedExp = EXP_LEVELS.find(e => e.id === selectedId).label;
      navigation.navigate('Analyzing', {
        onboardingData: { ...onboardingData, experience: selectedExp }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={4} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Pengalamanmu sebagai reseller jersey?</Text>
        <Text style={styles.subtitle}>Tidak apa-apa jika baru mulai, tim CALSUB akan membimbingmu dari nol.</Text>
        
        <View style={styles.optionsContainer}>
          {EXP_LEVELS.map((exp) => (
            <OptionCard
              key={exp.id}
              label={exp.label}
              sublabel={exp.sublabel}
              emoji={exp.emoji}
              selected={selectedId === exp.id}
              onPress={() => setSelectedId(exp.id)}
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
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
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
    backgroundColor: '#FF8C00',
    height: 56,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,140,0,0.3)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

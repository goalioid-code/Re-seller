import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import OptionCard from '../../components/OptionCard';

const CATEGORIES = [
  { id: 'cat1', label: 'Jersey Tim / Club', emoji: '⚽' },
  { id: 'cat2', label: 'Jersey Custom Brand', emoji: '🏆' },
  { id: 'cat3', label: 'Jersey Komunitas / Geng', emoji: '👥' },
  { id: 'cat4', label: 'Jaket & Hoodie', emoji: '🧥' },
  { id: 'cat5', label: 'Kaos Casual & Polo', emoji: '👕' },
  { id: 'cat6', label: 'Aksesoris Olahraga', emoji: '🪡' },
];

export default function CategoryScreen({ navigation, route }) {
  const { onboardingData } = route.params;
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleNext = () => {
    if (selectedIds.length > 0) {
      const selectedCategories = CATEGORIES
        .filter(c => selectedIds.includes(c.id))
        .map(c => c.label);
      navigation.navigate('Experience', {
        onboardingData: { ...onboardingData, categories: selectedCategories }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={4} />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Jenis produk apa yang ingin kamu jual?</Text>
        <Text style={styles.subtitle}>Pilih satu atau lebih kategori. Kami akan menyesuaikan paket harga terbaikmu.</Text>
        
        <View style={styles.optionsContainer}>
          {CATEGORIES.map((cat) => (
            <OptionCard
              key={cat.id}
              label={cat.label}
              emoji={cat.emoji}
              selected={selectedIds.includes(cat.id)}
              onPress={() => toggleSelection(cat.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, selectedIds.length === 0 && styles.buttonDisabled]} 
          disabled={selectedIds.length === 0}
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

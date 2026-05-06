import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { stitchColors } from '../../src/theme/stitch';

const { width } = Dimensions.get('window');

export default function OnboardingIndex() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Header Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/calsub-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Hero Section - soft pink bg */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/stitch/calma-hero2.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.heading}>
          Jualan Jersey Tanpa Modal, Cuan Tanpa Batas
        </Text>
        <Text style={styles.subheading}>
          Bergabung jadi Reseller Calsub. Komisi per pcs, poin reward, dan tier eksklusif.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(onboarding)/name')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Daftar Sebagai Reseller</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Sudah punya akun? Masuk
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF0EE',
  },
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 160,
    height: 50,
  },
  tagline: {
    color: '#8C716E',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
  },
  heroImage: {
    width: width * 0.7,
    height: width * 0.7,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 24,
    paddingTop: 38,
    justifyContent: 'flex-end',
    paddingBottom: 75,
  },
  heading: {
    color: stitchColors.textOnLight,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    color: '#58413F',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: stitchColors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: stitchColors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';

const { width } = Dimensions.get('window');

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const userName = params.name || 'Kamu';

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>CALSUB</Text>
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>🎉 Mantap! Profil kamu lengkap</Text>
        </View>
        <View style={styles.topDots}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.topDot} />
          ))}
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Confetti-like decorations */}
        <View style={[styles.confetti, { top: 40, left: 30 }]}>
          <Text style={{ fontSize: 18 }}>🎊</Text>
        </View>
        <View style={[styles.confetti, { top: 60, right: 40 }]}>
          <Text style={{ fontSize: 14 }}>✨</Text>
        </View>
        <View style={[styles.confetti, { top: 120, left: 60 }]}>
          <Text style={{ fontSize: 12 }}>⭐</Text>
        </View>

        {/* Hero image */}
        <View style={styles.heroContainer}>
          <View style={styles.heroRing}>
            <Image
              source={require('../../assets/stitch/calman-hero.jpg')}
              style={styles.heroImage}
            />
          </View>
        </View>

        {/* Success text */}
        <Text style={styles.heading}>Yes {userName}! 🔥</Text>
        <Text style={styles.subheading}>
          Profil kamu udah keren banget. Tinggal satu langkah lagi untuk verifikasi akun.
        </Text>

        {/* Feature icons */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🏪</Text>
            </View>
            <Text style={styles.featureLabel}>Toko Online</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>💰</Text>
            </View>
            <Text style={styles.featureLabel}>Komisi</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🎁</Text>
            </View>
            <Text style={styles.featureLabel}>Reward</Text>
          </View>
        </View>
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.replace('/pending')}
        >
          <Text style={styles.ctaBtnText}>🪪  Upload KTP & Verifikasi  →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2D0A0A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  logoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  topBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  topBadgeText: {
    color: stitchColors.gold,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  topDots: {
    flexDirection: 'row',
    gap: 3,
  },
  topDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: stitchColors.gold,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
  },
  heroContainer: {
    marginBottom: 24,
  },
  heroRing: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    borderWidth: 3,
    borderColor: 'rgba(212,168,71,0.4)',
    padding: 6,
    shadowColor: '#D4A847',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.55) / 2,
  },
  heading: {
    color: stitchColors.gold,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  subheading: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  features: {
    flexDirection: 'row',
    gap: 28,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,71,0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ctaBtn: {
    backgroundColor: stitchColors.gold,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
});

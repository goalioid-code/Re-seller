import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';

const { width, height } = Dimensions.get('window');

export default function WelcomeRegistrationScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Image 
            source={require('../../assets/calsub-logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>
        <View style={styles.progressArea}>
          <Text style={styles.progressText}>0% selesai</Text>
          <View style={styles.progressBars}>
            <View style={[styles.bar, styles.barFilled]} />
            <View style={styles.bar} />
            <View style={styles.bar} />
            <View style={styles.bar} />
            <View style={styles.bar} />
            <View style={styles.bar} />
          </View>
        </View>
      </View>

      {/* Hero Image */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/stitch/calma-hero2.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Chat Section */}
      <View style={styles.chatSection}>
        <View style={styles.chatRow}>
          <View style={styles.chatSpacer} />
          <View style={[styles.bubble, styles.bubbleLight]}>
            <Text style={styles.bubbleText}>Halo! Saya Calman 👋</Text>
          </View>
        </View>

        <View style={styles.chatRow}>
          <Image
            source={require('../../assets/stitch/calman-avatar.jpg')}
            style={styles.avatar}
          />
          <View style={[styles.bubble, styles.bubbleLight]}>
            <Text style={styles.bubbleText}>
              Saya manager Calsub Reseller. Saya akan bantu kamu setup akun & mulai jualan jersey hari ini juga!
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(onboarding)/name')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Mulai Daftar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  logoBadge: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  logoImage: {
    width: 85,
    height: 28,
  },
  progressArea: {
    alignItems: 'flex-end',
    gap: 6,
  },
  progressText: {
    color: '#8B1A1A',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBars: {
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EAEAEA',
  },
  barFilled: {
    backgroundColor: '#8B1A1A',
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  heroImage: {
    width: width * 0.75,
    height: height * 0.45,
  },
  chatSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  chatSpacer: {
    width: 40,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E0BFBC',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxWidth: '85%',
  },
  bubbleLight: {
    backgroundColor: '#FFF8F7',
    borderWidth: 1,
    borderColor: '#FDE4E1',
  },
  bubbleText: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#8B1A1A',
    height: 56,
    borderRadius: 28 ,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

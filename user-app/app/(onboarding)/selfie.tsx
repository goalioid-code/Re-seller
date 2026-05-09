import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';

export default function SelfieScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const takeSelfie = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Maaf, kami butuh izin akses kamera untuk mengambil foto selfie.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled) {
        setSelfieUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error taking selfie:', error);
    }
  };

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={92} totalSteps={14} currentStep={13} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="hero" size={140} showGlow />

        <CalmanChat
          messages={[
            'Last step! 🤞',
            'Selfie sambil pegang KTP kamu, untuk verifikasi anti-fraud.',
          ]}
        />

        {/* Camera frame / Preview */}
        <TouchableOpacity 
          style={styles.frameContainer} 
          onPress={takeSelfie}
          activeOpacity={0.8}
        >
          {selfieUri ? (
            <Image source={{ uri: selfieUri }} style={styles.previewImage} />
          ) : (
            <>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Status badge */}
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>✅</Text>
                <Text style={styles.statusText}>Wajah dalam frame</Text>
              </View>

              {/* Face oval */}
              <View style={styles.faceOval} />

              {/* KTP placeholder */}
              <View style={styles.ktpHolder}>
                <Text style={styles.ktpHolderIcon}>🪪</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Text style={styles.instrIcon}>👤</Text>
            <Text style={styles.instrText}>Wajah dalam{'\n'}frame</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instrIcon}>🪪</Text>
            <Text style={styles.instrText}>KTP di{'\n'}samping wajah</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instrIcon}>💡</Text>
            <Text style={styles.instrText}>Pencahayaan{'\n'}cukup</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.selfieBtn}
          onPress={() => {
            if (selfieUri) {
              router.push({
                pathname: '/(onboarding)/review',
                params: { ...params, selfieUri },
              });
            } else {
              takeSelfie();
            }
          }}
        >
          <Text style={styles.selfieBtnText}>
            {selfieUri ? 'Lanjutkan  ➔' : 'Mulai Selfie  📷'}
          </Text>
        </TouchableOpacity>

        <View style={styles.skipRow}>
          <TouchableOpacity style={styles.muteBtn}>
            <Text style={{ fontSize: 18 }}>🔇</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(onboarding)/review', params })}
          >
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  frameContainer: {
    marginHorizontal: 40,
    marginTop: 24,
    aspectRatio: 0.75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: stitchColors.gold,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  faceOval: {
    width: 120,
    height: 150,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  ktpHolder: {
    width: 70,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: stitchColors.gold,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  ktpHolderIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 24,
  },
  instructionItem: {
    alignItems: 'center',
    gap: 6,
  },
  instrIcon: {
    fontSize: 22,
  },
  instrText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  selfieBtn: {
    backgroundColor: stitchColors.gold,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selfieBtnText: {
    color: '#1A0606',
    fontSize: 16,
    fontWeight: '700',
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: stitchColors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

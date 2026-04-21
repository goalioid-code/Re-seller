import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

/**
 * ProgressBar - Indikator step onboarding
 * @param {number} currentStep - Step sekarang (mulai dari 1)
 * @param {number} totalSteps  - Total step
 */
export default function ProgressBar({ currentStep, totalSteps }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progress = currentStep / totalSteps;
    Animated.spring(animatedWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [currentStep, totalSteps]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View
            style={[styles.fill, { width: widthInterpolated }]}
          />
        </View>
      </View>
      <Text style={styles.label}>
        {currentStep} / {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  trackContainer: {
    flex: 1,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 99,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    minWidth: 28,
  },
});

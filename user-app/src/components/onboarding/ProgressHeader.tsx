import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { stitchColors } from '../../theme/stitch';

interface ProgressHeaderProps {
  percentage: number;
  totalSteps?: number;
  currentStep?: number;
}

export default function ProgressHeader({ percentage, totalSteps = 14, currentStep = 1 }: ProgressHeaderProps) {
  const filledSteps = Math.round((percentage / 100) * totalSteps);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Image 
          source={require('../../../assets/calsub-logo.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
      </View>
      <View style={styles.right}>
        <Text style={styles.percentText}>{percentage}% selesai</Text>
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < filledSteps ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  badge: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  logoImage: {
    width: 85,
    height: 28,
  },
  right: {
    alignItems: 'flex-end',
  },
  percentText: {
    color: stitchColors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 2,
  },
  dotFilled: {
    backgroundColor: stitchColors.gold,
  },
  dotEmpty: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

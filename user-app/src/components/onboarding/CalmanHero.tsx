import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

type CalmanImage = 'hero' | 'avatar' | 'coach';

interface CalmanHeroProps {
  variant?: CalmanImage;
  size?: number;
  showGlow?: boolean;
}

const images = {
  hero: require('../../../assets/stitch/calman-hero.jpg'),
  avatar: require('../../../assets/stitch/calman-avatar.jpg'),
  coach: require('../../../assets/stitch/calman-coach.jpg'),
};

export default function CalmanHero({ variant = 'hero', size = 200, showGlow = true }: CalmanHeroProps) {
  return (
    <View style={styles.container}>
      {showGlow && (
        <View
          style={[
            styles.glow,
            {
              width: size + 30,
              height: size + 30,
              borderRadius: (size + 30) / 2,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.imageContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Image
          source={images[variant]}
          style={[styles.image, { width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  glow: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,71,0.35)',
    backgroundColor: 'transparent',
    shadowColor: '#D4A847',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  imageContainer: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(212,168,71,0.5)',
    backgroundColor: '#2D0A0A',
    shadowColor: '#D4A847',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  image: {
    alignSelf: 'center',
    marginTop: 4,
  },
});

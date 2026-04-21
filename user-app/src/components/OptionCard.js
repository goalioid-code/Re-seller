import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';

/**
 * OptionCard - Tombol pilihan bergaya kotak premium
 * @param {string}   label      - Teks utama
 * @param {string}   emoji      - Emoji dekoratif
 * @param {string}   sublabel   - Teks kecil di bawah
 * @param {boolean}  selected   - Apakah sedang terpilih
 * @param {function} onPress    - Callback saat ditekan
 */
export default function OptionCard({ label, emoji, sublabel, selected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 5,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, selected && styles.cardSelected]}
      >
        {/* Glow effect saat terpilih */}
        {selected && <View style={styles.glow} />}

        <View style={styles.leftContent}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : null}
          <View style={styles.textContent}>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {label}
            </Text>
            {sublabel ? (
              <Text style={styles.sublabel}>{sublabel}</Text>
            ) : null}
          </View>
        </View>

        {/* Checkmark */}
        <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
          {selected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: 'rgba(255,140,0,0.15)',
    borderColor: '#FF8C00',
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,140,0,0.2)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  emoji: {
    fontSize: 28,
  },
  textContent: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  sublabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});

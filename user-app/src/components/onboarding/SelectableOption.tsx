import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { stitchColors } from '../../theme/stitch';

interface SelectableOptionProps {
  label: string;
  subtitle?: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export default function SelectableOption({
  label,
  subtitle,
  emoji,
  selected,
  onPress,
  multiSelect = false,
}: SelectableOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected ? styles.selected : styles.unselected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <View style={styles.textWrap}>
          <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={[styles.check, selected ? styles.checkSelected : styles.checkEmpty]}>
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: stitchColors.selectedBg,
    borderColor: stitchColors.selectedBorder,
  },
  unselected: {
    backgroundColor: stitchColors.unselectedBg,
    borderColor: stitchColors.unselectedBorder,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 3,
  },
  subtitleSelected: {
    color: stitchColors.gold,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkSelected: {
    backgroundColor: 'rgba(212,168,71,0.25)',
    borderWidth: 1.5,
    borderColor: stitchColors.gold,
  },
  checkEmpty: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  checkMark: {
    color: stitchColors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
});

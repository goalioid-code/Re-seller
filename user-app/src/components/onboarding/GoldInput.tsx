import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { stitchColors } from '../../theme/stitch';

interface GoldInputProps extends TextInputProps {
  label?: string;
  hint?: string;
  icon?: string;
  maxChars?: number;
  currentLength?: number;
}

export default function GoldInput({
  label,
  hint,
  icon,
  maxChars,
  currentLength,
  style,
  ...rest
}: GoldInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, focused && styles.containerFocused]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={stitchColors.inputPlaceholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      <View style={styles.bottomRow}>
        {hint && <Text style={styles.hint}>{hint}</Text>}
        {maxChars !== undefined && (
          <Text style={styles.counter}>
            {currentLength ?? 0}/{maxChars}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  label: {
    color: stitchColors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: stitchColors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  containerFocused: {
    borderColor: stitchColors.gold,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: stitchColors.inputText,
    fontSize: 16,
    paddingVertical: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  hint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  counter: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginLeft: 'auto',
  },
});

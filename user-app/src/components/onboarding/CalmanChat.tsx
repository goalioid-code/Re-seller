import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { stitchColors } from '../../theme/stitch';

interface CalmanChatProps {
  messages: string[];
  avatarSize?: number;
}

export default function CalmanChat({ messages, avatarSize = 40 }: CalmanChatProps) {
  return (
    <View style={styles.container}>
      {messages.map((msg, idx) => (
        <View key={idx} style={styles.row}>
          {idx === 0 && (
            <Image
              source={require('../../../assets/stitch/calman-avatar.jpg')}
              style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            />
          )}
          {idx !== 0 && <View style={{ width: avatarSize + 8 }} />}
          <View style={[styles.bubble, idx === 0 ? styles.bubbleFirst : styles.bubbleFollowup]}>
            <Text style={styles.bubbleText}>{msg}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'rgba(212,168,71,0.4)',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    flexShrink: 1,
  },
  bubbleFirst: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bubbleFollowup: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 23,
  },
});

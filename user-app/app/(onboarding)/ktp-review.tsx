import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { safeRouterBack } from '../../src/lib/safeRouterBack';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';

export default function KtpReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [ktpData, setKtpData] = useState({
    nik: '',
    nama: '',
    tempatTglLahir: '',
    jenisKelamin: '',
    alamat: '',
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    if (params.ocrData) {
      try {
        const parsed = JSON.parse(params.ocrData as string);
        setKtpData({
          nik: parsed.nik || '',
          nama: parsed.nama || '',
          tempatTglLahir: parsed.tempatTglLahir || '',
          jenisKelamin: parsed.jenisKelamin || '',
          alamat: parsed.alamat || '',
        });
      } catch (e) {}
    }
  }, [params.ocrData]);

  const updateField = (key: keyof typeof ktpData, value: string) => {
    setKtpData(prev => ({ ...prev, [key]: value }));
  };

  const isNameMatched = 
    params.accountName && 
    ktpData.nama.trim().toLowerCase() === (params.accountName as string).trim().toLowerCase();

  const fields = [
    { key: 'nik' as const, label: 'NIK', value: ktpData.nik },
    { key: 'nama' as const, label: 'NAMA LENGKAP', value: ktpData.nama, match: isNameMatched },
    { key: 'tempatTglLahir' as const, label: 'TEMPAT / TGL LAHIR', value: ktpData.tempatTglLahir },
    { key: 'jenisKelamin' as const, label: 'JENIS KELAMIN', value: ktpData.jenisKelamin },
    { key: 'alamat' as const, label: 'ALAMAT', value: ktpData.alamat },
  ];

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={85} totalSteps={14} currentStep={12} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Calman with message */}
        <View style={styles.avatarRow}>
          <Image
            source={require('../../assets/stitch/calman-avatar.jpg')}
            style={styles.avatar}
          />
          <View style={styles.chatCol}>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>Sip! Data berhasil dibaca ✨</Text>
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>
                Cek datanya, kalau ada yang salah bisa diedit.
              </Text>
            </View>
          </View>
        </View>

        {/* KTP Photo preview */}
        <View style={styles.ktpRow}>
          <View style={styles.ktpThumb}>
            {params.imageUri ? (
              <Image source={{ uri: params.imageUri as string }} style={styles.ktpThumbImage} />
            ) : (
              <Text style={styles.ktpPlaceholder}>🪪</Text>
            )}
          </View>
          <Text style={styles.ktpLabel}>FOTO KTP</Text>
          <TouchableOpacity onPress={() => safeRouterBack(router, '/(onboarding)' as Href)}>
            <Text style={styles.retakeBtn}>🔄 Foto Ulang</Text>
          </TouchableOpacity>
        </View>

        {/* Data fields */}
        <View style={styles.fieldsArea}>
          {fields.map((field) => {
            const isEditing = editingField === field.key;

            return (
              <View key={field.key} style={[styles.fieldCard, isEditing && styles.fieldCardActive]}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={styles.fieldValueRow}>
                  <View style={{ flex: 1 }}>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={field.value}
                        onChangeText={(val) => updateField(field.key, val)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <Text style={styles.fieldValue}>{field.value || '-'}</Text>
                        {field.key === 'nama' && field.match && (
                          <Text style={styles.matchBadge}>✓ COCOK DENGAN REKENING</Text>
                        )}
                        {field.key === 'nama' && !field.match && ktpData.nama && (
                          <Text style={styles.mismatchBadge}>⚠️ TIDAK COCOK DENGAN REKENING</Text>
                        )}
                      </>
                    )}
                  </View>
                  <View style={styles.fieldActions}>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: stitchColors.gold }]}
                        onPress={() => setEditingField(null)}
                      >
                        <Text style={styles.actionIcon}>✅</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => setEditingField(field.key)}
                      >
                        <Text style={styles.actionIcon}>✏️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, editingField !== null && styles.confirmBtnDisabled]}
          onPress={() => {
            if (editingField) {
              setEditingField(null);
            } else {
              router.push({
                pathname: '/(onboarding)/selfie',
                params: { ...params, finalKtpData: JSON.stringify(ktpData) },
              });
            }
          }}
        >
          <Text style={styles.confirmBtnText}>
            {editingField ? 'Simpan Edit Dulu' : 'Konfirmasi & Lanjut'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.muteRow}>
          <Text style={{ fontSize: 16 }}>🔇</Text>
        </TouchableOpacity>
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(212,168,71,0.4)',
    marginRight: 12,
  },
  chatCol: {
    flex: 1,
    gap: 8,
  },
  chatBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  ktpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  ktpThumb: {
    width: 70,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ktpThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ktpPlaceholder: {
    fontSize: 24,
  },
  ktpLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  retakeBtn: {
    color: stitchColors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldsArea: {
    paddingHorizontal: 20,
    gap: 10,
  },
  fieldCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
  },
  fieldCardActive: {
    borderColor: stitchColors.gold,
    backgroundColor: 'rgba(212,168,71,0.05)',
  },
  fieldLabel: {
    color: stitchColors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  editInput: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: stitchColors.gold,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  matchBadge: {
    color: stitchColors.success,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  mismatchBadge: {
    color: stitchColors.warning,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: stitchColors.gold,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: 'rgba(212,168,71,0.4)',
  },
  confirmBtnText: {
    color: '#1A0606',
    fontSize: 15,
    fontWeight: '700',
  },
  muteRow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

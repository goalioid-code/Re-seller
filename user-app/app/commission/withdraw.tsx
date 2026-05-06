import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import tw from 'twrnc';
import { ArrowLeft } from 'lucide-react-native';
import { stitchColors } from '../../src/theme/stitch';

export default function CommissionWithdrawScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    const amt = parseFloat(amount.replace(/\./g, '').replace(/,/g, '.'));
    if (!amt || Number.isNaN(amt)) {
      Alert.alert('Periksa lagi', 'Nominal tidak valid.');
      return;
    }
    if (!bankName.trim() || !bankAccount.trim() || !accountName.trim()) {
      Alert.alert('Periksa lagi', 'Data bank wajib lengkap.');
      return;
    }
    setSubmitting(true);
    try {
      const api = getApiBaseUrl();
      const res = await fetchWithTimeout(`${api}/resellers/commission/withdrawals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amt,
          bank_name: bankName.trim(),
          bank_account: bankAccount.trim(),
          account_name: accountName.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Gagal', data.message || 'Pengajuan ditolak.');
        return;
      }
      Alert.alert('Berhasil', data.message || 'Pengajuan dikirim.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Tidak terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  }, [amount, bankName, bankAccount, accountName, notes, token, router]);

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: stitchColors.pageSoft }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={tw`flex-row items-center px-5 pt-12 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3 p-2`}>
          <ArrowLeft color={stitchColors.primary} size={24} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: stitchColors.primary }]}>Pencairan komisi</Text>
      </View>

      <ScrollView style={tw`flex-1 px-5`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-gray-400 text-sm mb-4`}>
          Minimal Rp 1.000.000 per pengajuan. Pastikan saldo mencukupi.
        </Text>

        <Text style={tw`text-gray-400 text-xs mb-1`}>Nominal (Rp)</Text>
        <TextInput
          style={[tw`rounded-xl px-4 py-3 mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1, color: stitchColors.textOnLight }]}
          placeholder="1000000"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={tw`text-gray-400 text-xs mb-1`}>Nama bank</Text>
        <TextInput
          style={[tw`rounded-xl px-4 py-3 mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1, color: stitchColors.textOnLight }]}
          placeholder="BCA"
          placeholderTextColor="#64748B"
          value={bankName}
          onChangeText={setBankName}
        />

        <Text style={tw`text-gray-400 text-xs mb-1`}>Nomor rekening</Text>
        <TextInput
          style={[tw`rounded-xl px-4 py-3 mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1, color: stitchColors.textOnLight }]}
          placeholder="1234567890"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={bankAccount}
          onChangeText={setBankAccount}
        />

        <Text style={tw`text-gray-400 text-xs mb-1`}>Nama pemilik rekening</Text>
        <TextInput
          style={[tw`rounded-xl px-4 py-3 mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1, color: stitchColors.textOnLight }]}
          placeholder="Sesuai buku tabungan"
          placeholderTextColor="#64748B"
          value={accountName}
          onChangeText={setAccountName}
        />

        <Text style={tw`text-gray-400 text-xs mb-1`}>Catatan (opsional)</Text>
        <TextInput
          style={[tw`rounded-xl px-4 py-3 mb-6`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1, color: stitchColors.textOnLight }]}
          placeholder="Keterangan untuk admin"
          placeholderTextColor="#64748B"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={[tw`py-4 rounded-2xl items-center mb-10 ${submitting ? 'opacity-60' : ''}`, { backgroundColor: stitchColors.primary }]}
          onPress={() => void submit()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-bold`}>Kirim pengajuan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

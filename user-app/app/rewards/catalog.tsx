import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import tw from 'twrnc';
import { ArrowLeft, Gift } from 'lucide-react-native';
import { stitchColors } from '../../src/theme/stitch';

type Reward = {
  id: string;
  name: string;
  description?: string | null;
  points_cost: number;
  stock: number;
};

export default function RewardsCatalogScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pick, setPick] = useState<Reward | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const api = getApiBaseUrl();
      const [rRes, pRes] = await Promise.all([
        fetchWithTimeout(`${api}/resellers/rewards`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchWithTimeout(`${api}/resellers/points/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const rJson = await rRes.json();
      const pJson = await pRes.json();
      if (rJson.success) setRewards(rJson.rewards || []);
      if (pJson.success) setBalance(pJson.summary?.balance ?? 0);
    } catch (e) {
      console.error('[Rewards]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const redeem = async () => {
    if (!pick) return;
    setBusy(true);
    try {
      const api = getApiBaseUrl();
      const res = await fetchWithTimeout(`${api}/resellers/rewards/redeem`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reward_id: pick.id,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Gagal', data.message || 'Penukaran ditolak.');
        return;
      }
      setPick(null);
      setAddress('');
      setNotes('');
      Alert.alert('Berhasil', data.message || 'Penukaran diajukan.');
      void load();
    } catch {
      Alert.alert('Error', 'Tidak terhubung ke server.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-[#0F172A] justify-center items-center`}>
        <ActivityIndicator size="large" color={stitchColors.primary} />
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: stitchColors.pageSoft }]}>
      <View style={tw`flex-row items-center px-5 pt-12 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3 p-2`}>
          <ArrowLeft color={stitchColors.primary} size={24} />
        </TouchableOpacity>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-xl font-bold`, { color: stitchColors.primary }]}>Katalog hadiah</Text>
          <Text style={[tw`text-xs`, { color: stitchColors.textMutedLight }]}>Saldo poin: {balance.toLocaleString('id-ID')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/rewards/redemptions' as any)} style={tw`px-3 py-2`}>
          <Text style={[tw`text-sm font-semibold`, { color: stitchColors.primary }]}>Riwayat</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-5 pb-24`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={stitchColors.primary} />}
        ListEmptyComponent={<Text style={tw`text-gray-500 text-center py-10`}>Belum ada hadiah aktif.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[tw`rounded-2xl p-4 mb-3 flex-row`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}
            onPress={() => setPick(item)}
          >
            <View style={tw`bg-violet-600/30 w-12 h-12 rounded-xl items-center justify-center mr-3`}>
              <Gift color="#A78BFA" size={22} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={[tw`font-bold`, { color: stitchColors.textOnLight }]}>{item.name}</Text>
              {item.description ? (
                <Text style={tw`text-gray-500 text-xs mt-1`} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={tw`text-amber-400 font-bold mt-2`}>{item.points_cost.toLocaleString('id-ID')} poin</Text>
              <Text style={tw`text-gray-600 text-xs`}>Stok: {item.stock}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!pick} transparent animationType="slide">
        <View style={tw`flex-1 bg-black/70 justify-end`}>
          <View style={tw`bg-[#1E293B] rounded-t-3xl p-6 border-t border-gray-700`}>
            <Text style={tw`text-white text-lg font-bold mb-1`}>{pick?.name}</Text>
            <Text style={tw`text-amber-400 mb-4`}>{pick?.points_cost.toLocaleString('id-ID')} poin</Text>
            <Text style={tw`text-gray-400 text-xs mb-1`}>Alamat pengiriman (opsional)</Text>
            <TextInput
              style={tw`bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-white mb-3`}
              placeholder="Alamat lengkap"
              placeholderTextColor="#64748B"
              value={address}
              onChangeText={setAddress}
            />
            <Text style={tw`text-gray-400 text-xs mb-1`}>Catatan</Text>
            <TextInput
              style={tw`bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-white mb-4`}
              placeholder="Ukuran / warna / dll."
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
            />
            <TouchableOpacity
              style={tw`bg-blue-600 py-3 rounded-xl items-center mb-2 ${busy ? 'opacity-60' : ''}`}
              disabled={busy}
              onPress={() => void redeem()}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-bold`}>Tukar poin</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPick(null)} style={tw`py-3 items-center`}>
              <Text style={tw`text-gray-400`}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import tw from 'twrnc';
import { ArrowLeft } from 'lucide-react-native';

type Row = {
  id: string;
  points_used: number;
  status: string;
  created_at: string;
  reward?: { name: string } | null;
};

export default function RewardRedemptionsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const api = getApiBaseUrl();
      const res = await fetchWithTimeout(`${api}/resellers/rewards/redemptions?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRows(data.redemptions || []);
    } catch (e) {
      console.error('[Redemptions]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={tw`flex-1 bg-[#0F172A] justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-[#0F172A]`}>
      <View style={tw`flex-row items-center px-5 pt-12 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3 p-2`}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={tw`text-white text-xl font-bold`}>Riwayat penukaran</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-5 pb-24`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#3B82F6" />}
        ListEmptyComponent={<Text style={tw`text-gray-500 text-center py-10`}>Belum ada penukaran.</Text>}
        renderItem={({ item }) => (
          <View style={tw`bg-[#1E293B] border border-gray-800 rounded-2xl p-4 mb-3`}>
            <Text style={tw`text-white font-bold`}>{item.reward?.name || 'Hadiah'}</Text>
            <Text style={tw`text-gray-400 text-sm mt-1`}>{item.points_used.toLocaleString('id-ID')} poin</Text>
            <Text style={tw`text-gray-500 text-xs mt-2`}>{item.status}</Text>
            <Text style={tw`text-gray-600 text-xs mt-1`}>
              {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : ''}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

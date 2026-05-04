import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import tw from 'twrnc';
import { ArrowLeft, Star, AlertTriangle } from 'lucide-react-native';

type PtRow = {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  expires_at?: string | null;
  note?: string | null;
};

export default function PointsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [expiring, setExpiring] = useState(0);
  const [history, setHistory] = useState<PtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const api = getApiBaseUrl();
      const [sRes, hRes] = await Promise.all([
        fetchWithTimeout(`${api}/resellers/points/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchWithTimeout(`${api}/resellers/points/history?limit=40`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const sJson = await sRes.json();
      const hJson = await hRes.json();
      if (sJson.success) {
        setBalance(sJson.summary?.balance ?? 0);
        setExpiring(sJson.summary?.expiring_within_30_days ?? 0);
      }
      if (hJson.success) setHistory(hJson.points || []);
    } catch (e) {
      console.error('[Points]', e);
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
        <Text style={tw`text-white text-xl font-bold`}>Poin</Text>
      </View>

      <ScrollView
        style={tw`flex-1 px-5`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#3B82F6" />}
      >
        {expiring > 0 ? (
          <View style={tw`bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 mb-4 flex-row items-start`}>
            <AlertTriangle color="#FBBF24" size={22} style={tw`mt-0.5 mr-2`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-amber-200 font-bold mb-1`}>Poin akan kedaluwarsa</Text>
              <Text style={tw`text-amber-100/90 text-sm`}>
                Ada {expiring.toLocaleString('id-ID')} poin dari batch yang kadaluarsa dalam 30 hari. Tukar sebelum hangus.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={tw`bg-[#1E293B] rounded-3xl border border-gray-800 p-5 mb-4`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Star size={22} color="#FBBF24" />
            <Text style={tw`text-gray-400 ml-2 text-sm`}>Saldo poin</Text>
          </View>
          <Text style={tw`text-white text-3xl font-extrabold`}>{balance.toLocaleString('id-ID')}</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-slate-700 py-3 rounded-xl items-center`}
            onPress={() => router.push('/rewards/catalog' as any)}
          >
            <Text style={tw`text-white font-semibold`}>Lihat katalog hadiah</Text>
          </TouchableOpacity>
        </View>

        <Text style={tw`text-white font-bold mb-3`}>Riwayat</Text>
        {history.length === 0 ? (
          <Text style={tw`text-gray-500 py-6 text-center`}>Belum ada riwayat.</Text>
        ) : (
          history.map((item) => {
            const label =
              item.type === 'earned' ? 'Dapat' : item.type === 'redeemed' ? 'Tukar' : item.type === 'expired' ? 'Hangus' : item.type;
            const color =
              item.type === 'earned' ? 'text-emerald-400' : item.type === 'redeemed' ? 'text-rose-400' : 'text-amber-600';
            const sign = item.type === 'earned' ? '+' : item.type === 'redeemed' || item.type === 'expired' ? '−' : '';
            const val = Math.abs(item.amount);
            return (
              <View key={item.id} style={tw`bg-[#1E293B] border border-gray-800 rounded-2xl p-4 mb-3`}>
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw`text-gray-300 font-medium`}>{label}</Text>
                  <Text style={tw`${color} font-bold`}>
                    {sign}
                    {val.toLocaleString('id-ID')}
                  </Text>
                </View>
                <Text style={tw`text-gray-500 text-xs mt-1`}>
                  {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : ''}
                </Text>
                {item.expires_at ? (
                  <Text style={tw`text-gray-600 text-xs mt-1`}>
                    Kadaluarsa: {new Date(item.expires_at).toLocaleDateString('id-ID')}
                  </Text>
                ) : null}
                {item.note ? <Text style={tw`text-gray-500 text-xs mt-1`}>{item.note}</Text> : null}
              </View>
            );
          })
        )}
        <View style={tw`h-16`} />
      </ScrollView>
    </View>
  );
}

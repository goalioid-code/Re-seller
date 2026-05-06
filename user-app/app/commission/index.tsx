import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import tw from 'twrnc';
import { ArrowLeft, Wallet } from 'lucide-react-native';
import { stitchColors } from '../../src/theme/stitch';

type Summary = {
  available_balance: number;
  total_commission_confirmed: number;
  pending_or_processing_withdrawals: number;
  tier: { id: string; name: string; percentage: number; min_orders: number } | null;
  tiers: { id: string; name: string; percentage: number; min_orders: number }[];
  completed_orders: number;
  tier_progress: {
    current_orders: number;
    next_tier_name?: string;
    next_tier_min_orders?: number;
    orders_to_next?: number;
    percent: number;
    at_max_tier?: boolean;
  };
  min_withdrawal: number;
};

type CommRow = {
  id: string;
  amount: number;
  percentage: number;
  status: string;
  created_at: string;
  order_id?: string | null;
  note?: string | null;
};

export default function CommissionScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<CommRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const api = getApiBaseUrl();
      const [sRes, hRes] = await Promise.all([
        fetchWithTimeout(`${api}/resellers/commission/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchWithTimeout(`${api}/resellers/commission/history?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const sJson = await sRes.json();
      const hJson = await hRes.json();
      if (sJson.success) setSummary(sJson.summary);
      if (hJson.success) setHistory(hJson.commissions || []);
    } catch (e) {
      console.error('[Commission]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const pct = summary?.tier_progress?.percent ?? 0;

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
        <Text style={[tw`text-xl font-bold`, { color: stitchColors.primary }]}>Komisi</Text>
      </View>

      <ScrollView
        style={tw`flex-1 px-5`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={stitchColors.primary} />}
      >
        <View style={[tw`rounded-3xl p-5 mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
          <View style={tw`flex-row items-center mb-2`}>
            <Wallet size={22} color={stitchColors.primary} />
            <Text style={[tw`ml-2 text-sm`, { color: stitchColors.textMutedLight }]}>Saldo bisa dicairkan</Text>
          </View>
          <Text style={[tw`text-3xl font-extrabold`, { color: stitchColors.textOnLight }]}>
            Rp {Number(summary?.available_balance ?? 0).toLocaleString('id-ID')}
          </Text>
          <Text style={[tw`text-xs mt-2`, { color: stitchColors.textMutedLight }]}>
            Terhitung: komisi terkonfirmasi dikurangi pengajuan pencairan aktif.
          </Text>
        </View>

        <View style={tw`bg-[#1E293B] rounded-3xl border border-gray-800 p-5 mb-4`}>
          <Text style={tw`text-white font-bold mb-1`}>Tier komisi</Text>
          <Text style={tw`text-gray-400 text-sm mb-3`}>
            Tier saat ini:{' '}
            <Text style={tw`text-blue-400 font-bold`}>{summary?.tier?.name || 'Belum ditetapkan'}</Text>
            {summary?.tier ? ` · ${summary.tier.percentage}%` : ''}
          </Text>
          <Text style={tw`text-gray-500 text-xs mb-2`}>
            Order selesai: {summary?.completed_orders ?? 0}
            {summary?.tier_progress?.next_tier_name
              ? ` · Menuju ${summary.tier_progress.next_tier_name} (${summary.tier_progress.orders_to_next} order lagi)`
              : summary?.tier_progress?.at_max_tier
                ? ' · Tier tertinggi'
                : ''}
          </Text>
          <View style={tw`h-2 bg-slate-700 rounded-full overflow-hidden`}>
            <View style={[tw`h-2 bg-blue-500 rounded-full`, { width: `${pct}%` }]} />
          </View>
          <Text style={tw`text-gray-500 text-xs mt-2`}>Progres naik tier: {pct}%</Text>
        </View>

        <View style={tw`flex-row gap-3 mb-4`}>
          <TouchableOpacity
            style={tw`flex-1 bg-blue-600 py-4 rounded-2xl items-center`}
            onPress={() => router.push('/commission/withdraw' as any)}
          >
            <Text style={tw`text-white font-bold`}>Ajukan pencairan</Text>
            <Text style={tw`text-blue-200 text-xs mt-1`}>
              Min. Rp {(summary?.min_withdrawal ?? 1_000_000).toLocaleString('id-ID')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={tw`text-white font-bold mb-3`}>Riwayat komisi</Text>
        {history.length === 0 ? (
          <Text style={tw`text-gray-500 py-6 text-center`}>Belum ada data.</Text>
        ) : (
          history.map((item) => (
            <View key={item.id} style={tw`bg-[#1E293B] border border-gray-800 rounded-2xl p-4 mb-3`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-emerald-400 font-bold`}>+ Rp {Number(item.amount).toLocaleString('id-ID')}</Text>
                <Text style={tw`text-gray-500 text-xs`}>{item.status}</Text>
              </View>
              <Text style={tw`text-gray-400 text-xs mt-1`}>
                {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : ''}
              </Text>
              {item.note ? <Text style={tw`text-gray-500 text-xs mt-1`}>{item.note}</Text> : null}
            </View>
          ))
        )}
        <View style={tw`h-16`} />
      </ScrollView>
    </View>
  );
}

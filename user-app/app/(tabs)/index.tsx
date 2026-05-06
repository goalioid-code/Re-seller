import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import tw from 'twrnc';
import { Bell, Package, TrendingUp, CreditCard } from 'lucide-react-native';
import { stitchColors } from '../../src/theme/stitch';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <ScrollView 
      style={[tw`flex-1`, { backgroundColor: stitchColors.pageSoft }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={stitchColors.primary} />
      }
    >
      <View style={tw`p-6 pt-12`}>
        <View style={tw`flex-row justify-between items-center mb-8`}>
          <View>
            <Text style={[tw`text-lg`, { color: stitchColors.textMutedLight }]}>Halo, Selamat Datang</Text>
            <Text style={[tw`text-2xl font-bold`, { color: stitchColors.primary }]}>{user?.full_name}</Text>
          </View>
          <TouchableOpacity style={[tw`p-3 rounded-full`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
            <Bell size={20} color={stitchColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={tw`flex-row flex-wrap justify-between mb-8`}>
          <View style={[tw`w-[48%] p-4 rounded-3xl mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
            <TrendingUp size={24} color={stitchColors.primary} />
            <Text style={[tw`text-2xl font-bold mt-2`, { color: stitchColors.textOnLight }]}>12</Text>
            <Text style={[tw`text-xs`, { color: stitchColors.textMutedLight }]}>Order Aktif</Text>
          </View>
          <View style={[tw`w-[48%] p-4 rounded-3xl mb-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
            <Package size={24} color="#10B981" />
            <Text style={[tw`text-2xl font-bold mt-2`, { color: stitchColors.textOnLight }]}>128</Text>
            <Text style={[tw`text-xs`, { color: stitchColors.textMutedLight }]}>Total Produksi</Text>
          </View>
        </View>

        {/* Sync Info (placeholder for superapps_data.tasks) */}
        <View style={[tw`p-5 rounded-3xl mb-4`, { backgroundColor: stitchColors.goldSoft, borderColor: stitchColors.gold, borderWidth: 1 }]}>
          <Text style={[tw`font-bold mb-2`, { color: stitchColors.primary }]}>ℹ️ Sinkronisasi ERP Aktif</Text>
          <Text style={[tw`text-sm leading-5`, { color: stitchColors.textMutedLight }]}>
            Data pesanan disinkronkan secara real-time dari skema superapps_data. Segera cek dashboard master untuk detail LK.
          </Text>
        </View>

        <View style={tw`flex-row gap-3 mb-8`}>
          <TouchableOpacity
            style={[tw`flex-1 py-4 rounded-2xl items-center`, { backgroundColor: stitchColors.primary }]}
            onPress={() => router.push('/order/create' as any)}
            activeOpacity={0.9}
          >
            <Text style={tw`text-white font-extrabold`}>+ Buat order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[tw`flex-1 py-4 rounded-2xl items-center flex-row justify-center`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}
            onPress={() => router.push('/payment/history' as any)}
            activeOpacity={0.9}
          >
            <CreditCard size={20} color={stitchColors.primary} style={tw`mr-2`} />
            <Text style={[tw`font-bold`, { color: stitchColors.primary }]}>Pembayaran</Text>
          </TouchableOpacity>
        </View>

        <Text style={[tw`text-lg font-bold mb-4`, { color: stitchColors.primary }]}>Aktivitas Terbaru</Text>
        <View style={[tw`rounded-3xl p-4`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
          <Text style={[tw`text-center py-10`, { color: stitchColors.textMutedLight }]}>Belum ada aktivitas terbaru.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import tw from 'twrnc';
import { Bell, Package, TrendingUp, Users } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <ScrollView 
      style={tw`flex-1 bg-[#0F172A]`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={tw`p-6 pt-12`}>
        <View style={tw`flex-row justify-between items-center mb-8`}>
          <View>
            <Text style={tw`text-gray-400 text-lg`}>Halo, Selamat Datang</Text>
            <Text style={tw`text-white text-2xl font-bold`}>{user?.full_name}</Text>
          </View>
          <TouchableOpacity style={tw`bg-[#1E293B] p-3 rounded-full border border-gray-800`}>
            <Bell size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={tw`flex-row flex-wrap justify-between mb-8`}>
          <View style={tw`w-[48%] bg-[#1E293B] p-4 rounded-3xl border border-gray-800 mb-4`}>
            <TrendingUp size={24} color="#3B82F6" />
            <Text style={tw`text-white text-2xl font-bold mt-2`}>12</Text>
            <Text style={tw`text-gray-500 text-xs`}>Order Aktif</Text>
          </View>
          <View style={tw`w-[48%] bg-[#1E293B] p-4 rounded-3xl border border-gray-800 mb-4`}>
            <Package size={24} color="#10B981" />
            <Text style={tw`text-white text-2xl font-bold mt-2`}>128</Text>
            <Text style={tw`text-gray-500 text-xs`}>Total Produksi</Text>
          </View>
        </View>

        {/* Sync Info (placeholder for superapps_data.tasks) */}
        <View style={tw`bg-blue-600/10 p-5 rounded-3xl border border-blue-500/20 mb-8`}>
          <Text style={tw`text-blue-400 font-bold mb-2`}>ℹ️ Sinkronisasi ERP Aktif</Text>
          <Text style={tw`text-gray-400 text-sm leading-5`}>
            Data pesanan disinkronkan secara real-time dari skema superapps_data. Segera cek dashboard master untuk detail LK.
          </Text>
        </View>

        <Text style={tw`text-white text-lg font-bold mb-4`}>Aktivitas Terbaru</Text>
        <View style={tw`bg-[#1E293B] rounded-3xl border border-gray-800 p-4`}>
          <Text style={tw`text-gray-400 text-center py-10`}>Belum ada aktivitas terbaru.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

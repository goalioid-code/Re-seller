import React from 'react';
import { View, Text, FlatList } from 'react-native';
import tw from 'twrnc';
import { Package } from 'lucide-react-native';

export default function OrdersScreen() {
  return (
    <View style={tw`flex-1 bg-[#0F172A] p-6 pt-12`}>
      <Text style={tw`text-white text-2xl font-bold mb-6`}>Daftar Pesanan</Text>
      
      <View style={tw`flex-1 justify-center items-center`}>
        <Package size={48} color="#64748B" style={tw`mb-4`} />
        <Text style={tw`text-gray-500`}>Belum ada pesanan aktif.</Text>
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TargetScreen() {
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-[#0F172A] p-6 justify-center`}>
      <Text style={tw`text-gray-400 text-lg mb-2`}>Langkah 1 dari 4</Text>
      <Text style={tw`text-white text-3xl font-bold mb-6`}>Apa target penjualan Anda?</Text>
      
      <TouchableOpacity 
        style={tw`bg-[#1E293B] p-5 rounded-2xl border border-gray-800 mb-4`}
        onPress={() => Alert.alert('Selected', '10-50 Jersey')}
      >
        <Text style={tw`text-white text-lg`}>10 - 50 Jersey / Bulan</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={tw`bg-blue-600 h-14 rounded-xl items-center justify-center flex-row mt-10`}
        onPress={() => router.push('/(onboarding)/category')}
      >
        <Text style={tw`text-white font-bold text-lg mr-2`}>Lanjut</Text>
        <ArrowRight size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import tw from 'twrnc';

export default function CategoryScreen() {
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-[#0F172A] p-6 justify-center`}>
      <Text style={tw`text-gray-400 text-lg mb-2`}>Langkah 2 dari 4</Text>
      <Text style={tw`text-white text-3xl font-bold mb-6`}>Pilih kategori produk utama</Text>

      <TouchableOpacity style={tw`bg-[#1E293B] p-5 rounded-2xl border border-gray-800 mb-4`}>
        <Text style={tw`text-white text-lg`}>Jersey Printing</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`bg-[#1E293B] p-5 rounded-2xl border border-gray-800 mb-8`}>
        <Text style={tw`text-white text-lg`}>Merchandise & Apparel</Text>
      </TouchableOpacity>

      <View style={tw`flex-row`}>
        <TouchableOpacity
          style={tw`flex-1 bg-gray-700 h-14 rounded-xl items-center justify-center flex-row mr-2`}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="white" />
          <Text style={tw`text-white font-bold text-lg ml-2`}>Kembali</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-1 bg-blue-600 h-14 rounded-xl items-center justify-center flex-row ml-2`}
          onPress={() => router.push('/pending')}
        >
          <Text style={tw`text-white font-bold text-lg mr-2`}>Lanjut</Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

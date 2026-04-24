import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import tw from 'twrnc';
import { Clock } from 'lucide-react-native';

export default function PendingScreen() {
  const { getMe } = useAuth();

  useEffect(() => {
    void getMe();
    const timer = setInterval(() => {
      void getMe();
    }, 10000);
    return () => clearInterval(timer);
  }, [getMe]);

  return (
    <View style={tw`flex-1 bg-[#0F172A] p-6 justify-center items-center`}>
      <View style={tw`bg-[#1E293B] p-8 rounded-3xl border border-gray-800 items-center w-full`}>
        <View style={tw`bg-yellow-500/10 p-5 rounded-full mb-6`}>
          <Clock size={48} color="#EAB308" />
        </View>
        
        <Text style={tw`text-white text-2xl font-bold mb-4 text-center`}>Menunggu Verifikasi</Text>
        <Text style={tw`text-gray-400 text-center leading-6 mb-8`}>
          Akun Anda sedang dalam proses peninjauan oleh tim admin CALSUB. 
          Silakan cek kembali secara berkala.
        </Text>
        <Text style={tw`text-gray-500 text-xs text-center`}>
          Status dicek otomatis setiap beberapa detik.
        </Text>
      </View>
    </View>
  );
}

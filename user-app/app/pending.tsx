import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import tw from 'twrnc';
import { Clock, LogOut } from 'lucide-react-native';

export default function PendingScreen() {
  const { logout } = useAuth();

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

        <TouchableOpacity 
          style={tw`bg-red-600/10 h-14 px-8 rounded-xl items-center justify-center flex-row border border-red-500/20 w-full`}
          onPress={logout}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={tw`text-red-500 font-bold text-lg ml-3`}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

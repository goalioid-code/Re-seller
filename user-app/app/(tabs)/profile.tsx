import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import tw from 'twrnc';
import { LogOut, User as UserIcon, Shield, ChevronRight, CreditCard } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-[#0F172A] p-6 pt-12`}>
      <Text style={tw`text-white text-2xl font-bold mb-8`}>Profil Saya</Text>
      
      <View style={tw`flex-row items-center bg-[#1E293B] p-5 rounded-3xl border border-gray-800 mb-8`}>
        <View style={tw`bg-blue-600 w-14 h-14 rounded-full justify-center items-center`}>
          <UserIcon size={30} color="white" />
        </View>
        <View style={tw`ml-4`}>
          <Text style={tw`text-white text-lg font-bold`}>{user?.full_name}</Text>
          <Text style={tw`text-gray-500`}>{user?.email}</Text>
        </View>
      </View>

      <View style={tw`bg-[#1E293B] rounded-3xl border border-gray-800 overflow-hidden mb-8`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-between p-5 border-b border-gray-800`}
          onPress={() => router.push('/payment/history' as any)}
        >
          <View style={tw`flex-row items-center`}>
            <CreditCard size={20} color="#3B82F6" />
            <Text style={tw`text-white ml-3`}>Riwayat Pembayaran</Text>
          </View>
          <ChevronRight size={20} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row items-center justify-between p-5 border-b border-gray-800`}>
          <View style={tw`flex-row items-center`}>
            <Shield size={20} color="#94A3B8" />
            <Text style={tw`text-white ml-3`}>Keamanan Akun</Text>
          </View>
          <ChevronRight size={20} color="#475569" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={tw`flex-row items-center justify-between p-5`}
          onPress={logout}
        >
          <View style={tw`flex-row items-center`}>
            <LogOut size={20} color="#EF4444" />
            <Text style={tw`text-red-500 ml-3 font-bold`}>Keluar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

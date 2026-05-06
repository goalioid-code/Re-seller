import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import tw from 'twrnc';
import {
  LogOut,
  User as UserIcon,
  Shield,
  ChevronRight,
  CreditCard,
  Wallet,
  Star,
  Gift,
} from 'lucide-react-native';
import { stitchColors } from '../../src/theme/stitch';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[tw`flex-1 p-6 pt-12`, { backgroundColor: stitchColors.pageSoft }]}>
      <Text style={[tw`text-2xl font-bold mb-8`, { color: stitchColors.primary }]}>Profil Saya</Text>
      
      <View style={[tw`flex-row items-center p-5 rounded-3xl mb-8`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
        <View style={[tw`w-14 h-14 rounded-full justify-center items-center`, { backgroundColor: stitchColors.primary }]}>
          <UserIcon size={30} color="white" />
        </View>
        <View style={tw`ml-4`}>
          <Text style={[tw`text-lg font-bold`, { color: stitchColors.textOnLight }]}>{user?.full_name}</Text>
          <Text style={[tw``, { color: stitchColors.textMutedLight }]}>{user?.email}</Text>
        </View>
      </View>

      <View style={[tw`rounded-3xl overflow-hidden mb-8`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
        <TouchableOpacity
          style={[tw`flex-row items-center justify-between p-5 border-b`, { borderColor: stitchColors.borderLight }]}
          onPress={() => router.push('/payment/history' as any)}
        >
          <View style={tw`flex-row items-center`}>
            <CreditCard size={20} color={stitchColors.primary} />
            <Text style={[tw`ml-3`, { color: stitchColors.textOnLight }]}>Riwayat Pembayaran</Text>
          </View>
          <ChevronRight size={20} color={stitchColors.textMutedLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[tw`flex-row items-center justify-between p-5 border-b`, { borderColor: stitchColors.borderLight }]}
          onPress={() => router.push('/commission' as any)}
        >
          <View style={tw`flex-row items-center`}>
            <Wallet size={20} color="#10B981" />
            <Text style={[tw`ml-3`, { color: stitchColors.textOnLight }]}>Komisi & pencairan</Text>
          </View>
          <ChevronRight size={20} color={stitchColors.textMutedLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[tw`flex-row items-center justify-between p-5 border-b`, { borderColor: stitchColors.borderLight }]}
          onPress={() => router.push('/points' as any)}
        >
          <View style={tw`flex-row items-center`}>
            <Star size={20} color="#FBBF24" />
            <Text style={[tw`ml-3`, { color: stitchColors.textOnLight }]}>Poin</Text>
          </View>
          <ChevronRight size={20} color={stitchColors.textMutedLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[tw`flex-row items-center justify-between p-5 border-b`, { borderColor: stitchColors.borderLight }]}
          onPress={() => router.push('/rewards/catalog' as any)}
        >
          <View style={tw`flex-row items-center`}>
            <Gift size={20} color="#A78BFA" />
            <Text style={[tw`ml-3`, { color: stitchColors.textOnLight }]}>Katalog hadiah</Text>
          </View>
          <ChevronRight size={20} color={stitchColors.textMutedLight} />
        </TouchableOpacity>
        <TouchableOpacity style={[tw`flex-row items-center justify-between p-5 border-b`, { borderColor: stitchColors.borderLight }]}>
          <View style={tw`flex-row items-center`}>
            <Shield size={20} color={stitchColors.textMutedLight} />
            <Text style={[tw`ml-3`, { color: stitchColors.textOnLight }]}>Keamanan Akun</Text>
          </View>
          <ChevronRight size={20} color={stitchColors.textMutedLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={tw`flex-row items-center justify-between p-5`}
          onPress={handleLogout}
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

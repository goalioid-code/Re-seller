import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import tw from 'twrnc';
import { Clock } from 'lucide-react-native';
import { stitchColors } from '../src/theme/stitch';

export default function PendingScreen() {
  const { getMe, user } = useAuth();
  const router = useRouter();

  // Polling status reseller dari server tiap 10 detik.
  // Saat admin approve di admin-web, /auth/me akan balikin status 'active'
  // dan effect berikutnya akan auto-redirect ke (tabs).
  useEffect(() => {
    void getMe();
    const timer = setInterval(() => {
      void getMe();
    }, 10000);
    return () => clearInterval(timer);
  }, [getMe]);

  // Auto pindah ke home begitu admin sudah approve (status = 'active').
  useEffect(() => {
    const status = String(user?.status || '').toLowerCase();
    if (status === 'active') {
      router.replace('/(tabs)' as Href);
    }
  }, [user?.status, router]);

  return (
    <View style={[tw`flex-1 p-6 justify-center items-center`, { backgroundColor: stitchColors.pageSoft }]}>
      <View style={[tw`p-8 rounded-3xl items-center w-full`, { backgroundColor: stitchColors.surface, borderColor: stitchColors.borderLight, borderWidth: 1 }]}>
        <View style={[tw`p-5 rounded-full mb-6`, { backgroundColor: stitchColors.goldSoft }]}>
          <Clock size={48} color={stitchColors.gold} />
        </View>
        
        <Text style={[tw`text-2xl font-bold mb-4 text-center`, { color: stitchColors.primary }]}>Menunggu Verifikasi</Text>
        <Text style={[tw`text-center leading-6 mb-8`, { color: stitchColors.textMutedLight }]}>
          Akun Anda sedang dalam proses peninjauan oleh tim admin CALSUB. 
          Silakan cek kembali secara berkala.
        </Text>
        <Text style={[tw`text-xs text-center`, { color: '#8C716E' }]}>
          Status dicek otomatis setiap 10 detik.
        </Text>
      </View>
    </View>
  );
}

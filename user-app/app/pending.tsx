import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import tw from 'twrnc';
import { Clock } from 'lucide-react-native';
import { stitchColors } from '../src/theme/stitch';

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
          Status dicek otomatis setiap beberapa detik.
        </Text>
      </View>
    </View>
  );
}

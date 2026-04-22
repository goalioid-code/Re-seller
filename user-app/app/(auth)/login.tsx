import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import tw from 'twrnc';
import { Mail, MessageCircle, ArrowRight, Shield } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'login' | 'otp'>('login'); // 'login' for email/phone entry, 'otp' for OTP entry
  const [loading, setLoading] = useState(false);
  const { devLogin, whatsappLogin } = useAuth();

  const handleDevLogin = async () => {
    if (!email) return Alert.alert('Error', 'Masukkan email testing');
    setLoading(true);
    try {
      await devLogin(email);
    } catch (err: any) {
      Alert.alert('Login Gagal', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!phone) return Alert.alert('Error', 'Masukkan nomor WhatsApp');
    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/whatsapp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.success) {
        setStage('otp');
        Alert.alert('Sukses', 'OTP telah dikirim ke WhatsApp Anda.');
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert('Error', 'Masukkan kode OTP');
    setLoading(true);
    try {
      await whatsappLogin(phone, otp);
      Alert.alert('Sukses', 'Login berhasil!');
    } catch (err: any) {
      Alert.alert('Verifikasi Gagal', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-[#0F172A] p-6 justify-center`}>
      <View style={tw`mb-10 items-center`}>
        <Text style={tw`text-white text-3xl font-bold`}>CALSUB</Text>
        <Text style={tw`text-gray-400 text-lg mt-2`}>Reseller Dashboard</Text>
      </View>

      <View style={tw`bg-[#1E293B] p-6 rounded-3xl border border-gray-800`}>
        {stage === 'login' ? (
          <>
            <Text style={tw`text-white text-xl font-bold mb-6`}>Login Ke Akun</Text>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-400 mb-2 ml-1`}>Nomor WhatsApp</Text>
              <View style={tw`flex-row items-center bg-[#0F172A] rounded-xl px-4 border border-gray-700`}>
                <MessageCircle size={20} color="#94A3B8" />
                <TextInput
                  style={tw`flex-1 h-12 text-white ml-3`}
                  placeholder="0812xxxx"
                  placeholderTextColor="#475569"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={tw`bg-green-600 h-14 rounded-xl items-center justify-center flex-row mb-6`}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text style={tw`text-white font-bold text-lg mr-2`}>Kirim OTP via WA</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <View style={tw`flex-row items-center my-4`}>
              <View style={tw`flex-1 h-px bg-gray-800`} />
              <Text style={tw`mx-4 text-gray-500`}>Atau Login Developer</Text>
              <View style={tw`flex-1 h-px bg-gray-800`} />
            </View>

            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center bg-[#0F172A] rounded-xl px-4 border border-gray-700`}>
                <Mail size={20} color="#94A3B8" />
                <TextInput
                  style={tw`flex-1 h-12 text-white ml-3`}
                  placeholder="Email Developer"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={tw`bg-gray-700 h-12 rounded-xl items-center justify-center`}
              onPress={handleDevLogin}
              disabled={loading}
            >
              <Text style={tw`text-white font-bold`}>Login Dev</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={tw`text-white text-xl font-bold mb-2`}>Verifikasi OTP</Text>
            <Text style={tw`text-gray-400 mb-8`}>Masukkan 6 digit kode yang dikirim ke {phone}</Text>

            <View style={tw`mb-8`}>
              <View style={tw`flex-row items-center bg-[#0F172A] rounded-xl px-4 border border-gray-700`}>
                <Shield size={24} color="#94A3B8" />
                <TextInput
                  style={tw`flex-1 h-16 text-white ml-4 text-2xl font-bold tracking-widest`}
                  placeholder="000000"
                  placeholderTextColor="#475569"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={tw`bg-blue-600 h-14 rounded-xl items-center justify-center mb-4`}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={tw`text-white font-bold text-lg`}>Verifikasi & Masuk</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setStage('login')}
              style={tw`items-center`}
            >
              <Text style={tw`text-gray-400`}>Ganti nomor WhatsApp</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={tw`text-gray-500 text-center mt-10`}>
        CALSUB Management System v1.0
      </Text>
    </View>
  );
}

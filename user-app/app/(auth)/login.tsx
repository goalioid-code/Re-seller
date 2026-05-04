import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import tw from 'twrnc';
import { Mail, MessageCircle, ArrowRight, Shield } from 'lucide-react-native';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { getAuthRedirectHref } from '../../src/lib/authRedirect';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [authChannel, setAuthChannel] = useState<'whatsapp' | 'email'>('email');
  const [stage, setStage] = useState<'login' | 'otp' | 'profile'>('login');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { devLogin, whatsappLogin, emailLogin, isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    const next = getAuthRedirectHref(isLoggedIn, user, false) as Href;
    if (isLoggedIn && user && next !== '/(auth)/login') {
      router.replace(next);
    }
  }, [isLoggedIn, user, authLoading, router]);

  const handleDevLogin = async () => {
    if (!email) return Alert.alert('Error', 'Masukkan email testing');
    setFeedback('');
    setLoading(true);
    try {
      await devLogin(email);
    } catch (err: any) {
      setFeedback(err?.message || 'Login dev gagal.');
      Alert.alert('Login Gagal', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (authChannel === 'whatsapp' && !phone) return Alert.alert('Error', 'Masukkan nomor WhatsApp');
    if (authChannel === 'email' && !email) return Alert.alert('Error', 'Masukkan email');
    setFeedback('');
    setLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetchWithTimeout(
        `${apiUrl}/auth/${authChannel === 'whatsapp' ? 'whatsapp' : 'email'}/request`,
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authChannel === 'whatsapp' ? { phone } : { email: email.trim().toLowerCase() }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (data.success) {
        setStage('otp');
        setFeedback(
          authChannel === 'whatsapp'
            ? 'OTP berhasil diminta. Silakan cek WhatsApp Anda.'
            : 'OTP berhasil diminta. Silakan cek email Anda.'
        );
        Alert.alert('Sukses', authChannel === 'whatsapp' ? 'OTP telah dikirim ke WhatsApp Anda.' : 'OTP telah dikirim ke email Anda.');
      } else {
        throw new Error(data.message || `Request OTP gagal (${response.status})`);
      }
    } catch (err: any) {
      const message =
        err?.name === 'AbortError'
          ? 'Request timeout. Pastikan backend aktif dan API URL mengarah ke IP laptop yang benar.'
          : err?.message || 'Gagal mengirim OTP.';
      setFeedback(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert('Error', 'Masukkan kode OTP');
    setFeedback('');
    setLoading(true);
    try {
      const result =
        authChannel === 'whatsapp'
          ? await whatsappLogin(phone, otp)
          : await emailLogin(email.trim().toLowerCase(), otp);
      if (result?.needs_profile) {
        setStage('profile');
        setFeedback(
          authChannel === 'whatsapp'
            ? 'Nomor baru terdeteksi. Lengkapi nama dan email untuk daftar.'
            : 'Email baru terdeteksi. Lengkapi nama untuk daftar.'
        );
        return;
      }
      setFeedback('Verifikasi OTP berhasil.');
      Alert.alert('Sukses', 'Login berhasil!');
    } catch (err: any) {
      setFeedback(err?.message || 'Verifikasi OTP gagal.');
      Alert.alert('Verifikasi Gagal', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!fullName.trim()) return Alert.alert('Error', 'Masukkan nama lengkap');
    if (authChannel === 'whatsapp' && !email.trim()) return Alert.alert('Error', 'Masukkan email');
    setFeedback('');
    setLoading(true);
    try {
      if (authChannel === 'whatsapp') {
        await whatsappLogin(phone, otp, {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
        });
      } else {
        await emailLogin(email.trim().toLowerCase(), otp, {
          full_name: fullName.trim(),
        });
      }
      setFeedback('Pendaftaran berhasil. Menunggu verifikasi admin.');
      Alert.alert('Sukses', 'Akun berhasil dibuat. Silakan tunggu verifikasi admin.');
    } catch (err: any) {
      setFeedback(err?.message || 'Gagal menyelesaikan pendaftaran.');
      Alert.alert('Pendaftaran Gagal', err.message);
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

            <View style={tw`flex-row mb-4 bg-[#0F172A] p-1 rounded-xl border border-gray-700`}>
              <TouchableOpacity
                style={tw`${authChannel === 'email' ? 'bg-blue-600' : 'bg-transparent'} flex-1 h-10 rounded-lg items-center justify-center flex-row`}
                onPress={() => setAuthChannel('email')}
              >
                <Mail size={16} color="white" />
                <Text style={tw`text-white ml-2 font-semibold`}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`${authChannel === 'whatsapp' ? 'bg-green-600' : 'bg-transparent'} flex-1 h-10 rounded-lg items-center justify-center flex-row`}
                onPress={() => setAuthChannel('whatsapp')}
              >
                <MessageCircle size={16} color="white" />
                <Text style={tw`text-white ml-2 font-semibold`}>WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-400 mb-2 ml-1`}>{authChannel === 'whatsapp' ? 'Nomor WhatsApp' : 'Email'}</Text>
              <View style={tw`flex-row items-center bg-[#0F172A] rounded-xl px-4 border border-gray-700`}>
                {authChannel === 'whatsapp' ? (
                  <MessageCircle size={20} color="#94A3B8" />
                ) : (
                  <Mail size={20} color="#94A3B8" />
                )}
                <TextInput
                  style={tw`flex-1 h-12 text-white ml-3`}
                  placeholder={authChannel === 'whatsapp' ? '0812xxxx' : 'email@contoh.com'}
                  placeholderTextColor="#475569"
                  value={authChannel === 'whatsapp' ? phone : email}
                  onChangeText={authChannel === 'whatsapp' ? setPhone : setEmail}
                  keyboardType={authChannel === 'whatsapp' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={tw`${authChannel === 'whatsapp' ? 'bg-green-600' : 'bg-blue-600'} h-14 rounded-xl items-center justify-center flex-row mb-6`}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  {authChannel === 'whatsapp' ? (
                    <Image
                      source={require('../../assets/wa-logo.webp')}
                      style={tw`w-13 h-13 mr-3`}
                      resizeMode="contain"
                    />
                  ) : (
                    <Mail size={20} color="white" />
                  )}
                  <Text style={tw`text-white font-bold text-lg mr-2`}>
                    {authChannel === 'whatsapp' ? 'Kirim OTP via WhatsApp' : 'Kirim OTP via Email'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {!!feedback && (
              <Text style={tw`text-xs text-amber-300 mb-4`}>{feedback}</Text>
            )}

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
        ) : stage === 'otp' ? (
          <>
            <Text style={tw`text-white text-xl font-bold mb-2`}>Verifikasi OTP</Text>
            <Text style={tw`text-gray-400 mb-8`}>
              Masukkan 6 digit kode yang dikirim ke {authChannel === 'whatsapp' ? phone : email}
            </Text>

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
                <Text style={tw`text-white font-bold text-lg`}>Verifikasi</Text>
              )}
            </TouchableOpacity>
            {!!feedback && (
              <Text style={tw`text-xs text-amber-300 mb-4`}>{feedback}</Text>
            )}

            <TouchableOpacity 
              onPress={() => setStage('login')}
              style={tw`items-center`}
            >
              <Text style={tw`text-gray-400`}>
                {authChannel === 'whatsapp' ? 'Ganti nomor WhatsApp' : 'Ganti email'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={tw`text-white text-xl font-bold mb-2`}>Lengkapi Pendaftaran</Text>
            <Text style={tw`text-gray-400 mb-8`}>
              Akun baru terdeteksi. Isi data berikut agar masuk ke daftar verifikasi admin.
            </Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-400 mb-2 ml-1`}>Nama Lengkap</Text>
              <View style={tw`flex-row items-center bg-[#0F172A] rounded-xl px-4 border border-gray-700`}>
                <Shield size={20} color="#94A3B8" />
                <TextInput
                  style={tw`flex-1 h-12 text-white ml-3`}
                  placeholder="Nama lengkap"
                  placeholderTextColor="#475569"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={tw`mb-8`}>
              <Text style={tw`text-gray-400 mb-2 ml-1`}>Email</Text>
              <View style={tw`flex-row items-center bg-[#0F172A] rounded-xl px-4 border border-gray-700`}>
                <Mail size={20} color="#94A3B8" />
                <TextInput
                  style={tw`flex-1 h-12 text-white ml-3`}
                  placeholder="email@contoh.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={authChannel === 'whatsapp'}
                />
              </View>
            </View>

            <TouchableOpacity
              style={tw`bg-blue-600 h-14 rounded-xl items-center justify-center mb-4`}
              onPress={handleCompleteProfile}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={tw`text-white font-bold text-lg`}>Selesaikan Pendaftaran</Text>
              )}
            </TouchableOpacity>
            {!!feedback && (
              <Text style={tw`text-xs text-amber-300 mb-4`}>{feedback}</Text>
            )}
            <TouchableOpacity onPress={() => setStage('login')} style={tw`items-center`}>
              <Text style={tw`text-gray-400`}>Kembali</Text>
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

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { stitchColors } from '../../src/theme/stitch';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, user, loading: authLoading, devLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn && user) {
      // Setelah login berhasil, arahkan sesuai status (active -> tabs, pending -> /pending).
      const status = String((user as any).status || '').toLowerCase();
      router.replace((status === 'active' ? '/(tabs)' : '/pending') as Href);
    }
  }, [isLoggedIn, user, authLoading, router]);

  const handleLogin = async () => {
    if (!identifier.trim()) return Alert.alert('Error', 'Masukkan email');
    if (!password.trim()) return Alert.alert('Error', 'Masukkan kata sandi');
    setLoading(true);
    try {
      await devLogin(identifier.trim().toLowerCase(), password);
      // Redirect ditangani di useEffect di atas berdasarkan status reseller.
    } catch (err: any) {
      Alert.alert('Login Gagal', err?.message || 'Email atau kata sandi salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Selamat Datang Kembali</Text>
        <Text style={styles.subheading}>Masuk untuk mengelola bisnis jersey Anda.</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Email field */}
        <Text style={styles.label}>EMAIL</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan email kamu"
            placeholderTextColor="#B8A8A6"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password field */}
        <Text style={[styles.label, { marginTop: 16 }]}>KATA SANDI</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Masukkan kata sandi"
            placeholderTextColor="#B8A8A6"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Lupa Kata Sandi?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginBtnText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Atau masuk dengan</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>iOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom link */}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Belum punya akun? </Text>
        <TouchableOpacity onPress={() => router.push('/(onboarding)')}>
          <Text style={styles.bottomLink}>Daftar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: stitchColors.pageSoft,
    paddingHorizontal: 24,
  },
  backBtn: {
    marginTop: 52,
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    color: stitchColors.primary,
    fontSize: 28,
    fontWeight: '300',
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  heading: {
    color: stitchColors.primary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subheading: {
    color: stitchColors.textMutedLight,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {},
  label: {
    color: '#5F5E5E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDE0DE',
    paddingHorizontal: 16,
    minHeight: 54,
  },
  input: {
    flex: 1,
    color: stitchColors.textOnLight,
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 24,
  },
  forgotText: {
    color: stitchColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: stitchColors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0BFBC',
  },
  dividerText: {
    color: '#8C716E',
    fontSize: 12,
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0BFBC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  socialIcon: {
    color: stitchColors.textOnLight,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 40,
  },
  bottomText: {
    color: stitchColors.textMutedLight,
    fontSize: 14,
  },
  bottomLink: {
    color: stitchColors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

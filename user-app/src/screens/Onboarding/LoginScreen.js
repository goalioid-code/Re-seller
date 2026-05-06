import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { stitchColors } from '../../theme/stitch';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { devLogin } = useAuth();

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Silakan masukkan email Anda.');
      return;
    }

    setLoading(true);
    try {
      await devLogin(email);
      // Auth state update will handle redirection automatically in App.js
    } catch (err) {
      Alert.alert('Login Gagal', err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require('../../../assets/stitch/calman-avatar.jpg')} style={styles.hero} />
            <Text style={styles.title}>Selamat Datang</Text>
            <Text style={styles.subtitle}>Masuk dengan email pendaftaran Anda.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Masuk Sekarang</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={styles.registerLinkText}>Daftar di sini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stitchColors.pageSoft,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: stitchColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: stitchColors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: stitchColors.textMutedLight,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: stitchColors.textMutedLight,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: stitchColors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: stitchColors.textOnLight,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: stitchColors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: stitchColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: stitchColors.borderLight,
  },
  dividerText: {
    color: stitchColors.textMutedLight,
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
  },
  registerText: {
    color: stitchColors.textMutedLight,
    textAlign: 'center',
    fontSize: 15,
  },
  registerLinkText: {
    color: stitchColors.primary,
    fontWeight: '700',
  },
  hero: {
    width: 72,
    height: 72,
    marginBottom: 14,
    borderRadius: 36,
    alignSelf: 'center',
  },
});


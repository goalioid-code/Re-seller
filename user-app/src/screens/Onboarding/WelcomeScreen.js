import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');
WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { login, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  };
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri,
      usePKCE: false,
      extraParams: {
        prompt: 'select_account',
        nonce: 'calsub_nonce',
      },
    },
    discovery
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    const completeGoogleLogin = async () => {
      try {
        if (!response) return;

        if (response.type === 'success') {
          setErrorMessage(null);
          const googleIdToken = response.authentication?.idToken || response.params?.id_token;

          if (!googleIdToken) {
            throw new Error('ID token Google tidak ditemukan. Cek konfigurasi OAuth client.');
          }

          const authResponse = await login(googleIdToken, null);
          if (authResponse.is_new_user) {
            navigation.replace('Target', { onboardingData: {} });
          }
        } else if (response.type === 'error') {
          const oauthError =
            response.error?.message ||
            response.params?.error_description ||
            response.params?.error ||
            'Autentikasi Google gagal. Silakan coba lagi.';
          throw new Error(oauthError);
        } else if (response.type === 'dismiss') {
          throw new Error('Login Google dibatalkan.');
        }
      } catch (err) {
        const errorMsg = err.message || 'Gagal login. Coba lagi.';
        setErrorMessage(errorMsg);
        console.error('[WelcomeScreen] Login error detail:', {
          message: err?.message,
          responseType: response?.type,
          responseParams: response?.params,
          responseError: response?.error,
        });
      } finally {
        setGoogleLoading(false);
      }
    };

    completeGoogleLogin();
  }, [response, login, navigation]);

  const handleContinueWithGoogle = async () => {
    try {
      setErrorMessage(null);
      setGoogleLoading(true);
      await promptAsync({ useProxy: true });
    } catch (err) {
      setGoogleLoading(false);
      const errorMsg = err.message || 'Gagal membuka login Google.';
      setErrorMessage(errorMsg);
      console.error('[WelcomeScreen] Prompt Google error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/calma-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>CALSUB</Text>
        </View>

        {/* Main message */}
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>Jadi Reseller CALSUB</Text>
          <Text style={styles.subtitle}>
            Terima order custom, kelola pembayaran, monitor produksi. Semua dari satu aplikasi.
          </Text>
        </View>

        {/* Features list */}

        {/* Error message */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Continue with Google - Main Button */}
        <TouchableOpacity
          style={[styles.googleButton, (loading || googleLoading || !request) && styles.buttonDisabled]}
          onPress={handleContinueWithGoogle}
          disabled={loading || googleLoading || !request}
          activeOpacity={0.8}
        >
          {loading || googleLoading ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <>
              <View style={styles.googleIconWrapper}>
                <Image
                  source={require('../../../assets/google-logo.png')}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Dengan lanjut, Anda setuju dengan
          <Text style={styles.termsLink}> Syarat & Ketentuan</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    bottom: -50,
    left: -80,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  featuresList: {
    marginBottom: 40,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleLogo: {
    width: 22,
    height: 22,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#3C4043',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

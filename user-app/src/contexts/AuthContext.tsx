import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  photo_url?: string;
  phone?: string;
  address?: string;
  status: string;
  tier?: any;
  onboarding_data?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (idToken: string, onboardingData?: any) => Promise<any>;
  whatsappLogin: (phone: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  devLogin: (email: string) => Promise<any>;
  devRegister: (userData: any) => Promise<any>;
  updateProfile: (profileData: any) => Promise<void>;
  getMe: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('jwtToken');
      const savedUser = await AsyncStorage.getItem('userData');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('[Auth] Bootstrap error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (idToken: string, onboardingData: any = null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: idToken,
          onboarding_data: onboardingData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      await AsyncStorage.setItem('jwtToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.reseller));

      setToken(data.token);
      setUser(data.reseller);

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const whatsappLogin = async (phone: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/whatsapp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi gagal');
      }

      await AsyncStorage.setItem('jwtToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.reseller));

      setToken(data.token);
      setUser(data.reseller);

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const devLogin = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/dev-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      await AsyncStorage.setItem('jwtToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.reseller));

      setToken(data.token);
      setUser(data.reseller);

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const devRegister = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/dev-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      await AsyncStorage.setItem('jwtToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.reseller));

      setToken(data.token);
      setUser(data.reseller);

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      setLoading(true);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/resellers/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.reseller);
        await AsyncStorage.setItem('userData', JSON.stringify(data.reseller));
      }
    } catch (err) {
      console.error('[Auth] Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMe = async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.reseller);
        await AsyncStorage.setItem('userData', JSON.stringify(data.reseller));
      }
    } catch (err) {
      console.error('[Auth] Get me error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        whatsappLogin,
        logout,
        devLogin,
        devRegister,
        updateProfile,
        getMe,
        isLoggedIn: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

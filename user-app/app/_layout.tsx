import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

function RootLayoutNav() {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={tw`flex-1 bg-[#0F172A] justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        ) : !user?.onboarding_data || Object.keys(user.onboarding_data).length === 0 ? (
          <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        ) : user?.status === 'active' ? (
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        ) : (
          <Stack.Screen name="pending" options={{ animation: 'fade' }} />
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { canAccessOrdersRoute, getAuthRedirectHref } from '../../src/lib/authRedirect';
import type { Href } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

export default function PaymentGroupLayout() {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={tw`flex-1 bg-[#0F172A] justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }
  if (!canAccessOrdersRoute(user)) {
    return <Redirect href={getAuthRedirectHref(true, user) as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

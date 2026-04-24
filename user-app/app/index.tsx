import { Redirect, type Href } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { getAuthRedirectHref } from '../src/lib/authRedirect';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

/**
 * Pintu masuk: putuskan tab/auth/onboarding/pending. Harus sejalan dengan gating lama.
 */
export default function Index() {
  const { isLoggedIn, loading, user } = useAuth();
  const href = getAuthRedirectHref(isLoggedIn, user, loading) as Href | null;

  if (loading || !href) {
    return (
      <View style={tw`flex-1 bg-[#0F172A] justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <Redirect href={href} />;
}

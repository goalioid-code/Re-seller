import { Redirect, type Href } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { getAuthRedirectHref } from '../src/lib/authRedirect';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { stitchColors } from '../src/theme/stitch';

/**
 * Pintu masuk: putuskan tab/auth/onboarding/pending. Harus sejalan dengan gating lama.
 */
export default function Index() {
  const { isLoggedIn, loading, user } = useAuth();
  const href = getAuthRedirectHref(isLoggedIn, user, loading) as Href | null;

  if (loading || !href) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: stitchColors.pageSoft }]}>
        <ActivityIndicator size="large" color={stitchColors.primary} />
      </View>
    );
  }

  return <Redirect href={href} />;
}

import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { canAccessOrdersRoute, getAuthRedirectHref } from '../../src/lib/authRedirect';
import type { Href } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { stitchColors } from '../../src/theme/stitch';

export default function RewardsLayout() {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: stitchColors.pageSoft }]}>
        <ActivityIndicator size="large" color={stitchColors.primary} />
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

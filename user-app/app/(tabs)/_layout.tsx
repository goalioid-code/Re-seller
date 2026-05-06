import { Tabs } from 'expo-router';
import { Home, Package, User, CreditCard } from 'lucide-react-native';
import tw from 'twrnc';
import { stitchColors } from '../../src/theme/stitch';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [tw`h-16 pb-2`, { backgroundColor: '#fff', borderTopColor: stitchColors.borderLight, borderTopWidth: 1 }],
        tabBarActiveTintColor: stitchColors.primary,
        tabBarInactiveTintColor: stitchColors.textMutedLight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pesanan',
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

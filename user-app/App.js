import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Provider & Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens - Onboarding
import WelcomeScreen from './src/screens/Onboarding/WelcomeScreen';
import TargetScreen from './src/screens/Onboarding/TargetScreen';
import CategoryScreen from './src/screens/Onboarding/CategoryScreen';
import ExperienceScreen from './src/screens/Onboarding/ExperienceScreen';
import AnalyzingScreen from './src/screens/Onboarding/AnalyzingScreen';
import SignUpScreen from './src/screens/Onboarding/SignUpScreen';

// Screens - Main App
import ProfileScreen from './src/screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();

// Placeholder for Main App Dashboard
function MainAppScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* TODO: Replace with actual dashboard implementation */}
      <View style={styles.placeholder}>
        <Text style={styles.mainText}>📊 Dashboard Utama</Text>
        <Text style={styles.subText}>Selamat datang! Halaman dashboard akan ditampilkan di sini.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PendingApprovalScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.placeholder}>
        <Text style={styles.mainText}>⏳ Menunggu Verifikasi</Text>
        <Text style={styles.subText}>
          Akun Anda masih berstatus pending. Tim admin CALSUB akan meninjau akun Anda terlebih dahulu.
        </Text>
        <Text style={styles.subText}>Silakan cek kembali secara berkala.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Root Navigator - Conditional based on auth state
function RootNavigator() {
  const { isLoggedIn, loading, user } = useAuth();
  
  // User is considered approved if status is active
  const isApproved = user?.status === 'active';
  
  // A new user needs onboarding if they haven't filled out onboarding_data
  const needsOnboarding = isLoggedIn && (!user?.onboarding_data || Object.keys(user.onboarding_data).length === 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        animationEnabled: true,
        cardStyle: { backgroundColor: '#0F172A' }
      }}
    >
      {!isLoggedIn ? (
        // Unauthenticated Stack
        <Stack.Group screenOptions={{ presentation: 'card' }}>
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ animationEnabled: false }}
          />
        </Stack.Group>
      ) : needsOnboarding ? (
        // Needs Onboarding (Authenticated but no data)
        <Stack.Group screenOptions={{ presentation: 'card' }}>
          <Stack.Screen name="Target" component={TargetScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Experience" component={ExperienceScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Group>
      ) : isApproved ? (
        // Fully Authenticated Stack
        <Stack.Group screenOptions={{ presentation: 'card' }}>
          <Stack.Screen 
            name="MainApp" 
            component={MainAppScreen}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ animationEnabled: true }}
          />
        </Stack.Group>
      ) : (
        // Pending Approval Stack
        <Stack.Group screenOptions={{ presentation: 'card' }}>
          <Stack.Screen
            name="PendingApproval"
            component={PendingApprovalScreen}
            options={{ animationEnabled: false }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

// Main App Component wrapped with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

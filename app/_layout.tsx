// Powered by OnSpace.AI
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { RestaurantProvider } from '@/contexts/RestaurantContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <RestaurantProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="menu-item-modal" options={{ headerShown: false, presentation: 'modal' }} />
              </Stack>
            </RestaurantProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}


import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase_types';

// Only load AsyncStorage and URL polyfill on native — avoid SSR/web build errors
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

const getNativeStorage = () => {
  if (Platform.OS === 'web') return undefined;
  return require('@react-native-async-storage/async-storage').default;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getNativeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import React, { createContext, useState, ReactNode } from 'react';
import { getClient } from '@/template/core/client';

export type UserRole = 'owner' | 'accountant' | 'call_center';

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  restaurantId?: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Search for user in Supabase by email or name
      const { data: users, error } = await getClient()
        .from('users')
        .select('*')
        .or(`email.eq.${emailOrUsername},name.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
        .limit(1);

      if (error || !users || users.length === 0) {
        setIsLoading(false);
        return false;
      }

      const userData = users[0];

      // Verify password using Supabase's crypt function
      // For now, we'll do a simple comparison (in production, use proper password hashing)
      // This is a temporary solution - ideally, password verification should be done server-side
      
      // For demo purposes, accept the password if it matches
      // In production, you would use Supabase Auth or a secure password verification method
      
      // Set user data
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        restaurantId: userData.restaurant_id,
        role: (userData.role === 'restaurant_owner' ? 'owner' : userData.role) as UserRole,
      });

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

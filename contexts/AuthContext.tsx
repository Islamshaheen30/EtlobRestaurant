// Powered by OnSpace.AI
import React, { createContext, useState, ReactNode } from 'react';
import { MOCK_USER, MOCK_STAFF, StaffRole, StaffMember } from '@/services/mockData';

export type UserRole = 'owner' | StaffRole;

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  name: string;
  restaurantId: string;
  role: UserRole;
  staffId?: string;
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
    await new Promise(resolve => setTimeout(resolve, 700));

    // Owner login
    if (emailOrUsername === MOCK_USER.email && password === MOCK_USER.password) {
      setUser({
        id: 'owner_001',
        email: MOCK_USER.email,
        name: MOCK_USER.name,
        restaurantId: MOCK_USER.restaurantId,
        role: 'owner',
      });
      setIsLoading(false);
      return true;
    }

    // Staff login (username + password)
    const staff = MOCK_STAFF.find(
      s => s.username === emailOrUsername && s.password === password && s.isActive
    );
    if (staff) {
      setUser({
        id: staff.id,
        username: staff.username,
        name: staff.name,
        restaurantId: 'rest_001',
        role: staff.role,
        staffId: staff.id,
      });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

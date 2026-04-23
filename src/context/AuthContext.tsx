import { createContext } from 'react';
import type { User, AuthResponse } from '../types';

export interface AuthContextType {
  user: User | null;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


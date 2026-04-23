import React, { useState } from 'react';
import type { User, AuthResponse, Role } from '../types';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';

// Function to validate tokens and restore user state
const getInitialAuthState = (): User | null => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const storedUser = localStorage.getItem('user');
  
  // If we don't have all required items, return null
  if (!accessToken || !refreshToken || !storedUser) {
    return null;
  }
  
  try {
    // Check if access token is expired
    const decoded = jwtDecode(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (decoded.exp && decoded.exp > currentTime) {
      // Token is valid, restore user
      return JSON.parse(storedUser);
    } else {
      // Token expired, clear storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return null;
    }
  } catch (error) {
    console.error('Failed to validate tokens:', error);
    // Clear corrupted data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialAuthState);

  const login = (auth: AuthResponse) => {
    localStorage.setItem('access_token', auth.access_token);
    localStorage.setItem('refresh_token', auth.refresh_token);
    
    try {
      const decoded: Record<string, unknown> = jwtDecode(auth.access_token);
      const userData: User = {
        id: Number(decoded.id) || 1,
        name: String(decoded.name) || 'Admin User',
        email: String(decoded.email) || 'admin@tele-gateway.com',
        role: (decoded.role as Role) || 'Admin',
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e: unknown) {
      console.error('Failed to decode token', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/api/login';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

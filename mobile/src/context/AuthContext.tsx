import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser = await SecureStore.getItemAsync('user');
        
        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Add default role if missing for legacy data
            if (!parsedUser.role) {
              parsedUser.role = 'user';
            }
            setToken(storedToken);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Failed to parse user data, clearing storage', parseError);
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
          }
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const login = async (newToken: string, userData: User) => {
    await SecureStore.setItemAsync('token', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

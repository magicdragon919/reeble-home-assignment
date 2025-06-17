import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../api/apiClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // The apiClient already has the interceptor to add the token header
          const response = await apiClient.get<User>('/api/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Session expired or token is invalid", error);
          logout(); // Clear invalid token
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', pass);

    const response = await apiClient.post('/api/token', formData);
    const { access_token } = response.data;
    
    localStorage.setItem('accessToken', access_token);
    setToken(access_token);
    
    // After setting the token, the useEffect will trigger to fetch the user
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
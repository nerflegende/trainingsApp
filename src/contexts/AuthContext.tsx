import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userData: User | null;
  loading: boolean;
  register: (email: string, password: string, username: string, userData: Partial<User>) => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const user = await api.getMe();
          const userData: User = {
            id: user.id,
            username: user.username,
            email: user.email,
            gender: user.gender,
            birthdate: user.birthdate,
            bodyWeight: user.bodyWeight,
            bodyHeight: user.bodyHeight,
            weeklyGoal: user.weeklyGoal,
            stepGoal: user.stepGoal,
            palValue: user.palValue,
            darkMode: user.darkMode,
            colorScheme: (user.colorScheme as User['colorScheme']) || 'red',
            createdAt: new Date(user.createdAt)
          };
          setCurrentUser(userData);
          setUserData(userData);
        } catch {
          api.logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  async function register(email: string, password: string, username: string, additionalData: Partial<User>) {
    const result = await api.register({
      email,
      password,
      username,
      gender: additionalData.gender,
      birthdate: additionalData.birthdate,
      bodyWeight: additionalData.bodyWeight,
      bodyHeight: additionalData.bodyHeight,
      weeklyGoal: additionalData.weeklyGoal,
      darkMode: additionalData.darkMode,
      colorScheme: additionalData.colorScheme
    });

    const userData: User = {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      gender: result.user.gender,
      birthdate: result.user.birthdate,
      bodyWeight: result.user.bodyWeight,
      bodyHeight: result.user.bodyHeight,
      weeklyGoal: result.user.weeklyGoal,
      stepGoal: result.user.stepGoal,
      palValue: result.user.palValue,
      darkMode: result.user.darkMode,
      colorScheme: (result.user.colorScheme as User['colorScheme']) || 'red',
      createdAt: new Date(result.user.createdAt)
    };

    setCurrentUser(userData);
    setUserData(userData);
  }

  async function login(emailOrUsername: string, password: string) {
    const result = await api.login(emailOrUsername, password);

    const userData: User = {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      gender: result.user.gender,
      birthdate: result.user.birthdate,
      bodyWeight: result.user.bodyWeight,
      bodyHeight: result.user.bodyHeight,
      weeklyGoal: result.user.weeklyGoal,
      stepGoal: result.user.stepGoal,
      palValue: result.user.palValue,
      darkMode: result.user.darkMode,
      colorScheme: (result.user.colorScheme as User['colorScheme']) || 'red',
      createdAt: new Date(result.user.createdAt)
    };

    setCurrentUser(userData);
    setUserData(userData);
  }

  async function logout() {
    api.logout();
    setCurrentUser(null);
    setUserData(null);
  }

  async function updateUserData(data: Partial<User>) {
    if (!currentUser) return;

    await api.updateMe({
      bodyWeight: data.bodyWeight,
      bodyHeight: data.bodyHeight,
      weeklyGoal: data.weeklyGoal,
      darkMode: data.darkMode,
      birthdate: data.birthdate,
      gender: data.gender,
      stepGoal: data.stepGoal,
      palValue: data.palValue,
      colorScheme: data.colorScheme
    });
    
    if (userData) {
      const updatedUser = { ...userData, ...data };
      setUserData(updatedUser);
      setCurrentUser(updatedUser);
    }
  }

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import type { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(email: string, password: string, username: string, additionalData: Partial<User>) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newUser: User = {
      id: user.uid,
      username,
      email,
      bodyWeight: additionalData.bodyWeight,
      bodyHeight: additionalData.bodyHeight,
      weeklyGoal: additionalData.weeklyGoal || 3,
      darkMode: additionalData.darkMode ?? true,
      createdAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...newUser,
      createdAt: newUser.createdAt.toISOString()
    });

    setUserData(newUser);
  }

  async function login(emailOrUsername: string, password: string) {
    // Try to login with email directly
    await signInWithEmailAndPassword(auth, emailOrUsername, password);
  }

  async function logout() {
    await signOut(auth);
    setUserData(null);
  }

  async function updateUserData(data: Partial<User>) {
    if (!currentUser) return;

    await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
    
    if (userData) {
      setUserData({ ...userData, ...data });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            ...data,
            id: user.uid,
            createdAt: new Date(data.createdAt)
          } as User);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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

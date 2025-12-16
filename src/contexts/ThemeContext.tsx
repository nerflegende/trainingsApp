import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userData, updateUserData } = useAuth();
  
  // Initialize state from localStorage or userData
  const getInitialDarkMode = () => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return userData?.darkMode ?? true;
  };
  
  const [darkMode, setDarkModeState] = useState(getInitialDarkMode);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkModeState(newValue);
    if (userData) {
      updateUserData({ darkMode: newValue });
    }
  };

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    if (userData) {
      updateUserData({ darkMode: value });
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

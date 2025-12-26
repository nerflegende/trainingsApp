import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type ColorScheme = 'red' | 'blue' | 'purple' | 'orange' | 'green';

interface ThemeContextType {
  darkMode: boolean;
  colorScheme: ColorScheme;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  setColorScheme: (scheme: ColorScheme) => void;
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

  const getInitialColorScheme = (): ColorScheme => {
    const savedScheme = localStorage.getItem('colorScheme') as ColorScheme | null;
    if (savedScheme && ['red', 'blue', 'purple', 'orange', 'green'].includes(savedScheme)) {
      return savedScheme;
    }
    return (userData?.colorScheme as ColorScheme) ?? 'red';
  };
  
  const [darkMode, setDarkModeState] = useState(getInitialDarkMode);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialColorScheme);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Apply color scheme to document
    document.documentElement.setAttribute('data-theme', colorScheme);
    localStorage.setItem('colorScheme', colorScheme);
  }, [colorScheme]);

  // Sync with user data when it changes
  useEffect(() => {
    if (userData?.colorScheme) {
      setColorSchemeState(userData.colorScheme as ColorScheme);
    }
  }, [userData?.colorScheme]);

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

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (userData) {
      updateUserData({ colorScheme: scheme });
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, colorScheme, toggleDarkMode, setDarkMode, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const { darkMode } = useTheme();

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          darkMode 
            ? 'bg-dark border-dark-border text-white placeholder-gray-500' 
            : 'bg-white border-light-border text-gray-900 placeholder-gray-400'
        } ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

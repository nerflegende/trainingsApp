import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const { darkMode } = useTheme();

  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/30',
    secondary: darkMode 
      ? 'bg-dark-border hover:bg-gray-700 text-white' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: `border-2 border-primary text-primary hover:bg-primary hover:text-white`,
    ghost: darkMode 
      ? 'text-gray-300 hover:bg-dark-border hover:text-white' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

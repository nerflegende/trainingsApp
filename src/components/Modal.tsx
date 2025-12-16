import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div 
        className={`relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
          darkMode ? 'bg-dark-card' : 'bg-light-card'
        }`}
      >
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-4 border-b ${
            darkMode ? 'border-dark-border' : 'border-light-border'
          }`}>
            {title && (
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  darkMode 
                    ? 'hover:bg-dark-border text-gray-400 hover:text-white' 
                    : 'hover:bg-light-border text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

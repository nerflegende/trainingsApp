import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Calendar, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Navbar() {
  const { darkMode } = useTheme();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/training', icon: Dumbbell, label: 'Training' },
    { to: '/calendar', icon: Calendar, label: 'Kalender' },
    { to: '/profile', icon: User, label: 'Profil' }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border'} border-t z-50`}>
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-4 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`
            }
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { darkMode, setDarkMode } = useTheme();

  // Form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyHeight, setBodyHeight] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('3');
  const [selectedDarkMode, setSelectedDarkMode] = useState(true);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) return 'Passwort muss mindestens 6 Zeichen lang sein';
    if (!/[A-Z]/.test(pwd)) return 'Passwort muss einen Großbuchstaben enthalten';
    if (!/[a-z]/.test(pwd)) return 'Passwort muss einen Kleinbuchstaben enthalten';
    if (!/[0-9]/.test(pwd)) return 'Passwort muss eine Zahl enthalten';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Passwort muss ein Sonderzeichen enthalten';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        await register(email, password, username, {
          bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
          bodyHeight: bodyHeight ? parseFloat(bodyHeight) : undefined,
          weeklyGoal: parseInt(weeklyGoal),
          darkMode: selectedDarkMode
        });
        setDarkMode(selectedDarkMode);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode ? 'bg-dark' : 'bg-light'
    }`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${
        darkMode ? 'bg-dark-card' : 'bg-light-card'
      }`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Dumbbell size={32} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            TrainingsApp
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLogin ? 'Willkommen zurück!' : 'Erstelle deinen Account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              label="Nutzername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Dein Nutzername"
              required
            />
          )}

          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            required
          />

          <div className="relative">
            <Input
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLogin && (
            <>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Passwort muss enthalten: Großbuchstabe, Kleinbuchstabe, Zahl, Sonderzeichen, mind. 6 Zeichen
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Körpergewicht (kg)"
                  type="number"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  placeholder="75"
                  step="0.1"
                />
                <Input
                  label="Körpergröße (cm)"
                  type="number"
                  value={bodyHeight}
                  onChange={(e) => setBodyHeight(e.target.value)}
                  placeholder="180"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Trainingsziel (Tage pro Woche)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWeeklyGoal(String(num))}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                        weeklyGoal === String(num)
                          ? 'bg-primary text-white'
                          : darkMode
                          ? 'bg-dark-border text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  App-Design
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDarkMode(true)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      selectedDarkMode
                        ? 'bg-gray-900 text-white ring-2 ring-primary'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    🌙 Dunkel
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDarkMode(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      !selectedDarkMode
                        ? 'bg-white text-gray-900 ring-2 ring-primary'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    ☀️ Hell
                  </button>
                </div>
              </div>
            </>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Laden...' : isLogin ? 'Anmelden' : 'Registrieren'}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-primary transition-colors`}
          >
            {isLogin 
              ? 'Noch keinen Account? Jetzt registrieren' 
              : 'Bereits registriert? Jetzt anmelden'}
          </button>
        </div>
      </div>
    </div>
  );
}

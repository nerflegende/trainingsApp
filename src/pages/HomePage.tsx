import { useNavigate } from 'react-router-dom';
import { Play, Plus, Flame, Scale } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Button } from '../components/Button';

export function HomePage() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { darkMode } = useTheme();
  const { bodyMeasurements, calculateStreak, activeWorkout } = useWorkout();

  const lastWeight = bodyMeasurements.length > 0 ? bodyMeasurements[0].weight : userData?.bodyWeight;
  const streak = calculateStreak();

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`p-6 ${darkMode ? 'bg-dark-card' : 'bg-light-card'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Hallo, {userData?.username || 'Athlet'}! 👋
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Bereit für dein Training?
            </p>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full">
            <Flame size={24} className="text-yellow-300" />
            <span className="text-white font-bold text-lg">{streak}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <Button
            size="lg"
            fullWidth
            onClick={() => navigate('/training')}
            className="py-6"
          >
            <Play size={24} />
            {activeWorkout ? 'Training fortsetzen' : 'Training starten'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/profile', { state: { tab: 'plans' } })}
            className="py-6"
          >
            <Plus size={24} />
            Plan erstellen
          </Button>
        </div>

        {/* Weight Card */}
        <div
          onClick={() => navigate('/profile', { state: { tab: 'body' } })}
          className={`p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
            darkMode 
              ? 'bg-dark-card border border-dark-border hover:border-primary' 
              : 'bg-light-card border border-light-border hover:border-primary'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Scale size={24} className="text-primary" />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aktuelles Gewicht
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {lastWeight ? `${lastWeight} kg` : 'Nicht eingetragen'}
                </p>
              </div>
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Tippen zum Aktualisieren →
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className={`p-6 rounded-xl ${
          darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Wochenziel: {userData?.weeklyGoal || 3}x Training
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full ${
                  i < (userData?.weeklyGoal || 3)
                    ? 'bg-primary'
                    : darkMode
                    ? 'bg-dark-border'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {streak > 0 
              ? `🔥 ${streak} Woche${streak > 1 ? 'n' : ''} Streak!` 
              : 'Starte deine Streak noch heute!'}
          </p>
        </div>

        {/* Motivation Quote */}
        <div className={`p-6 rounded-xl bg-gradient-to-br from-primary to-primary-dark`}>
          <p className="text-white text-lg font-medium italic">
            "Die einzige schlechte Trainingseinheit ist die, die nicht stattgefunden hat."
          </p>
          <p className="text-white/70 text-sm mt-2">— Unbekannt</p>
        </div>
      </div>
    </div>
  );
}

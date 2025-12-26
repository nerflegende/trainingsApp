import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Scale, 
  Ruler, 
  Target, 
  Footprints,
  Calculator,
  LogOut,
  Save,
  Calendar,
  Edit2,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

type TabType = 'info' | 'body' | 'goals' | 'calories';

// Helper to calculate age from birthdate
function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function UserProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, updateUserData, logout } = useAuth();
  const { darkMode } = useTheme();
  const { addBodyMeasurement, bodyMeasurements } = useWorkout();

  const getInitialTab = (): TabType => {
    const state = location.state as { tab?: string } | undefined;
    if (state?.tab && ['info', 'body', 'goals', 'calories'].includes(state.tab)) {
      return state.tab as TabType;
    }
    return 'info';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Edit states
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newArms, setNewArms] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newLegs, setNewLegs] = useState('');
  const [newBirthdate, setNewBirthdate] = useState(userData?.birthdate || '');
  const [newWeeklyGoal, setNewWeeklyGoal] = useState(userData?.weeklyGoal || 3);
  const [newStepGoal, setNewStepGoal] = useState(userData?.stepGoal?.toString() || '10000');
  const [newPalValue, setNewPalValue] = useState(userData?.palValue || 1.4);

  // Calculate user age from birthdate
  const userAge = useMemo(() => {
    if (userData?.birthdate) {
      return calculateAge(userData.birthdate);
    }
    return null;
  }, [userData?.birthdate]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleAddMeasurement = async () => {
    const weight = newWeight ? parseFloat(newWeight) : undefined;
    const height = newHeight ? parseFloat(newHeight) : undefined;
    const bodyFat = newBodyFat ? parseFloat(newBodyFat) : undefined;
    const chest = newChest ? parseFloat(newChest) : undefined;
    const arms = newArms ? parseFloat(newArms) : undefined;
    const waist = newWaist ? parseFloat(newWaist) : undefined;
    const legs = newLegs ? parseFloat(newLegs) : undefined;
    
    if (weight || height || bodyFat || chest || arms || waist || legs) {
      await addBodyMeasurement({ weight, height, bodyFat, chest, arms, waist, legs });
      setNewWeight('');
      setNewHeight('');
      setNewBodyFat('');
      setNewChest('');
      setNewArms('');
      setNewWaist('');
      setNewLegs('');
      setShowAddMeasurement(false);
    }
  };

  const handleSaveGoals = async () => {
    await updateUserData({
      weeklyGoal: newWeeklyGoal,
      stepGoal: parseInt(newStepGoal) || 10000,
      birthdate: newBirthdate || undefined,
      palValue: newPalValue
    });
    setEditingField(null);
  };

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
  const calculateBMR = () => {
    const weight = bodyMeasurements[0]?.weight || userData?.bodyWeight;
    const height = bodyMeasurements[0]?.height || userData?.bodyHeight;
    const age = userAge;
    const gender = userData?.gender;
    
    if (!weight || !height || !age || !gender) return null;
    
    // Mifflin-St Jeor equation
    // Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
    // Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    return Math.round(bmr);
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr) return null;
    const pal = userData?.palValue || 1.4;
    return Math.round(bmr * pal);
  };

  const bmr = calculateBMR();
  const tdee = calculateTDEE();

  const palOptions = [
    { value: 1.2, label: 'Sitzend (wenig/keine Bewegung)' },
    { value: 1.4, label: 'Leicht aktiv (leichte Aktivität 1-3 Tage/Woche)' },
    { value: 1.6, label: 'Moderat aktiv (moderate Aktivität 3-5 Tage/Woche)' },
    { value: 1.75, label: 'Sehr aktiv (harte Aktivität 6-7 Tage/Woche)' },
    { value: 2.0, label: 'Extrem aktiv (sehr harte Aktivität, körperliche Arbeit)' }
  ];

  const tabs: { id: TabType; label: string; icon: typeof User }[] = [
    { id: 'info', label: 'Info', icon: User },
    { id: 'body', label: 'Körper', icon: Scale },
    { id: 'goals', label: 'Ziele', icon: Target },
    { id: 'calories', label: 'Kalorien', icon: Calculator }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-4">
            {/* Profile Picture Placeholder */}
            <div className="flex justify-center mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-dark-border' : 'bg-gray-200'
              }`}>
                <User size={48} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </div>
            </div>

            {/* User Info */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nutzername</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>E-Mail</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Geschlecht</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData?.gender === 'male' ? '♂️ Männlich' : userData?.gender === 'female' ? '♀️ Weiblich' : 'Nicht angegeben'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alter</p>
                    {editingField === 'birthdate' ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={newBirthdate}
                          onChange={(e) => setNewBirthdate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className={`flex-1 px-2 py-1 rounded ${
                            darkMode ? 'bg-dark-border text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        />
                        <button onClick={handleSaveGoals} className="text-green-500">
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingField(null)} className="text-red-500">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {userAge ? `${userAge} Jahre` : 'Nicht angegeben'}
                        </p>
                        <button onClick={() => {
                          setNewBirthdate(userData?.birthdate || '');
                          setEditingField('birthdate');
                        }}>
                          <Edit2 size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowPasswordModal(true)}
            >
              <Lock size={18} />
              Passwort ändern
            </Button>

            {/* Logout */}
            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Abmelden
            </Button>
          </div>
        );

      case 'body':
        // Get comparison data for body measurements
        const getComparisonData = () => {
          if (bodyMeasurements.length < 2) return null;
          
          const latest = bodyMeasurements[0];
          const oldest = bodyMeasurements[bodyMeasurements.length - 1];
          
          const compare = (current?: number, initial?: number) => {
            if (!current || !initial) return null;
            const diff = current - initial;
            return { current, initial, diff };
          };

          return {
            weight: compare(latest.weight, oldest.weight),
            bodyFat: compare(latest.bodyFat, oldest.bodyFat),
            chest: compare(latest.chest, oldest.chest),
            arms: compare(latest.arms, oldest.arms),
            waist: compare(latest.waist, oldest.waist),
            legs: compare(latest.legs, oldest.legs)
          };
        };

        const comparison = getComparisonData();

        const renderTrendIcon = (diff: number | null | undefined, invertColor = false) => {
          if (diff === null || diff === undefined) return null;
          const isPositive = invertColor ? diff < 0 : diff > 0;
          const isNegative = invertColor ? diff > 0 : diff < 0;
          if (isPositive) return <TrendingUp size={16} className="text-green-500" />;
          if (isNegative) return <TrendingDown size={16} className="text-red-500" />;
          return <Minus size={16} className="text-gray-400" />;
        };

        return (
          <div className="space-y-4">
            <Button fullWidth onClick={() => setShowAddMeasurement(true)}>
              <Scale size={20} />
              Neue Messung eintragen
            </Button>

            {/* Current Stats */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Aktuelle Werte
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Scale size={16} className="text-primary" />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gewicht</p>
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bodyMeasurements[0]?.weight || userData?.bodyWeight || '-'} kg
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler size={16} className="text-primary" />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Größe</p>
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bodyMeasurements[0]?.height || userData?.bodyHeight || '-'} cm
                  </p>
                </div>
                {bodyMeasurements[0]?.bodyFat && (
                  <div className={`p-4 rounded-lg col-span-2 ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Körperfett</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {bodyMeasurements[0].bodyFat} %
                    </p>
                  </div>
                )}
              </div>

              {/* Body circumferences */}
              {(bodyMeasurements[0]?.chest || bodyMeasurements[0]?.arms || bodyMeasurements[0]?.waist || bodyMeasurements[0]?.legs) && (
                <>
                  <h4 className={`font-medium mt-4 mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Umfänge (cm)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {bodyMeasurements[0]?.chest && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Brust</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {bodyMeasurements[0].chest}
                        </p>
                      </div>
                    )}
                    {bodyMeasurements[0]?.arms && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Arme</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {bodyMeasurements[0].arms}
                        </p>
                      </div>
                    )}
                    {bodyMeasurements[0]?.waist && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Taille</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {bodyMeasurements[0].waist}
                        </p>
                      </div>
                    )}
                    {bodyMeasurements[0]?.legs && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Beine</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {bodyMeasurements[0].legs}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Comparison - Before/After */}
            {comparison && (
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
              }`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Vergleich (Erste → Letzte Messung)
                </h3>
                <div className="space-y-3">
                  {comparison.weight && (
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Gewicht</span>
                      <div className="flex items-center gap-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {comparison.weight.initial} → {comparison.weight.current} kg
                        </span>
                        <span className={comparison.weight.diff < 0 ? 'text-green-500' : comparison.weight.diff > 0 ? 'text-red-500' : 'text-gray-500'}>
                          ({comparison.weight.diff > 0 ? '+' : ''}{comparison.weight.diff.toFixed(1)} kg)
                        </span>
                      </div>
                    </div>
                  )}
                  {comparison.bodyFat && (
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Körperfett</span>
                      <div className="flex items-center gap-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {comparison.bodyFat.initial} → {comparison.bodyFat.current} %
                        </span>
                        <span className={comparison.bodyFat.diff < 0 ? 'text-green-500' : comparison.bodyFat.diff > 0 ? 'text-red-500' : 'text-gray-500'}>
                          ({comparison.bodyFat.diff > 0 ? '+' : ''}{comparison.bodyFat.diff.toFixed(1)} %)
                        </span>
                        {renderTrendIcon(comparison.bodyFat.diff, true)}
                      </div>
                    </div>
                  )}
                  {comparison.chest && (
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Brust</span>
                      <div className="flex items-center gap-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {comparison.chest.initial} → {comparison.chest.current} cm
                        </span>
                        <span className={comparison.chest.diff > 0 ? 'text-green-500' : comparison.chest.diff < 0 ? 'text-red-500' : 'text-gray-500'}>
                          ({comparison.chest.diff > 0 ? '+' : ''}{comparison.chest.diff.toFixed(1)} cm)
                        </span>
                        {renderTrendIcon(comparison.chest.diff)}
                      </div>
                    </div>
                  )}
                  {comparison.arms && (
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Arme</span>
                      <div className="flex items-center gap-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {comparison.arms.initial} → {comparison.arms.current} cm
                        </span>
                        <span className={comparison.arms.diff > 0 ? 'text-green-500' : comparison.arms.diff < 0 ? 'text-red-500' : 'text-gray-500'}>
                          ({comparison.arms.diff > 0 ? '+' : ''}{comparison.arms.diff.toFixed(1)} cm)
                        </span>
                        {renderTrendIcon(comparison.arms.diff)}
                      </div>
                    </div>
                  )}
                  {comparison.waist && (
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Taille</span>
                      <div className="flex items-center gap-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {comparison.waist.initial} → {comparison.waist.current} cm
                        </span>
                        <span className={comparison.waist.diff < 0 ? 'text-green-500' : comparison.waist.diff > 0 ? 'text-red-500' : 'text-gray-500'}>
                          ({comparison.waist.diff > 0 ? '+' : ''}{comparison.waist.diff.toFixed(1)} cm)
                        </span>
                        {renderTrendIcon(comparison.waist.diff, true)}
                      </div>
                    </div>
                  )}
                  {comparison.legs && (
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Beine</span>
                      <div className="flex items-center gap-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {comparison.legs.initial} → {comparison.legs.current} cm
                        </span>
                        <span className={comparison.legs.diff > 0 ? 'text-green-500' : comparison.legs.diff < 0 ? 'text-red-500' : 'text-gray-500'}>
                          ({comparison.legs.diff > 0 ? '+' : ''}{comparison.legs.diff.toFixed(1)} cm)
                        </span>
                        {renderTrendIcon(comparison.legs.diff)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Measurement History */}
            {bodyMeasurements.length > 0 && (
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
              }`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Verlauf
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bodyMeasurements.slice(0, 20).map(m => (
                    <div
                      key={m.id}
                      className={`flex justify-between py-2 border-b ${
                        darkMode ? 'border-dark-border' : 'border-light-border'
                      } last:border-0`}
                    >
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {new Date(m.date).toLocaleDateString('de-DE')}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {m.weight && `${m.weight}kg`}
                        {m.bodyFat && ` • ${m.bodyFat}%`}
                        {m.chest && ` • B:${m.chest}`}
                        {m.arms && ` • A:${m.arms}`}
                        {m.waist && ` • T:${m.waist}`}
                        {m.legs && ` • L:${m.legs}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            {/* Weekly Training Goal */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-primary" />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Wöchentliches Trainingsziel
                </h3>
              </div>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Wie oft möchtest du pro Woche trainieren?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    onClick={async () => {
                      setNewWeeklyGoal(num);
                      await updateUserData({ weeklyGoal: num });
                    }}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      (userData?.weeklyGoal || 3) === num
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

            {/* Step Goal */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Footprints size={20} className="text-primary" />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tägliches Schrittziel
                </h3>
              </div>
              {editingField === 'steps' ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={newStepGoal}
                    onChange={(e) => setNewStepGoal(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg ${
                      darkMode ? 'bg-dark-border text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                    step="1000"
                  />
                  <button onClick={handleSaveGoals} className="p-2 bg-green-500 text-white rounded-lg">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-2 bg-red-500 text-white rounded-lg">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userData?.stepGoal?.toLocaleString() || '10.000'} Schritte
                  </p>
                  <button
                    onClick={() => {
                      setNewStepGoal(userData?.stepGoal?.toString() || '10000');
                      setEditingField('steps');
                    }}
                    className={`p-2 rounded-lg ${
                      darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Edit2 size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'calories':
        return (
          <div className="space-y-4">
            {/* PAL Value Selection */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Calculator size={20} className="text-primary" />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Aktivitätslevel (PAL-Wert)
                </h3>
              </div>
              <div className="space-y-2">
                {palOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={async () => {
                      setNewPalValue(option.value);
                      await updateUserData({ palValue: option.value });
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      (userData?.palValue || 1.4) === option.value
                        ? 'bg-primary text-white'
                        : darkMode
                        ? 'bg-dark-border text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <p className="font-medium">{option.value}</p>
                    <p className={`text-sm ${
                      (userData?.palValue || 1.4) === option.value ? 'text-white/70' : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie Calculation Results */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Dein Kalorienbedarf
              </h3>
              
              {bmr && tdee ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Grundumsatz (BMR)
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {bmr} kcal
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Kalorien, die dein Körper in Ruhe verbrennt
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg bg-primary/20`}>
                    <p className={`text-sm text-primary`}>
                      Gesamtumsatz (TDEE)
                    </p>
                    <p className={`text-3xl font-bold text-primary`}>
                      {tdee} kcal
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Täglicher Kalorienbedarf inkl. Aktivität
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                      <p className={`text-lg font-bold text-red-500`}>
                        {tdee - 500}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Abnehmen
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {tdee}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Halten
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                      <p className={`text-lg font-bold text-green-500`}>
                        {tdee + 300}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Aufbauen
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p className="mb-2">Um deinen Kalorienbedarf zu berechnen, benötigen wir:</p>
                  <ul className="text-sm space-y-1">
                    {!userData?.bodyWeight && !bodyMeasurements[0]?.weight && <li>• Gewicht</li>}
                    {!userData?.bodyHeight && !bodyMeasurements[0]?.height && <li>• Größe</li>}
                    {!userAge && <li>• Geburtsdatum</li>}
                    {!userData?.gender && <li>• Geschlecht</li>}
                  </ul>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('body')}
                  >
                    Daten eingeben
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`p-4 ${darkMode ? 'bg-dark-card' : 'bg-light-card'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
          </button>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Profil
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className={`sticky top-0 z-30 overflow-x-auto ${
        darkMode ? 'bg-dark-card border-b border-dark-border' : 'bg-light-card border-b border-light-border'
      }`}>
        <div className="flex min-w-max p-2 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : darkMode
                  ? 'text-gray-400 hover:bg-dark-border'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Add Measurement Modal */}
      <Modal
        isOpen={showAddMeasurement}
        onClose={() => setShowAddMeasurement(false)}
        title="Körpermaße eintragen"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Gewicht (kg)"
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="z.B. 75"
            step="0.1"
          />
          <Input
            label="Größe (cm)"
            type="number"
            value={newHeight}
            onChange={(e) => setNewHeight(e.target.value)}
            placeholder="z.B. 180"
          />
          <Input
            label="Körperfett (%)"
            type="number"
            value={newBodyFat}
            onChange={(e) => setNewBodyFat(e.target.value)}
            placeholder="z.B. 15"
            step="0.1"
          />
          <div className={`pt-2 border-t ${darkMode ? 'border-dark-border' : 'border-light-border'}`}>
            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Umfänge (cm)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Brust"
                type="number"
                value={newChest}
                onChange={(e) => setNewChest(e.target.value)}
                placeholder="z.B. 100"
                step="0.5"
              />
              <Input
                label="Arme"
                type="number"
                value={newArms}
                onChange={(e) => setNewArms(e.target.value)}
                placeholder="z.B. 35"
                step="0.5"
              />
              <Input
                label="Taille"
                type="number"
                value={newWaist}
                onChange={(e) => setNewWaist(e.target.value)}
                placeholder="z.B. 80"
                step="0.5"
              />
              <Input
                label="Beine"
                type="number"
                value={newLegs}
                onChange={(e) => setNewLegs(e.target.value)}
                placeholder="z.B. 55"
                step="0.5"
              />
            </div>
          </div>
          <Button fullWidth onClick={handleAddMeasurement}>
            <Save size={18} />
            Speichern
          </Button>
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Passwort ändern"
      >
        <div className="space-y-4">
          <Input
            label="Aktuelles Passwort"
            type="password"
            placeholder="••••••••"
          />
          <Input
            label="Neues Passwort"
            type="password"
            placeholder="••••••••"
          />
          <Input
            label="Passwort bestätigen"
            type="password"
            placeholder="••••••••"
          />
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Passwort muss enthalten: Großbuchstabe, Kleinbuchstabe, Zahl, Sonderzeichen, mind. 6 Zeichen
          </p>
          <Button fullWidth>
            Passwort ändern
          </Button>
        </div>
      </Modal>
    </div>
  );
}

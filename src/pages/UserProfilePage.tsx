import { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

type TabType = 'info' | 'body' | 'goals' | 'calories';

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
  const [newAge, setNewAge] = useState(userData?.age?.toString() || '');
  const [newWeeklyGoal, setNewWeeklyGoal] = useState(userData?.weeklyGoal || 3);
  const [newStepGoal, setNewStepGoal] = useState(userData?.stepGoal?.toString() || '10000');
  const [newPalValue, setNewPalValue] = useState(userData?.palValue || 1.4);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleAddMeasurement = async () => {
    const weight = newWeight ? parseFloat(newWeight) : undefined;
    const height = newHeight ? parseFloat(newHeight) : undefined;
    
    if (weight || height) {
      await addBodyMeasurement(weight, height);
      setNewWeight('');
      setNewHeight('');
      setShowAddMeasurement(false);
    }
  };

  const handleSaveGoals = async () => {
    await updateUserData({
      weeklyGoal: newWeeklyGoal,
      stepGoal: parseInt(newStepGoal) || 10000,
      age: parseInt(newAge) || undefined,
      palValue: newPalValue
    });
    setEditingField(null);
  };

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
  const calculateBMR = () => {
    const weight = bodyMeasurements[0]?.weight || userData?.bodyWeight;
    const height = bodyMeasurements[0]?.height || userData?.bodyHeight;
    const age = userData?.age;
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
                  <Calendar size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alter</p>
                    {editingField === 'age' ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={newAge}
                          onChange={(e) => setNewAge(e.target.value)}
                          className={`w-20 px-2 py-1 rounded ${
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
                          {userData?.age || 'Nicht angegeben'} {userData?.age && 'Jahre'}
                        </p>
                        <button onClick={() => {
                          setNewAge(userData?.age?.toString() || '');
                          setEditingField('age');
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
              </div>
            </div>

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
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {m.weight && `${m.weight} kg`}
                        {m.weight && m.height && ' • '}
                        {m.height && `${m.height} cm`}
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
                    {!userData?.age && <li>• Alter</li>}
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
        <div className="space-y-4">
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

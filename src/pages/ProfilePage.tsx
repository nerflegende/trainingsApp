import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Dumbbell, 
  Wrench, 
  Ruler, 
  Target, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  ChevronRight,
  Sun,
  Moon,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { defaultExercises, defaultGadgets } from '../data/defaultData';
import type { WorkoutDay, PlannedExercise, Exercise, Gadget } from '../types';
import { v4 as uuidv4 } from 'uuid';

type TabType = 'plans' | 'exercises' | 'gadgets' | 'body' | 'goal' | 'settings';

export function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, updateUserData, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { workoutPlans, savePlan, deletePlan, addBodyMeasurement, bodyMeasurements } = useWorkout();

  // Get initial tab from location state
  const getInitialTab = (): TabType => {
    const state = location.state as { tab?: string } | undefined;
    if (state?.tab && ['plans', 'exercises', 'gadgets', 'body', 'goal', 'settings'].includes(state.tab)) {
      return state.tab as TabType;
    }
    return 'plans';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [showGadgetDetail, setShowGadgetDetail] = useState<Gadget | null>(null);
  
  // Plan creation state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDays, setPlanDays] = useState<WorkoutDay[]>([{
    id: uuidv4(),
    name: 'Tag 1',
    exercises: []
  }]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showAddExerciseToPlan, setShowAddExerciseToPlan] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Body measurement state
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');

  // Settings state
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(userData?.weeklyGoal || 3);

  const tabs: { id: TabType; label: string; icon: typeof ClipboardList }[] = [
    { id: 'plans', label: 'Pläne', icon: ClipboardList },
    { id: 'exercises', label: 'Übungen', icon: Dumbbell },
    { id: 'gadgets', label: 'Gadgets', icon: Wrench },
    { id: 'body', label: 'Körpermaße', icon: Ruler },
    { id: 'goal', label: 'Ziel', icon: Target },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) return;

    await savePlan({
      name: planName,
      description: planDescription,
      days: planDays,
      isTemplate: false
    });

    setShowCreatePlan(false);
    setPlanName('');
    setPlanDescription('');
    setPlanDays([{ id: uuidv4(), name: 'Tag 1', exercises: [] }]);
    setCurrentDayIndex(0);
  };

  const addDayToPlan = () => {
    setPlanDays(prev => [
      ...prev,
      { id: uuidv4(), name: `Tag ${prev.length + 1}`, exercises: [] }
    ]);
    setCurrentDayIndex(planDays.length);
  };

  const removeDayFromPlan = (index: number) => {
    if (planDays.length <= 1) return;
    setPlanDays(prev => prev.filter((_, i) => i !== index));
    if (currentDayIndex >= planDays.length - 1) {
      setCurrentDayIndex(Math.max(0, planDays.length - 2));
    }
  };

  const updateDayName = (index: number, name: string) => {
    setPlanDays(prev => prev.map((day, i) => 
      i === index ? { ...day, name } : day
    ));
  };

  const addExerciseToPlan = (exercise: Exercise) => {
    const plannedExercise: PlannedExercise = {
      id: uuidv4(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      targetReps: 10,
      gadget: exercise.gadgets[0]
    };

    setPlanDays(prev => prev.map((day, i) => 
      i === currentDayIndex 
        ? { ...day, exercises: [...day.exercises, plannedExercise] }
        : day
    ));
    setShowAddExerciseToPlan(false);
    setExerciseSearch('');
  };

  const removeExerciseFromPlan = (exerciseId: string) => {
    setPlanDays(prev => prev.map((day, i) => 
      i === currentDayIndex 
        ? { ...day, exercises: day.exercises.filter(e => e.id !== exerciseId) }
        : day
    ));
  };

  const updatePlannedExercise = (exerciseId: string, updates: Partial<PlannedExercise>) => {
    setPlanDays(prev => prev.map((day, i) => 
      i === currentDayIndex 
        ? { 
            ...day, 
            exercises: day.exercises.map(e => 
              e.id === exerciseId ? { ...e, ...updates } : e
            ) 
          }
        : day
    ));
  };

  const handleAddMeasurement = async () => {
    const weight = newWeight ? parseFloat(newWeight) : undefined;
    const height = newHeight ? parseFloat(newHeight) : undefined;
    
    if (weight || height) {
      await addBodyMeasurement(weight, height);
      setNewWeight('');
      setNewHeight('');
      setShowAddWeight(false);
    }
  };

  const handleSaveGoal = async () => {
    await updateUserData({ weeklyGoal: newGoal });
    setEditingGoal(false);
  };

  const filteredExercises = defaultExercises.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    ex.muscles.some(m => m.toLowerCase().includes(exerciseSearch.toLowerCase()))
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'plans':
        return (
          <div className="space-y-4">
            <Button fullWidth onClick={() => setShowCreatePlan(true)}>
              <Plus size={20} />
              Neuen Plan erstellen
            </Button>

            {workoutPlans.length === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                <p>Noch keine Pläne erstellt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutPlans.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl ${
                      darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {plan.days.length} Tag(e) • {plan.days.reduce((acc, d) => acc + d.exercises.length, 0)} Übungen
                        </p>
                      </div>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className={`p-2 rounded-full ${
                          darkMode ? 'hover:bg-dark-border text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'exercises':
        return (
          <div className="space-y-3">
            {defaultExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => setShowExerciseDetail(exercise)}
                className={`w-full p-4 rounded-xl text-left flex justify-between items-center ${
                  darkMode ? 'bg-dark-card border border-dark-border hover:border-primary' : 'bg-light-card border border-light-border hover:border-primary'
                }`}
              >
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {exercise.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exercise.muscles.slice(0, 3).join(', ')}
                  </p>
                </div>
                <ChevronRight size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            ))}
          </div>
        );

      case 'gadgets':
        return (
          <div className="space-y-3">
            {defaultGadgets.map(gadget => (
              <button
                key={gadget.id}
                onClick={() => setShowGadgetDetail(gadget)}
                className={`w-full p-4 rounded-xl text-left flex justify-between items-center ${
                  darkMode ? 'bg-dark-card border border-dark-border hover:border-primary' : 'bg-light-card border border-light-border hover:border-primary'
                }`}
              >
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {gadget.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {gadget.description}
                  </p>
                </div>
                <ChevronRight size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            ))}
          </div>
        );

      case 'body':
        return (
          <div className="space-y-4">
            <Button fullWidth onClick={() => setShowAddWeight(true)}>
              <Plus size={20} />
              Messung eintragen
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
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gewicht
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bodyMeasurements[0]?.weight || userData?.bodyWeight || '-'} kg
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Größe
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bodyMeasurements[0]?.height || userData?.bodyHeight || '-'} cm
                  </p>
                </div>
              </div>
            </div>

            {/* History */}
            {bodyMeasurements.length > 0 && (
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
              }`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Verlauf
                </h3>
                <div className="space-y-2">
                  {bodyMeasurements.slice(0, 10).map(m => (
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

      case 'goal':
        return (
          <div className={`p-6 rounded-xl ${
            darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Wöchentliches Trainingsziel
              </h3>
              {!editingGoal ? (
                <button
                  onClick={() => {
                    setNewGoal(userData?.weeklyGoal || 3);
                    setEditingGoal(true);
                  }}
                  className={`p-2 rounded-full ${
                    darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'
                  }`}
                >
                  <Edit2 size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGoal}
                    className="p-2 rounded-full bg-green-500/20 text-green-500"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setEditingGoal(false)}
                    className="p-2 rounded-full bg-red-500/20 text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {editingGoal ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    onClick={() => setNewGoal(num)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      newGoal === num
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
            ) : (
              <div className="text-center">
                <p className={`text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userData?.weeklyGoal || 3}x
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Trainingseinheiten pro Woche
                </p>
              </div>
            )}

            <p className={`text-sm mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Deine Streak wird basierend auf diesem Ziel berechnet
            </p>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className={`p-4 rounded-xl flex justify-between items-center ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-yellow-500" />}
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {darkMode ? 'Dunkelmodus' : 'Hellmodus'}
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  darkMode ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* User Info */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Account
              </h3>
              <div className="space-y-2">
                <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>Nutzername</span>
                  <span className="font-medium">{userData?.username}</span>
                </div>
                <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>E-Mail</span>
                  <span className="font-medium">{userData?.email}</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <Button
              fullWidth
              variant="danger"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Abmelden
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`p-6 ${darkMode ? 'bg-dark-card' : 'bg-light-card'}`}>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Profil
        </h1>
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

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreatePlan}
        onClose={() => setShowCreatePlan(false)}
        title="Neuen Plan erstellen"
      >
        <div className="space-y-4">
          <Input
            label="Planname"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="z.B. Push Pull Legs"
          />
          <Input
            label="Beschreibung (optional)"
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            placeholder="z.B. 3er Split für Muskelaufbau"
          />

          {/* Days */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Trainingstage
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {planDays.map((day, index) => (
                <button
                  key={day.id}
                  onClick={() => setCurrentDayIndex(index)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentDayIndex === index
                      ? 'bg-primary text-white'
                      : darkMode
                      ? 'bg-dark-border text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.name}
                </button>
              ))}
              <button
                onClick={addDayToPlan}
                className={`px-3 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-dark-border text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Current Day */}
            {planDays[currentDayIndex] && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <Input
                    value={planDays[currentDayIndex].name}
                    onChange={(e) => updateDayName(currentDayIndex, e.target.value)}
                    className="text-sm"
                  />
                  {planDays.length > 1 && (
                    <button
                      onClick={() => removeDayFromPlan(currentDayIndex)}
                      className="p-2 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Exercises */}
                <div className="space-y-2 mb-3">
                  {planDays[currentDayIndex].exercises.map(ex => (
                    <div
                      key={ex.id}
                      className={`p-3 rounded-lg flex justify-between items-center ${
                        darkMode ? 'bg-dark' : 'bg-white'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {ex.exerciseName}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updatePlannedExercise(ex.id, { sets: parseInt(e.target.value) || 1 })}
                            className={`w-12 px-2 py-1 text-xs rounded ${
                              darkMode ? 'bg-dark-border text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                            min="1"
                          />
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Sätze
                          </span>
                          <input
                            type="number"
                            value={ex.targetReps}
                            onChange={(e) => updatePlannedExercise(ex.id, { targetReps: parseInt(e.target.value) || 1 })}
                            className={`w-12 px-2 py-1 text-xs rounded ${
                              darkMode ? 'bg-dark-border text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                            min="1"
                          />
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Wdh.
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExerciseFromPlan(ex.id)}
                        className="p-1 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowAddExerciseToPlan(true)}
                >
                  <Plus size={16} />
                  Übung hinzufügen
                </Button>
              </div>
            )}
          </div>

          <Button fullWidth onClick={handleSavePlan} disabled={!planName.trim()}>
            Plan speichern
          </Button>
        </div>
      </Modal>

      {/* Add Exercise to Plan Modal */}
      <Modal
        isOpen={showAddExerciseToPlan}
        onClose={() => {
          setShowAddExerciseToPlan(false);
          setExerciseSearch('');
        }}
        title="Übung hinzufügen"
      >
        <div className="space-y-4">
          <Input
            placeholder="Übung suchen..."
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
          />
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {filteredExercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => addExerciseToPlan(ex)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  darkMode 
                    ? 'bg-dark-border hover:bg-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {ex.name}
                </h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ex.muscles.join(', ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Add Weight Modal */}
      <Modal
        isOpen={showAddWeight}
        onClose={() => setShowAddWeight(false)}
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
            Speichern
          </Button>
        </div>
      </Modal>

      {/* Exercise Detail Modal */}
      <Modal
        isOpen={showExerciseDetail !== null}
        onClose={() => setShowExerciseDetail(null)}
        title={showExerciseDetail?.name}
      >
        {showExerciseDetail && (
          <div className="space-y-4">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {showExerciseDetail.description}
            </p>
            <div>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Beanspruchte Muskeln
              </h4>
              <div className="flex flex-wrap gap-2">
                {showExerciseDetail.muscles.map(muscle => (
                  <span
                    key={muscle}
                    className="px-3 py-1 rounded-full text-sm bg-primary/20 text-primary"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            {showExerciseDetail.gadgets.length > 0 && (
              <div>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Benötigte Geräte
                </h4>
                <div className="flex flex-wrap gap-2">
                  {showExerciseDetail.gadgets.map(gadget => (
                    <span
                      key={gadget}
                      className={`px-3 py-1 rounded-full text-sm ${
                        darkMode ? 'bg-dark-border text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {gadget}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Gadget Detail Modal */}
      <Modal
        isOpen={showGadgetDetail !== null}
        onClose={() => setShowGadgetDetail(null)}
        title={showGadgetDetail?.name}
      >
        {showGadgetDetail && (
          <div>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {showGadgetDetail.description}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

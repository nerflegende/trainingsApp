import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ClipboardList, 
  Dumbbell, 
  Wrench, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Github,
  Copy,
  Edit2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { defaultExercises, defaultGadgets, defaultWorkoutPlans } from '../data/defaultData';
import type { WorkoutDay, PlannedExercise, Exercise, Gadget } from '../types';
import { v4 as uuidv4 } from 'uuid';

type TabType = 'plans' | 'exercises' | 'gadgets' | 'settings';
type ColorScheme = 'red' | 'blue' | 'purple' | 'orange' | 'green';

export function SettingsPage() {
  const location = useLocation();
  const { darkMode, toggleDarkMode, colorScheme, setColorScheme } = useTheme();
  const { workoutPlans, savePlan, deletePlan, customExercises, customGadgets, addCustomExercise, addCustomGadget, updateCustomExercise, deleteCustomExercise, updateCustomGadget, deleteCustomGadget } = useWorkout();

  // Get initial tab from location state
  const getInitialTab = (): TabType => {
    const state = location.state as { tab?: string } | undefined;
    if (state?.tab && ['plans', 'exercises', 'gadgets', 'settings'].includes(state.tab)) {
      return state.tab as TabType;
    }
    return 'plans';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [showGadgetDetail, setShowGadgetDetail] = useState<Gadget | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showAddGadget, setShowAddGadget] = useState(false);
  
  // Custom exercise state
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseMuscles, setNewExerciseMuscles] = useState('');
  const [newExerciseGadgets, setNewExerciseGadgets] = useState('');
  
  // Custom gadget state
  const [newGadgetName, setNewGadgetName] = useState('');
  const [newGadgetDescription, setNewGadgetDescription] = useState('');
  
  // Edit exercise state
  const [showEditExercise, setShowEditExercise] = useState<Exercise | null>(null);
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editExerciseDescription, setEditExerciseDescription] = useState('');
  const [editExerciseMuscles, setEditExerciseMuscles] = useState('');
  const [editExerciseGadgets, setEditExerciseGadgets] = useState('');
  
  // Edit gadget state
  const [showEditGadget, setShowEditGadget] = useState<Gadget | null>(null);
  const [editGadgetName, setEditGadgetName] = useState('');
  const [editGadgetDescription, setEditGadgetDescription] = useState('');
  
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
  
  // Combine default and custom exercises/gadgets
  const allExercises = [...defaultExercises, ...customExercises];

  const tabs: { id: TabType; label: string; icon: typeof ClipboardList }[] = [
    { id: 'plans', label: 'Pläne', icon: ClipboardList },
    { id: 'exercises', label: 'Übungen', icon: Dumbbell },
    { id: 'gadgets', label: 'Gadgets', icon: Wrench },
    { id: 'settings', label: 'App', icon: Settings }
  ];

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

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    ex.muscles.some(m => m.toLowerCase().includes(exerciseSearch.toLowerCase()))
  );

  const handleCopyTemplate = async (templateId: string) => {
    const template = defaultWorkoutPlans.find(t => t.id === templateId);
    if (!template) return;
    
    await savePlan({
      name: template.name,
      description: template.description,
      days: template.days.map(day => ({
        id: uuidv4(),
        name: day.name,
        exercises: day.exercises.map(ex => ({
          ...ex,
          id: uuidv4()
        }))
      })),
      isTemplate: false
    });
    setShowTemplates(false);
  };

  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim()) return;
    
    const muscles = newExerciseMuscles.split(',').map(m => m.trim()).filter(m => m);
    const gadgets = newExerciseGadgets.split(',').map(g => g.trim()).filter(g => g);
    
    await addCustomExercise({
      name: newExerciseName,
      description: newExerciseDescription,
      muscles,
      gadgets
    });
    
    setNewExerciseName('');
    setNewExerciseDescription('');
    setNewExerciseMuscles('');
    setNewExerciseGadgets('');
    setShowAddExercise(false);
  };

  const handleAddCustomGadget = async () => {
    if (!newGadgetName.trim()) return;
    
    await addCustomGadget({
      name: newGadgetName,
      description: newGadgetDescription
    });
    
    setNewGadgetName('');
    setNewGadgetDescription('');
    setShowAddGadget(false);
  };

  const openEditExercise = (exercise: Exercise) => {
    setShowExerciseDetail(null);
    setEditExerciseName(exercise.name);
    setEditExerciseDescription(exercise.description);
    setEditExerciseMuscles(exercise.muscles.join(', '));
    setEditExerciseGadgets(exercise.gadgets.join(', '));
    setShowEditExercise(exercise);
  };

  const handleUpdateCustomExercise = async () => {
    if (!showEditExercise || !editExerciseName.trim()) return;
    
    const muscles = editExerciseMuscles.split(',').map(m => m.trim()).filter(m => m);
    const gadgets = editExerciseGadgets.split(',').map(g => g.trim()).filter(g => g);
    
    await updateCustomExercise(showEditExercise.id, {
      name: editExerciseName,
      description: editExerciseDescription,
      muscles,
      gadgets
    });
    
    setShowEditExercise(null);
    setEditExerciseName('');
    setEditExerciseDescription('');
    setEditExerciseMuscles('');
    setEditExerciseGadgets('');
  };

  const handleDeleteCustomExercise = async (exercise: Exercise) => {
    setShowExerciseDetail(null);
    await deleteCustomExercise(exercise.id);
  };

  const openEditGadget = (gadget: Gadget) => {
    setShowGadgetDetail(null);
    setEditGadgetName(gadget.name);
    setEditGadgetDescription(gadget.description);
    setShowEditGadget(gadget);
  };

  const handleUpdateCustomGadget = async () => {
    if (!showEditGadget || !editGadgetName.trim()) return;
    
    await updateCustomGadget(showEditGadget.id, {
      name: editGadgetName,
      description: editGadgetDescription
    });
    
    setShowEditGadget(null);
    setEditGadgetName('');
    setEditGadgetDescription('');
  };

  const handleDeleteCustomGadget = async (gadget: Gadget) => {
    setShowGadgetDetail(null);
    await deleteCustomGadget(gadget.id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'plans':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button fullWidth onClick={() => setShowCreatePlan(true)}>
                <Plus size={20} />
                Neuer Plan
              </Button>
              <Button fullWidth variant="outline" onClick={() => setShowTemplates(true)}>
                <Copy size={20} />
                Vorlagen
              </Button>
            </div>

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
            <Button fullWidth variant="outline" onClick={() => setShowAddExercise(true)}>
              <Plus size={20} />
              Übung hinzufügen
            </Button>
            
            {customExercises.length > 0 && (
              <>
                <h3 className={`font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Eigene Übungen
                </h3>
                {customExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => setShowExerciseDetail(exercise)}
                    className={`w-full p-4 rounded-xl text-left flex justify-between items-center ${
                      darkMode ? 'bg-primary/20 border border-primary/40 hover:border-primary' : 'bg-primary/10 border border-primary/30 hover:border-primary'
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
              </>
            )}
            
            <h3 className={`font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Standard Übungen
            </h3>
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
            <Button fullWidth variant="outline" onClick={() => setShowAddGadget(true)}>
              <Plus size={20} />
              Gadget hinzufügen
            </Button>
            
            {customGadgets.length > 0 && (
              <>
                <h3 className={`font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Eigene Gadgets
                </h3>
                {customGadgets.map(gadget => (
                  <button
                    key={gadget.id}
                    onClick={() => setShowGadgetDetail(gadget)}
                    className={`w-full p-4 rounded-xl text-left flex justify-between items-center ${
                      darkMode ? 'bg-primary/20 border border-primary/40 hover:border-primary' : 'bg-primary/10 border border-primary/30 hover:border-primary'
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
              </>
            )}
            
            <h3 className={`font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Standard Gadgets
            </h3>
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

      case 'settings':
        const colorSchemes: { id: ColorScheme; name: string; color: string }[] = [
          { id: 'red', name: 'Rot', color: '#dc2626' },
          { id: 'blue', name: 'Blau', color: '#1e40af' },
          { id: 'purple', name: 'Lila', color: '#7c3aed' },
          { id: 'orange', name: 'Orange', color: '#c2410c' },
          { id: 'green', name: 'Grün', color: '#15803d' }
        ];

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

            {/* Color Scheme */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Farbschema
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {colorSchemes.map(scheme => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      colorScheme === scheme.id
                        ? 'ring-2 ring-offset-2 ring-offset-dark-card'
                        : darkMode
                        ? 'hover:bg-dark-border'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{ 
                      ['--tw-ring-color' as string]: colorScheme === scheme.id ? scheme.color : undefined 
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: scheme.color }}
                    />
                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {scheme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Links
              </h3>
              <div className="space-y-3">
                <a
                  href="https://ricek.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>Developer Website</span>
                  <ExternalLink size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </a>
                <a
                  href="https://github.com/nerflegende"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Github size={18} className={darkMode ? 'text-white' : 'text-gray-900'} />
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>GitHub</span>
                  </div>
                  <ExternalLink size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </a>
              </div>
            </div>

            {/* App Info */}
            <div className={`p-4 rounded-xl text-center ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                TrainingsApp v1.0.0
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Made with ❤️ for fitness enthusiasts
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`p-6 ${darkMode ? 'bg-dark-card' : 'bg-light-card'}`}>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Einstellungen
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
            {/* Edit and Delete buttons for custom exercises */}
            {showExerciseDetail.isCustom && (
              <div className="flex gap-3 pt-4 border-t border-dark-border">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => openEditExercise(showExerciseDetail)}
                >
                  <Edit2 size={16} />
                  Bearbeiten
                </Button>
                <Button
                  fullWidth
                  variant="danger"
                  onClick={() => handleDeleteCustomExercise(showExerciseDetail)}
                >
                  <Trash2 size={16} />
                  Löschen
                </Button>
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
          <div className="space-y-4">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {showGadgetDetail.description}
            </p>
            {/* Edit and Delete buttons for custom gadgets */}
            {showGadgetDetail.isCustom && (
              <div className="flex gap-3 pt-4 border-t border-dark-border">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => openEditGadget(showGadgetDetail)}
                >
                  <Edit2 size={16} />
                  Bearbeiten
                </Button>
                <Button
                  fullWidth
                  variant="danger"
                  onClick={() => handleDeleteCustomGadget(showGadgetDetail)}
                >
                  <Trash2 size={16} />
                  Löschen
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Planvorlagen"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {defaultWorkoutPlans.map(template => (
            <div
              key={template.id}
              className={`p-4 rounded-lg ${
                darkMode ? 'bg-dark-border' : 'bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {template.description}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {template.days.length} Tag(e) • {template.days.reduce((acc, d) => acc + d.exercises.length, 0)} Übungen
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCopyTemplate(template.id)}
                >
                  <Copy size={16} />
                  Kopieren
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={showAddExercise}
        onClose={() => {
          setShowAddExercise(false);
          setNewExerciseName('');
          setNewExerciseDescription('');
          setNewExerciseMuscles('');
          setNewExerciseGadgets('');
        }}
        title="Neue Übung erstellen"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="z.B. Kurzhantel Schulterdrücken"
            required
          />
          <Input
            label="Beschreibung"
            value={newExerciseDescription}
            onChange={(e) => setNewExerciseDescription(e.target.value)}
            placeholder="Kurze Beschreibung der Übung"
          />
          <Input
            label="Muskeln (kommagetrennt)"
            value={newExerciseMuscles}
            onChange={(e) => setNewExerciseMuscles(e.target.value)}
            placeholder="z.B. Schultern, Trizeps"
          />
          <Input
            label="Gadgets (kommagetrennt)"
            value={newExerciseGadgets}
            onChange={(e) => setNewExerciseGadgets(e.target.value)}
            placeholder="z.B. Kurzhanteln"
          />
          <Button fullWidth onClick={handleAddCustomExercise} disabled={!newExerciseName.trim()}>
            Übung erstellen
          </Button>
        </div>
      </Modal>

      {/* Add Gadget Modal */}
      <Modal
        isOpen={showAddGadget}
        onClose={() => {
          setShowAddGadget(false);
          setNewGadgetName('');
          setNewGadgetDescription('');
        }}
        title="Neues Gadget erstellen"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newGadgetName}
            onChange={(e) => setNewGadgetName(e.target.value)}
            placeholder="z.B. TRX-Band"
            required
          />
          <Input
            label="Beschreibung"
            value={newGadgetDescription}
            onChange={(e) => setNewGadgetDescription(e.target.value)}
            placeholder="Kurze Beschreibung des Gadgets"
          />
          <Button fullWidth onClick={handleAddCustomGadget} disabled={!newGadgetName.trim()}>
            Gadget erstellen
          </Button>
        </div>
      </Modal>

      {/* Edit Exercise Modal */}
      <Modal
        isOpen={showEditExercise !== null}
        onClose={() => {
          setShowEditExercise(null);
          setEditExerciseName('');
          setEditExerciseDescription('');
          setEditExerciseMuscles('');
          setEditExerciseGadgets('');
        }}
        title="Übung bearbeiten"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={editExerciseName}
            onChange={(e) => setEditExerciseName(e.target.value)}
            placeholder="z.B. Kurzhantel Schulterdrücken"
            required
          />
          <Input
            label="Beschreibung"
            value={editExerciseDescription}
            onChange={(e) => setEditExerciseDescription(e.target.value)}
            placeholder="Kurze Beschreibung der Übung"
          />
          <Input
            label="Muskeln (kommagetrennt)"
            value={editExerciseMuscles}
            onChange={(e) => setEditExerciseMuscles(e.target.value)}
            placeholder="z.B. Schultern, Trizeps"
          />
          <Input
            label="Gadgets (kommagetrennt)"
            value={editExerciseGadgets}
            onChange={(e) => setEditExerciseGadgets(e.target.value)}
            placeholder="z.B. Kurzhanteln"
          />
          <Button fullWidth onClick={handleUpdateCustomExercise} disabled={!editExerciseName.trim()}>
            Änderungen speichern
          </Button>
        </div>
      </Modal>

      {/* Edit Gadget Modal */}
      <Modal
        isOpen={showEditGadget !== null}
        onClose={() => {
          setShowEditGadget(null);
          setEditGadgetName('');
          setEditGadgetDescription('');
        }}
        title="Gadget bearbeiten"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={editGadgetName}
            onChange={(e) => setEditGadgetName(e.target.value)}
            placeholder="z.B. TRX-Band"
            required
          />
          <Input
            label="Beschreibung"
            value={editGadgetDescription}
            onChange={(e) => setEditGadgetDescription(e.target.value)}
            placeholder="Kurze Beschreibung des Gadgets"
          />
          <Button fullWidth onClick={handleUpdateCustomGadget} disabled={!editGadgetName.trim()}>
            Änderungen speichern
          </Button>
        </div>
      </Modal>
    </div>
  );
}

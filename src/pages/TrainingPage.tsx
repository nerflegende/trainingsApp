import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Trash2, Edit2, ChevronDown, ChevronUp, Clock, Timer, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { defaultExercises, defaultGadgets } from '../data/defaultData';
import type { WorkoutPlan, WorkoutExercise, WorkoutRecord } from '../types';

export function TrainingPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const {
    activeWorkout,
    workoutPlans,
    startFreeWorkout,
    startPlanWorkout,
    addExerciseToWorkout,
    updateExercise,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    endWorkout,
    cancelWorkout
  } = useWorkout();

  const [showStartModal, setShowStartModal] = useState(false);
  const [showPlanSelect, setShowPlanSelect] = useState(false);
  const [showDaySelect, setShowDaySelect] = useState<WorkoutPlan | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showEndWorkout, setShowEndWorkout] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutRecord | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<{
    exercise: WorkoutExercise;
    field: 'reps' | 'weight' | 'gadget' | 'sets';
    setIndex?: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchExercise, setSearchExercise] = useState('');

  // Timer states - using refs to persist across renders and handle background
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [showRestSettings, setShowRestSettings] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const restStartRef = useRef<number | null>(null);
  const restElapsedRef = useRef(0);

  // Auto-expand first exercise when workout starts
  useEffect(() => {
    if (activeWorkout && activeWorkout.exercises.length > 0 && !expandedExercise) {
      setExpandedExercise(activeWorkout.exercises[0].id);
    }
  }, [activeWorkout, expandedExercise]);

  // Timer effect - uses performance.now() for accuracy even when backgrounded
  useEffect(() => {
    if (!activeWorkout) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      elapsedRef.current = 0;
    }

    const updateTimer = () => {
      if (startTimeRef.current !== null) {
        const now = performance.now();
        const totalElapsed = Math.floor((now - startTimeRef.current) / 1000) + elapsedRef.current;
        setElapsedTime(totalElapsed);
      }
    };

    const interval = setInterval(updateTimer, 1000);
    
    // Also update on visibility change to catch up
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeWorkout]);

  // Rest timer effect
  useEffect(() => {
    if (!restRunning || restRemaining <= 0) return;

    if (restStartRef.current === null) {
      restStartRef.current = performance.now();
      restElapsedRef.current = 0;
    }

    const updateRestTimer = () => {
      if (restStartRef.current !== null) {
        const now = performance.now();
        const elapsed = Math.floor((now - restStartRef.current) / 1000);
        const remaining = restTime - elapsed;
        
        if (remaining <= 0) {
          setRestRemaining(0);
          setRestRunning(false);
          restStartRef.current = null;
          // Vibrate when rest is done
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
        } else {
          setRestRemaining(remaining);
        }
      }
    };

    const interval = setInterval(updateRestTimer, 100);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateRestTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [restRunning, restRemaining, restTime]);

  const filteredExercises = defaultExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
    ex.muscles.some(m => m.toLowerCase().includes(searchExercise.toLowerCase()))
  );

  const handleStartFreeWorkout = () => {
    startFreeWorkout();
    setShowStartModal(false);
    startTimeRef.current = performance.now();
    elapsedRef.current = 0;
  };

  const handleSelectPlan = () => {
    setShowStartModal(false);
    setShowPlanSelect(true);
  };

  const handleSelectDay = (plan: WorkoutPlan, dayIndex: number) => {
    startPlanWorkout(plan, dayIndex);
    setShowDaySelect(null);
    setShowPlanSelect(false);
    startTimeRef.current = performance.now();
    elapsedRef.current = 0;
    // Auto-expand first exercise
    if (plan.days[dayIndex].exercises.length > 0) {
      // Will be set by useEffect
    }
  };

  const handleAddExercise = (exerciseId: string, exerciseName: string) => {
    addExerciseToWorkout(exerciseId, exerciseName);
    setShowAddExercise(false);
    setSearchExercise('');
  };

  const handleEndWorkout = async () => {
    const summary = await endWorkout();
    if (summary) {
      setWorkoutSummary(summary);
    }
    setShowEndWorkout(false);
    startTimeRef.current = null;
    elapsedRef.current = 0;
  };

  const handleCloseSummary = () => {
    setWorkoutSummary(null);
    navigate('/');
  };

  // Handle set completion - start rest timer and auto-expand next exercise
  const handleSetComplete = useCallback((exerciseId: string, setId: string, completed: boolean) => {
    updateSet(exerciseId, setId, { completed });
    
    if (completed && activeWorkout) {
      // Start rest timer
      setRestRemaining(restTime);
      setRestRunning(true);
      restStartRef.current = performance.now();
      
      // Check if this was the last set of the exercise
      const exerciseIndex = activeWorkout.exercises.findIndex(ex => ex.id === exerciseId);
      if (exerciseIndex !== -1) {
        const exercise = activeWorkout.exercises[exerciseIndex];
        const allSetsComplete = exercise.sets.every(s => s.id === setId ? completed : s.completed);
        
        if (allSetsComplete && exerciseIndex < activeWorkout.exercises.length - 1) {
          // Auto-expand next exercise
          setExpandedExercise(activeWorkout.exercises[exerciseIndex + 1].id);
        }
      }
    }
  }, [activeWorkout, restTime, updateSet]);

  const startRestTimer = () => {
    setRestRemaining(restTime);
    setRestRunning(true);
    restStartRef.current = performance.now();
  };

  const stopRestTimer = () => {
    setRestRunning(false);
    restStartRef.current = null;
  };

  const resetRestTimer = () => {
    setRestRemaining(restTime);
    setRestRunning(false);
    restStartRef.current = null;
  };

  const openEditModal = (
    exercise: WorkoutExercise,
    field: 'reps' | 'weight' | 'gadget' | 'sets',
    setIndex?: number
  ) => {
    setEditingExercise({ exercise, field, setIndex });
    if (field === 'reps' && setIndex !== undefined) {
      setEditValue(String(exercise.sets[setIndex]?.reps || 0));
    } else if (field === 'weight' && setIndex !== undefined) {
      setEditValue(String(exercise.sets[setIndex]?.weight || ''));
    } else if (field === 'gadget') {
      setEditValue(exercise.gadget || '');
    } else if (field === 'sets') {
      setEditValue(String(exercise.sets.length));
    }
  };

  const saveEdit = (valueOverride?: string) => {
    if (!editingExercise) return;
    const { exercise, field, setIndex } = editingExercise;
    const value = valueOverride !== undefined ? valueOverride : editValue;

    if (field === 'reps' && setIndex !== undefined) {
      updateSet(exercise.id, exercise.sets[setIndex].id, { reps: parseInt(value) || 0 });
    } else if (field === 'weight' && setIndex !== undefined) {
      updateSet(exercise.id, exercise.sets[setIndex].id, { weight: parseFloat(value) || undefined });
    } else if (field === 'gadget') {
      updateExercise(exercise.id, { gadget: value });
    } else if (field === 'sets') {
      const newSetsCount = parseInt(value) || 1;
      const currentSetsCount = exercise.sets.length;
      
      if (newSetsCount > currentSetsCount) {
        for (let i = 0; i < newSetsCount - currentSetsCount; i++) {
          addSet(exercise.id);
        }
      } else if (newSetsCount < currentSetsCount) {
        for (let i = currentSetsCount - 1; i >= newSetsCount; i--) {
          removeSet(exercise.id, exercise.sets[i].id);
        }
      }
    }

    setEditingExercise(null);
    setEditValue('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const restOptions = [30, 60, 90, 120, 180, 300];

  // If no active workout, show start options
  if (!activeWorkout) {
    return (
      <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className={`p-6 ${darkMode ? 'bg-dark-card' : 'bg-light-card'}`}>
          <h1 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Training
          </h1>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          <div className={`p-8 rounded-xl text-center ${
            darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
          }`}>
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play size={40} className="text-primary" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Kein aktives Training
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Starte ein Training, um deine Fortschritte zu tracken
            </p>
            <Button size="lg" onClick={() => setShowStartModal(true)}>
              <Play size={20} />
              Training starten
            </Button>
          </div>
        </div>

        {/* Start Modal */}
        <Modal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          title="Training starten"
        >
          <div className="space-y-4">
            <Button fullWidth variant="outline" onClick={handleSelectPlan}>
              📋 Plan auswählen
            </Button>
            <Button fullWidth onClick={handleStartFreeWorkout}>
              ✨ Freies Training
            </Button>
            <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Bei freiem Training werden keine Übungen vorgegeben
            </p>
          </div>
        </Modal>

        {/* Plan Select Modal */}
        <Modal
          isOpen={showPlanSelect}
          onClose={() => setShowPlanSelect(false)}
          title="Plan auswählen"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {workoutPlans.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="mb-4">Keine Pläne vorhanden</p>
                <Button variant="outline" onClick={() => navigate('/settings', { state: { tab: 'plans' } })}>
                  Plan erstellen
                </Button>
              </div>
            ) : (
              workoutPlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setShowDaySelect(plan)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'bg-dark-border hover:bg-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.days.length} Tag(e)
                  </p>
                </button>
              ))
            )}
          </div>
        </Modal>

        {/* Day Select Modal */}
        <Modal
          isOpen={showDaySelect !== null}
          onClose={() => setShowDaySelect(null)}
          title={showDaySelect?.name || 'Tag auswählen'}
        >
          <div className="space-y-3">
            {showDaySelect?.days.map((day, index) => (
              <button
                key={day.id}
                onClick={() => handleSelectDay(showDaySelect, index)}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  darkMode 
                    ? 'bg-dark-border hover:bg-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {day.name}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day.exercises.length} Übung(en)
                </p>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    );
  }

  // Active workout view
  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header with Timer */}
      <div className={`p-4 sticky top-0 z-40 ${darkMode ? 'bg-dark-card' : 'bg-light-card'} border-b ${
        darkMode ? 'border-dark-border' : 'border-light-border'
      }`}>
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeWorkout.planName || 'Freies Training'}
              </h1>
              {activeWorkout.dayName && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activeWorkout.dayName}
                </p>
              )}
            </div>
            
            {/* Timers */}
            <div className="flex items-center gap-2">
              {/* Elapsed Time */}
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                darkMode ? 'bg-dark-border' : 'bg-gray-200'
              }`}>
                <Clock size={16} className="text-primary" />
                <span className={`font-mono text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(elapsedTime)}
                </span>
              </div>
              
              {/* Rest Timer */}
              <div 
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer ${
                  restRemaining > 0 && restRunning
                    ? 'bg-primary animate-pulse'
                    : darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setShowRestSettings(true)}
              >
                <Timer size={16} className={restRemaining > 0 && restRunning ? 'text-white' : 'text-primary'} />
                <span className={`font-mono text-sm ${restRemaining > 0 && restRunning ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(restRunning ? restRemaining : restTime)}
                </span>
              </div>
              
              {/* Rest Timer Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => restRunning ? stopRestTimer() : startRestTimer()}
                  className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'}`}
                >
                  {restRunning ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={resetRestTimer}
                  className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'}`}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {activeWorkout.exercises.map((exercise) => (
          <div
            key={exercise.id}
            className={`rounded-xl overflow-hidden ${
              darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
            }`}
          >
            {/* Exercise Header */}
            <div
              className={`p-4 flex justify-between items-center cursor-pointer ${
                darkMode ? 'hover:bg-dark-border/50' : 'hover:bg-gray-100'
              }`}
              onClick={() => setExpandedExercise(
                expandedExercise === exercise.id ? null : exercise.id
              )}
            >
              <div className="flex-1">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {exercise.exerciseName}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} Sätze {exercise.gadget && `• ${exercise.gadget}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExercise(exercise.id);
                  }}
                  className={`p-2 rounded-full ${
                    darkMode ? 'hover:bg-dark-border text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Trash2 size={18} />
                </button>
                {expandedExercise === exercise.id ? (
                  <ChevronUp size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                ) : (
                  <ChevronDown size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedExercise === exercise.id && (
              <div className={`p-4 border-t ${darkMode ? 'border-dark-border' : 'border-light-border'}`}>
                {/* Gadget */}
                <div className="mb-4">
                  <button
                    onClick={() => openEditModal(exercise, 'gadget')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      darkMode 
                        ? 'bg-dark-border hover:bg-gray-700' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Edit2 size={14} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Gadget: {exercise.gadget || 'Keines'}
                    </span>
                  </button>
                </div>

                {/* Sets Table */}
                <div className={`rounded-lg overflow-hidden ${
                  darkMode ? 'bg-dark' : 'bg-gray-50'
                }`}>
                  <div className={`grid grid-cols-4 gap-2 p-3 text-xs font-semibold ${
                    darkMode ? 'bg-dark-border text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <span>Satz</span>
                    <span>Wdh.</span>
                    <span>Gewicht</span>
                    <span>✓</span>
                  </div>
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-4 gap-2 p-3 items-center border-t ${
                        darkMode ? 'border-dark-border' : 'border-gray-200'
                      } ${set.completed ? 'opacity-50' : ''}`}
                    >
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {set.setNumber}
                      </span>
                      <button
                        onClick={() => openEditModal(exercise, 'reps', setIndex)}
                        className={`px-2 py-1 rounded text-center ${
                          darkMode 
                            ? 'bg-dark-border hover:bg-gray-700 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                      >
                        {set.reps}
                      </button>
                      <button
                        onClick={() => openEditModal(exercise, 'weight', setIndex)}
                        className={`px-2 py-1 rounded text-center ${
                          darkMode 
                            ? 'bg-dark-border hover:bg-gray-700 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                      >
                        {set.weight ? `${set.weight}kg` : '-'}
                      </button>
                      <button
                        onClick={() => handleSetComplete(exercise.id, set.id, !set.completed)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          set.completed
                            ? 'bg-green-500 text-white'
                            : darkMode
                            ? 'bg-dark-border hover:bg-gray-700 text-gray-400'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        }`}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add/Remove Sets */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addSet(exercise.id)}
                  >
                    <Plus size={16} />
                    Satz hinzufügen
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Exercise Button */}
        <Button
          fullWidth
          variant="outline"
          onClick={() => setShowAddExercise(true)}
        >
          <Plus size={20} />
          Übung hinzufügen
        </Button>

        {/* End Workout Button */}
        <Button
          fullWidth
          variant="danger"
          onClick={() => setShowEndWorkout(true)}
          className="mt-8"
        >
          Training beenden
        </Button>
      </div>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={showAddExercise}
        onClose={() => {
          setShowAddExercise(false);
          setSearchExercise('');
        }}
        title="Übung hinzufügen"
      >
        <div className="space-y-4">
          <Input
            placeholder="Übung suchen..."
            value={searchExercise}
            onChange={(e) => setSearchExercise(e.target.value)}
          />
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {filteredExercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex.id, ex.name)}
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

      {/* Edit Modal */}
      <Modal
        isOpen={editingExercise !== null}
        onClose={() => {
          setEditingExercise(null);
          setEditValue('');
        }}
        title={
          editingExercise?.field === 'reps' ? 'Wiederholungen' :
          editingExercise?.field === 'weight' ? 'Gewicht (kg)' :
          editingExercise?.field === 'gadget' ? 'Gadget' :
          'Anzahl Sätze'
        }
      >
        {editingExercise?.field === 'gadget' ? (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditValue('');
                saveEdit('');
              }}
              className={`w-full p-3 rounded-lg text-left ${
                !editValue
                  ? 'bg-primary text-white'
                  : darkMode
                  ? 'bg-dark-border hover:bg-gray-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Keines
            </button>
            {defaultGadgets.map(gadget => (
              <button
                key={gadget.id}
                onClick={() => saveEdit(gadget.name)}
                className={`w-full p-3 rounded-lg text-left ${
                  editValue === gadget.name
                    ? 'bg-primary text-white'
                    : darkMode
                    ? 'bg-dark-border hover:bg-gray-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {gadget.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={
                editingExercise?.field === 'reps' ? 'z.B. 12' :
                editingExercise?.field === 'weight' ? 'z.B. 50' :
                'z.B. 3'
              }
              autoFocus
            />
            <Button fullWidth onClick={() => saveEdit()}>
              Speichern
            </Button>
          </div>
        )}
      </Modal>

      {/* Rest Timer Settings Modal */}
      <Modal
        isOpen={showRestSettings}
        onClose={() => setShowRestSettings(false)}
        title="Pausenzeit einstellen"
      >
        <div className="grid grid-cols-2 gap-3">
          {restOptions.map(seconds => (
            <button
              key={seconds}
              onClick={() => {
                setRestTime(seconds);
                if (!restRunning) {
                  setRestRemaining(seconds);
                }
                setShowRestSettings(false);
              }}
              className={`p-4 rounded-lg font-semibold transition-colors ${
                restTime === seconds
                  ? 'bg-primary text-white'
                  : darkMode
                  ? 'bg-dark-border hover:bg-gray-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {formatTime(seconds)}
            </button>
          ))}
        </div>
      </Modal>

      {/* End Workout Confirmation */}
      <Modal
        isOpen={showEndWorkout}
        onClose={() => setShowEndWorkout(false)}
        title="Training beenden?"
      >
        <div className="space-y-4">
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            Möchtest du dein Training wirklich beenden?
          </p>
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => setShowEndWorkout(false)}
            >
              Abbrechen
            </Button>
            <Button fullWidth onClick={handleEndWorkout}>
              Beenden
            </Button>
          </div>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              cancelWorkout();
              setShowEndWorkout(false);
              startTimeRef.current = null;
              elapsedRef.current = 0;
            }}
            className="text-red-500"
          >
            Training verwerfen
          </Button>
        </div>
      </Modal>

      {/* Workout Summary */}
      <Modal
        isOpen={workoutSummary !== null}
        onClose={handleCloseSummary}
        title="Training abgeschlossen! ��"
      >
        {workoutSummary && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-dark-border' : 'bg-gray-100'
            }`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {workoutSummary.duration}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Minuten
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {workoutSummary.exercises.length}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Übungen
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {workoutSummary.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sätze
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workoutSummary.exercises.map(ex => (
                <div
                  key={ex.id}
                  className={`p-3 rounded-lg ${
                    darkMode ? 'bg-dark-border' : 'bg-gray-100'
                  }`}
                >
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ex.exerciseName}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {ex.sets.filter(s => s.completed).length} Sätze • {ex.sets.filter(s => s.completed).reduce((acc, s) => acc + s.reps, 0)} Wdh.
                  </p>
                </div>
              ))}
            </div>

            <Button fullWidth onClick={handleCloseSummary}>
              Fertig
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

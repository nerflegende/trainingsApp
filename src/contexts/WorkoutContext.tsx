import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import type { ActiveWorkout, WorkoutExercise, WorkoutPlan, WorkoutRecord, WorkoutSet, BodyMeasurement, WorkoutDay, Exercise, Gadget } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  workoutPlans: WorkoutPlan[];
  workoutHistory: WorkoutRecord[];
  bodyMeasurements: BodyMeasurement[];
  customExercises: Exercise[];
  customGadgets: Gadget[];
  isLoading: boolean;
  startFreeWorkout: () => void;
  startPlanWorkout: (plan: WorkoutPlan, dayIndex: number) => void;
  addExerciseToWorkout: (exerciseId: string, exerciseName: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  removeExercise: (exerciseId: string) => void;
  endWorkout: (totalWeight?: number) => Promise<WorkoutRecord | null>;
  cancelWorkout: () => void;
  savePlan: (plan: Omit<WorkoutPlan, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  loadUserData: () => Promise<void>;
  addBodyMeasurement: (data: { weight?: number; height?: number; bodyFat?: number; chest?: number; arms?: number; waist?: number; legs?: number }) => Promise<void>;
  addCustomExercise: (exercise: { name: string; description: string; muscles: string[]; gadgets: string[] }) => Promise<void>;
  updateCustomExercise: (id: string, exercise: { name?: string; description?: string; muscles?: string[]; gadgets?: string[] }) => Promise<void>;
  deleteCustomExercise: (id: string) => Promise<void>;
  addCustomGadget: (gadget: { name: string; description: string }) => Promise<void>;
  updateCustomGadget: (id: string, gadget: { name?: string; description?: string }) => Promise<void>;
  deleteCustomGadget: (id: string) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getWorkoutsForDate: (date: Date) => WorkoutRecord[];
  getMeasurementsForDate: (date: Date) => BodyMeasurement[];
  calculateStreak: () => number;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [customGadgets, setCustomGadgets] = useState<Gadget[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadUserData() {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      // Load workout plans
      const plansData = await api.getPlans();
      const plans = plansData.map(plan => ({
        id: plan.id,
        userId: plan.userId,
        name: plan.name,
        description: plan.description || '',
        days: plan.days as WorkoutDay[],
        isTemplate: plan.isTemplate,
        createdAt: new Date(plan.createdAt)
      }));
      setWorkoutPlans(plans);

      // Load workout history
      const workoutsData = await api.getWorkouts();
      const history = workoutsData.map(w => ({
        id: w.id,
        userId: w.userId,
        date: new Date(w.date),
        planName: w.planName,
        dayName: w.dayName,
        exercises: w.exercises as WorkoutExercise[],
        duration: w.duration,
        totalWeight: w.totalWeight || 0
      }));
      setWorkoutHistory(history);

      // Load body measurements
      const measurementsData = await api.getMeasurements();
      const measurements = measurementsData.map(m => ({
        id: m.id,
        userId: m.userId,
        date: new Date(m.date),
        weight: m.weight,
        height: m.height,
        bodyFat: m.bodyFat,
        chest: m.chest,
        arms: m.arms,
        waist: m.waist,
        legs: m.legs
      }));
      setBodyMeasurements(measurements);

      // Load custom exercises
      const exercisesData = await api.getCustomExercises();
      setCustomExercises(exercisesData);

      // Load custom gadgets
      const gadgetsData = await api.getCustomGadgets();
      setCustomGadgets(gadgetsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function startFreeWorkout() {
    if (!currentUser) return;

    const workout: ActiveWorkout = {
      id: uuidv4(),
      userId: currentUser.id,
      startTime: new Date(),
      exercises: [],
      isCompleted: false
    };
    setActiveWorkout(workout);
  }

  function startPlanWorkout(plan: WorkoutPlan, dayIndex: number) {
    if (!currentUser) return;

    const day = plan.days[dayIndex];
    const exercises: WorkoutExercise[] = day.exercises.map(pe => ({
      id: uuidv4(),
      exerciseId: pe.exerciseId,
      exerciseName: pe.exerciseName,
      gadget: pe.gadget,
      sets: Array.from({ length: pe.sets }, (_, i) => ({
        id: uuidv4(),
        setNumber: i + 1,
        reps: pe.targetReps,
        weight: pe.targetWeight,
        completed: false
      }))
    }));

    const workout: ActiveWorkout = {
      id: uuidv4(),
      planId: plan.id,
      planName: plan.name,
      dayId: day.id,
      dayName: day.name,
      userId: currentUser.id,
      startTime: new Date(),
      exercises,
      isCompleted: false
    };
    setActiveWorkout(workout);
  }

  function addExerciseToWorkout(exerciseId: string, exerciseName: string) {
    if (!activeWorkout) return;

    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      exerciseId,
      exerciseName,
      sets: [{
        id: uuidv4(),
        setNumber: 1,
        reps: 0,
        completed: false
      }]
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise]
    });
  }

  function updateExercise(exerciseId: string, updates: Partial<WorkoutExercise>) {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    });
  }

  function updateSet(exerciseId: string, setId: string, updates: Partial<WorkoutSet>) {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(set =>
                set.id === setId ? { ...set, ...updates } : set
              )
            }
          : ex
      )
    });
  }

  function addSet(exerciseId: string) {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: uuidv4(),
                  setNumber: ex.sets.length + 1,
                  reps: 0,
                  completed: false
                }
              ]
            }
          : ex
      )
    });
  }

  function removeSet(exerciseId: string, setId: string) {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets
                .filter(set => set.id !== setId)
                .map((set, i) => ({ ...set, setNumber: i + 1 }))
            }
          : ex
      )
    });
  }

  function removeExercise(exerciseId: string) {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(ex => ex.id !== exerciseId)
    });
  }

  async function endWorkout(totalWeight?: number): Promise<WorkoutRecord | null> {
    if (!activeWorkout || !currentUser) return null;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeWorkout.startTime.getTime()) / 60000);

    // Calculate total weight if not provided
    const calculatedTotalWeight = totalWeight ?? activeWorkout.exercises.reduce((acc, ex) => {
      return acc + ex.sets
        .filter(s => s.completed && s.weight)
        .reduce((setAcc, s) => setAcc + (s.weight || 0), 0);
    }, 0);

    try {
      const result = await api.saveWorkout({
        date: new Date().toISOString(),
        planName: activeWorkout.planName,
        dayName: activeWorkout.dayName,
        exercises: activeWorkout.exercises,
        duration,
        totalWeight: calculatedTotalWeight
      });

      const savedRecord: WorkoutRecord = {
        id: result.id,
        userId: result.userId,
        date: new Date(result.date),
        planName: result.planName,
        dayName: result.dayName,
        exercises: result.exercises as WorkoutExercise[],
        duration: result.duration,
        totalWeight: result.totalWeight || calculatedTotalWeight
      };
      setWorkoutHistory(prev => [savedRecord, ...prev]);
      setActiveWorkout(null);
      return savedRecord;
    } catch (error) {
      console.error('Error saving workout:', error);
      return null;
    }
  }

  function cancelWorkout() {
    setActiveWorkout(null);
  }

  async function savePlan(plan: Omit<WorkoutPlan, 'id' | 'userId' | 'createdAt'>) {
    if (!currentUser) return;

    try {
      const result = await api.createPlan({
        name: plan.name,
        description: plan.description,
        days: plan.days,
        isTemplate: plan.isTemplate
      });
      
      setWorkoutPlans(prev => [{
        id: result.id,
        userId: result.userId,
        name: result.name,
        description: result.description || '',
        days: result.days as WorkoutDay[],
        isTemplate: result.isTemplate,
        createdAt: new Date(result.createdAt)
      }, ...prev]);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  }

  async function deletePlan(planId: string) {
    try {
      await api.deletePlan(planId);
      setWorkoutPlans(prev => prev.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  }

  async function addBodyMeasurement(data: { weight?: number; height?: number; bodyFat?: number; chest?: number; arms?: number; waist?: number; legs?: number }) {
    if (!currentUser) return;

    try {
      const result = await api.addMeasurement(data);
      
      setBodyMeasurements(prev => [{
        id: result.id,
        userId: result.userId,
        date: new Date(result.date),
        weight: result.weight,
        height: result.height,
        bodyFat: result.bodyFat,
        chest: result.chest,
        arms: result.arms,
        waist: result.waist,
        legs: result.legs
      }, ...prev]);
    } catch (error) {
      console.error('Error saving body measurement:', error);
    }
  }

  async function deleteWorkout(workoutId: string) {
    try {
      await api.deleteWorkout(workoutId);
      setWorkoutHistory(prev => prev.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  }

  function getWorkoutsForDate(date: Date): WorkoutRecord[] {
    return workoutHistory.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  }

  function getMeasurementsForDate(date: Date): BodyMeasurement[] {
    return bodyMeasurements.filter(m => {
      const measurementDate = new Date(m.date);
      return measurementDate.toDateString() === date.toDateString();
    });
  }

  function calculateStreak(): number {
    // Count total workouts this week toward the weekly goal
    // Returns the number of training days completed this week
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of current week (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // Count workouts this week
    const workoutsThisWeek = workoutHistory.filter(w => {
      const workoutDate = new Date(w.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate >= weekStart && workoutDate <= today;
    }).length;

    return workoutsThisWeek;
  }

  async function addCustomExercise(exercise: { name: string; description: string; muscles: string[]; gadgets: string[] }) {
    try {
      const result = await api.createCustomExercise(exercise);
      setCustomExercises(prev => [...prev, result]);
    } catch (error) {
      console.error('Error creating custom exercise:', error);
    }
  }

  async function updateCustomExercise(id: string, exercise: { name?: string; description?: string; muscles?: string[]; gadgets?: string[] }) {
    try {
      await api.updateCustomExercise(id, exercise);
      setCustomExercises(prev => prev.map(ex => 
        ex.id === id ? { ...ex, ...exercise } : ex
      ));
    } catch (error) {
      console.error('Error updating custom exercise:', error);
    }
  }

  async function deleteCustomExercise(id: string) {
    try {
      await api.deleteCustomExercise(id);
      setCustomExercises(prev => prev.filter(ex => ex.id !== id));
    } catch (error) {
      console.error('Error deleting custom exercise:', error);
    }
  }

  async function addCustomGadget(gadget: { name: string; description: string }) {
    try {
      const result = await api.createCustomGadget(gadget);
      setCustomGadgets(prev => [...prev, result]);
    } catch (error) {
      console.error('Error creating custom gadget:', error);
    }
  }

  async function updateCustomGadget(id: string, gadget: { name?: string; description?: string }) {
    try {
      await api.updateCustomGadget(id, gadget);
      setCustomGadgets(prev => prev.map(g => 
        g.id === id ? { ...g, ...gadget } : g
      ));
    } catch (error) {
      console.error('Error updating custom gadget:', error);
    }
  }

  async function deleteCustomGadget(id: string) {
    try {
      await api.deleteCustomGadget(id);
      setCustomGadgets(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting custom gadget:', error);
    }
  }

  const value: WorkoutContextType = {
    activeWorkout,
    workoutPlans,
    workoutHistory,
    bodyMeasurements,
    customExercises,
    customGadgets,
    isLoading,
    startFreeWorkout,
    startPlanWorkout,
    addExerciseToWorkout,
    updateExercise,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    endWorkout,
    cancelWorkout,
    savePlan,
    deletePlan,
    loadUserData,
    addBodyMeasurement,
    addCustomExercise,
    updateCustomExercise,
    deleteCustomExercise,
    addCustomGadget,
    updateCustomGadget,
    deleteCustomGadget,
    deleteWorkout,
    getWorkoutsForDate,
    getMeasurementsForDate,
    calculateStreak
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

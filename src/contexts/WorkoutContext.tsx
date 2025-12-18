import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import type { ActiveWorkout, WorkoutExercise, WorkoutPlan, WorkoutRecord, WorkoutSet, BodyMeasurement, WorkoutDay } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  workoutPlans: WorkoutPlan[];
  workoutHistory: WorkoutRecord[];
  bodyMeasurements: BodyMeasurement[];
  isLoading: boolean;
  startFreeWorkout: () => void;
  startPlanWorkout: (plan: WorkoutPlan, dayIndex: number) => void;
  addExerciseToWorkout: (exerciseId: string, exerciseName: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  removeExercise: (exerciseId: string) => void;
  endWorkout: () => Promise<WorkoutRecord | null>;
  cancelWorkout: () => void;
  savePlan: (plan: Omit<WorkoutPlan, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  loadUserData: () => Promise<void>;
  addBodyMeasurement: (weight?: number, height?: number) => Promise<void>;
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
        duration: w.duration
      }));
      setWorkoutHistory(history);

      // Load body measurements
      const measurementsData = await api.getMeasurements();
      const measurements = measurementsData.map(m => ({
        id: m.id,
        userId: m.userId,
        date: new Date(m.date),
        weight: m.weight,
        height: m.height
      }));
      setBodyMeasurements(measurements);
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

  async function endWorkout(): Promise<WorkoutRecord | null> {
    if (!activeWorkout || !currentUser) return null;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeWorkout.startTime.getTime()) / 60000);

    try {
      const result = await api.saveWorkout({
        date: new Date().toISOString(),
        planName: activeWorkout.planName,
        dayName: activeWorkout.dayName,
        exercises: activeWorkout.exercises,
        duration
      });

      const savedRecord: WorkoutRecord = {
        id: result.id,
        userId: result.userId,
        date: new Date(result.date),
        planName: result.planName,
        dayName: result.dayName,
        exercises: result.exercises as WorkoutExercise[],
        duration: result.duration
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

  async function addBodyMeasurement(weight?: number, height?: number) {
    if (!currentUser) return;

    try {
      const result = await api.addMeasurement({ weight, height });
      
      setBodyMeasurements(prev => [{
        id: result.id,
        userId: result.userId,
        date: new Date(result.date),
        weight: result.weight,
        height: result.height
      }, ...prev]);
    } catch (error) {
      console.error('Error saving body measurement:', error);
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

  const value: WorkoutContextType = {
    activeWorkout,
    workoutPlans,
    workoutHistory,
    bodyMeasurements,
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

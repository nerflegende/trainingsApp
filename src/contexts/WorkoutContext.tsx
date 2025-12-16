import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, doc, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';
import type { ActiveWorkout, WorkoutExercise, WorkoutPlan, WorkoutRecord, WorkoutSet, BodyMeasurement } from '../types';
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
  const { currentUser, userData } = useAuth();
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
      const plansQuery = query(
        collection(db, 'workoutPlans'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const plansSnapshot = await getDocs(plansQuery);
      const plans = plansSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: new Date(doc.data().createdAt)
      })) as WorkoutPlan[];
      setWorkoutPlans(plans);

      // Load workout history
      const historyQuery = query(
        collection(db, 'workoutHistory'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      const historySnapshot = await getDocs(historyQuery);
      const history = historySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: new Date(doc.data().date)
      })) as WorkoutRecord[];
      setWorkoutHistory(history);

      // Load body measurements
      const measurementsQuery = query(
        collection(db, 'bodyMeasurements'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      const measurementsSnapshot = await getDocs(measurementsQuery);
      const measurements = measurementsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: new Date(doc.data().date)
      })) as BodyMeasurement[];
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
      userId: currentUser.uid,
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
      userId: currentUser.uid,
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

    const record: Omit<WorkoutRecord, 'id'> = {
      userId: currentUser.uid,
      date: new Date(),
      planName: activeWorkout.planName,
      dayName: activeWorkout.dayName,
      exercises: activeWorkout.exercises,
      duration
    };

    try {
      const docRef = await addDoc(collection(db, 'workoutHistory'), {
        ...record,
        date: record.date.toISOString()
      });

      const savedRecord: WorkoutRecord = { ...record, id: docRef.id };
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

    const newPlan = {
      ...plan,
      userId: currentUser.uid,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'workoutPlans'), newPlan);
      setWorkoutPlans(prev => [{
        ...newPlan,
        id: docRef.id,
        createdAt: new Date(newPlan.createdAt)
      }, ...prev]);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  }

  async function deletePlan(planId: string) {
    try {
      await deleteDoc(doc(db, 'workoutPlans', planId));
      setWorkoutPlans(prev => prev.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  }

  async function addBodyMeasurement(weight?: number, height?: number) {
    if (!currentUser) return;

    const measurement: Omit<BodyMeasurement, 'id'> = {
      userId: currentUser.uid,
      date: new Date(),
      weight,
      height
    };

    try {
      const docRef = await addDoc(collection(db, 'bodyMeasurements'), {
        ...measurement,
        date: measurement.date.toISOString()
      });

      setBodyMeasurements(prev => [{
        ...measurement,
        id: docRef.id
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
    if (!userData) return 0;

    const weeklyGoal = userData.weeklyGoal || 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    // Check each week going backwards
    while (true) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const workoutsThisWeek = workoutHistory.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= currentWeekStart && workoutDate <= weekEnd;
      }).length;

      if (workoutsThisWeek >= weeklyGoal) {
        streak++;
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      } else if (currentWeekStart <= today && weekEnd >= today) {
        // Current week - don't break streak yet
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      } else {
        break;
      }

      // Safety check - don't go back more than a year
      if (streak > 52) break;
    }

    return streak;
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

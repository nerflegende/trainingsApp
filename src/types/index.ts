export interface User {
  id: string;
  username: string;
  email: string;
  bodyWeight?: number;
  bodyHeight?: number;
  age?: number;
  weeklyGoal: number;
  stepGoal?: number;
  palValue?: number; // Physical Activity Level: 1.2-2.4
  darkMode: boolean;
  createdAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscles: string[];
  gadgets: string[];
  isCustom: boolean;
  userId?: string;
}

export interface Gadget {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  userId?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  userId: string;
  days: WorkoutDay[];
  createdAt: Date;
  isTemplate: boolean;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: PlannedExercise[];
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  targetReps: number;
  targetWeight?: number;
  gadget?: string;
}

export interface ActiveWorkout {
  id: string;
  planId?: string;
  planName?: string;
  dayId?: string;
  dayName?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  gadget?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  height?: number;
}

export interface WorkoutRecord {
  id: string;
  userId: string;
  date: Date;
  planName?: string;
  dayName?: string;
  exercises: WorkoutExercise[];
  duration: number; // in minutes
}

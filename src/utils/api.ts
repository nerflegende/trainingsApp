const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiError {
  error: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Ein Fehler ist aufgetreten');
    }

    return data as T;
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    username: string;
    bodyWeight?: number;
    bodyHeight?: number;
    weeklyGoal?: number;
    darkMode?: boolean;
  }) {
    const result = await this.request<{ token: string; user: UserResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: UserResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request<UserResponse>('/auth/me');
  }

  async updateMe(data: Partial<{
    bodyWeight: number;
    bodyHeight: number;
    weeklyGoal: number;
    darkMode: boolean;
  }>) {
    return this.request<{ success: boolean }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Plans
  async getPlans() {
    return this.request<PlanResponse[]>('/plans');
  }

  async createPlan(data: {
    name: string;
    description?: string;
    days: unknown[];
    isTemplate?: boolean;
  }) {
    return this.request<PlanResponse>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(planId: string) {
    return this.request<{ success: boolean }>(`/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Workouts
  async getWorkouts() {
    return this.request<WorkoutResponse[]>('/workouts');
  }

  async saveWorkout(data: {
    date?: string;
    planName?: string;
    dayName?: string;
    exercises: unknown[];
    duration: number;
  }) {
    return this.request<WorkoutResponse>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Measurements
  async getMeasurements() {
    return this.request<MeasurementResponse[]>('/measurements');
  }

  async addMeasurement(data: { weight?: number; height?: number }) {
    return this.request<MeasurementResponse>('/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  bodyWeight?: number;
  bodyHeight?: number;
  weeklyGoal: number;
  darkMode: boolean;
  createdAt: string;
}

export interface PlanResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  days: unknown[];
  isTemplate: boolean;
  createdAt: string;
}

export interface WorkoutResponse {
  id: string;
  userId: string;
  date: string;
  planName?: string;
  dayName?: string;
  exercises: unknown[];
  duration: number;
}

export interface MeasurementResponse {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  height?: number;
}

export const api = new ApiClient();

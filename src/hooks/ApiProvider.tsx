"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios, { AxiosError, AxiosInstance } from "axios";
import {
  CreateHabitInputs,
  Habit,
  HttpHabit,
  UpdateHabitInputs,
  UpdateHabitStatusInputs,
} from "@/types/habits";
import {
  CreateTrackingInputs,
  UpdateTrackingInputs,
  GetTrackingFilters,
  HttpTrackingEntry,
  TrackingEntry,
} from "@/types/tracking";
import { DailyScore, HttpDailyScore } from "@/types/scores";
import {
  generateRequestId,
  mapToDailyScore,
  mapToHabit,
  mapToTrackingEntry,
} from "@/utils/api";
import { getCurrentYearRange } from "@/utils/datetime";
import { useKeycloak } from "./KeycloakProvider";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ApiContextType = {
  habits: Habit[];
  trackingEntries: TrackingEntry[];
  dailyScores: DailyScore[];
  loading: boolean;
  trackingLoaded: boolean;
  error?: string;
  createHabit: (data: CreateHabitInputs) => Promise<string>;
  updateHabit: (id: string, data: UpdateHabitInputs) => Promise<boolean>;
  deleteHabit: (id: string) => Promise<boolean>;
  updateHabitStatus: (
    id: string,
    data: UpdateHabitStatusInputs
  ) => Promise<boolean>;
  getHabits: () => Promise<void>;
  createTracking: (data: CreateTrackingInputs) => Promise<string>;
  updateTracking: (data: UpdateTrackingInputs) => Promise<boolean>;
  getTracking: (filters?: GetTrackingFilters) => Promise<void>;
  getDailyScores: (startDate?: string, endDate?: string) => Promise<void>;
  refreshAll: () => Promise<void>;
};

const ApiContext = createContext<ApiContextType>({
  habits: [],
  trackingEntries: [],
  dailyScores: [],
  loading: false,
  trackingLoaded: false,
  error: undefined,
  createHabit: async () => "",
  updateHabit: async () => false,
  deleteHabit: async () => false,
  updateHabitStatus: async () => false,
  getHabits: async () => {},
  createTracking: async () => "",
  updateTracking: async () => false,
  getTracking: async () => {},
  getDailyScores: async () => {},
  refreshAll: async () => {},
});

export function ApiProvider({ children }: PropsWithChildren) {
  const { token, authenticated } = useKeycloak();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [trackingEntries, setTrackingEntries] = useState<TrackingEntry[]>([]);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [trackingLoaded, setTrackingLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Create axios instance with auth token
  const apiRequest: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to attach token and request ID
    instance.interceptors.request.use((config) => {
      config.headers["x-request-id"] = generateRequestId();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [token]);

  // Error handler
  const handleError = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      return (
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "An error occurred"
      );
    }
    return "An unknown error occurred";
  };

  // Habits API
  const createHabit = async (data: CreateHabitInputs): Promise<string> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.post<{ data: HttpHabit }>(
        "/api/habits",
        data
      );
      const habit = mapToHabit(response.data.data);
      setHabits((prev) => [...prev, habit]);
      return habit.id;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getHabits = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.get<{ data: HttpHabit[] }>(
        "/api/habits"
      );
      const habits = response.data.data.map(mapToHabit);
      setHabits(habits);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (
    id: string,
    data: UpdateHabitInputs
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.put<{ data: HttpHabit }>(
        `/api/habits/${id}`,
        data
      );
      const updatedHabit = mapToHabit(response.data.data);
      setHabits((prev) =>
        prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
      );
      return true;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(undefined);
      await apiRequest.delete(`/api/habits/${id}`);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      return true;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateHabitStatus = async (
    id: string,
    data: UpdateHabitStatusInputs
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.put<{ data: HttpHabit }>(
        `/api/habits/${id}/status`,
        { status: data.status }
      );
      const updatedHabit = mapToHabit(response.data.data);
      setHabits((prev) =>
        prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
      );
      return true;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Tracking API
  const createTracking = async (
    data: CreateTrackingInputs
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.post<{ data: HttpTrackingEntry }>(
        "/api/tracking",
        { habit_id: data.habitId, date: data.date, completed: data.completed }
      );
      const entry = mapToTrackingEntry(response.data.data);
      setTrackingEntries((prev) => [
        ...prev.filter(
          (e) => !(e.habitId === entry.habitId && e.date === entry.date)
        ),
        entry,
      ]);
      return entry.id;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateTracking = async (
    data: UpdateTrackingInputs
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.put<{ data: HttpTrackingEntry }>(
        `/api/tracking/${data.id}`,
        { completed: data.completed, note: data.note }
      );
      const entry = mapToTrackingEntry(response.data.data);
      setTrackingEntries((prev) => [
        ...prev.filter((e) => e.id !== entry.id),
        entry,
      ]);
      return true;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTracking = async (
    filters?: GetTrackingFilters
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);
      const params = new URLSearchParams();
      if (filters?.habitId) params.append("habit_id", filters.habitId);
      if (filters?.dateFrom) params.append("date_from", filters.dateFrom);
      if (filters?.dateTo) params.append("date_to", filters.dateTo);

      const response = await apiRequest.get<{ data: HttpTrackingEntry[] }>(
        `/api/tracking?${params.toString()}`
      );
      const entries = response.data.data.map(mapToTrackingEntry);
      setTrackingEntries(entries);
      setTrackingLoaded(true);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Scores API
  const getDailyScores = async (
    startDate?: string,
    endDate?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await apiRequest.get<{ data: HttpDailyScore[] }>(
        `/api/scores/daily?${params.toString()}`
      );
      const scores = response.data.data.map(mapToDailyScore);
      setDailyScores(scores);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshAll = async (): Promise<void> => {
    const { start, end } = getCurrentYearRange();
    await Promise.all([
      getHabits(),
      getTracking({ dateFrom: start, dateTo: end }),
      getDailyScores(),
    ]);
  };

  // Load initial data only when authenticated
  useEffect(() => {
    if (authenticated) {
      refreshAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, apiRequest]);

  return (
    <ApiContext.Provider
      value={{
        habits,
        trackingEntries,
        dailyScores,
        loading,
        trackingLoaded,
        error,
        createHabit,
        updateHabit,
        deleteHabit,
        updateHabitStatus,
        getHabits,
        createTracking,
        updateTracking,
        getTracking,
        getDailyScores,
        refreshAll,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}

"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import axios, { AxiosError } from "axios";
import {
  CreateHabitInputs,
  Habit,
  HttpHabit,
  UpdateHabitInputs,
  UpdateHabitStatusInputs,
} from "@/types/habits";
import {
  CreateTrackingInputs,
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

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ApiContextType = {
  habits: Habit[];
  trackingEntries: TrackingEntry[];
  dailyScores: DailyScore[];
  loading: boolean;
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
  getTracking: (filters?: GetTrackingFilters) => Promise<void>;
  getDailyScores: (startDate?: string, endDate?: string) => Promise<void>;
  refreshAll: () => Promise<void>;
};

const ApiContext = createContext<ApiContextType>({
  habits: [],
  trackingEntries: [],
  dailyScores: [],
  loading: false,
  error: undefined,
  createHabit: async () => "",
  updateHabit: async () => false,
  deleteHabit: async () => false,
  updateHabitStatus: async () => false,
  getHabits: async () => {},
  createTracking: async () => "",
  getTracking: async () => {},
  getDailyScores: async () => {},
  refreshAll: async () => {},
});

export function ApiProvider({ children }: PropsWithChildren) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [trackingEntries, setTrackingEntries] = useState<TrackingEntry[]>([]);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Helper function to make API calls with common headers
  const apiRequest = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-request-id": generateRequestId(),
    },
  });

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
      const response = await apiRequest.post<{ data: HttpHabit }>(
        `/api/habits/${id}/status`,
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

  // Tracking API
  const createTracking = async (
    data: CreateTrackingInputs
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await apiRequest.post<{ data: HttpTrackingEntry }>(
        "/api/tracking",
        data
      );
      const entry = mapToTrackingEntry(response.data.data);
      setTrackingEntries((prev) => [...prev, entry]);
      return entry.id;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
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
      if (filters?.habitId) params.append("habitId", filters.habitId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await apiRequest.get<{ data: HttpTrackingEntry[] }>(
        `/api/tracking?${params.toString()}`
      );
      const entries = response.data.data.map(mapToTrackingEntry);
      setTrackingEntries(entries);
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
    await Promise.all([getHabits(), getTracking(), getDailyScores()]);
  };

  // Load initial data
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ApiContext.Provider
      value={{
        habits,
        trackingEntries,
        dailyScores,
        loading,
        error,
        createHabit,
        updateHabit,
        deleteHabit,
        updateHabitStatus,
        getHabits,
        createTracking,
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

// API Utility Functions
import { Habit, HttpHabit } from "@/types/habits";
import { HttpTrackingEntry, TrackingEntry } from "@/types/tracking";
import { DailyScore, HttpDailyScore } from "@/types/scores";

// Generate unique request ID
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Data mappers: snake_case (API) → camelCase (internal)

export function mapToHabit(http: HttpHabit): Habit {
  return {
    id: http.id,
    name: http.name,
    description: http.description,
    status: http.status,
    goals: http.goals,
    createdAt: http.created_at,
    updatedAt: http.updated_at,
  };
}

export function mapToTrackingEntry(http: HttpTrackingEntry): TrackingEntry {
  return {
    id: http.id,
    habitId: http.habit_id,
    date: http.date,
    completed: http.completed,
    createdAt: http.created_at,
    updatedAt: http.updated_at,
  };
}

export function mapToDailyScore(http: HttpDailyScore): DailyScore {
  return {
    date: http.date,
    totalHabits: http.total_habits,
    completedHabits: http.completed_habits,
    score: http.score,
    percentage: http.percentage,
  };
}

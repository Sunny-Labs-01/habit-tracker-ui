// API Utility Functions
import { Habit, HttpHabit } from "@/types/habits";
import { HttpTrackingEntry, TrackingEntry } from "@/types/tracking";
import {
  DailyScore,
  HttpDailyScore,
  HttpWeeklyScore,
  HttpMonthlyScore,
  WeeklyScore,
  MonthlyScore,
} from "@/types/scores";

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
    frequency: http.frequency,
    emoji: http.emoji,
    color: http.color,
    createdAt: http.created_at,
    updatedAt: http.updated_at,
  };
}

export function mapToTrackingEntry(http: HttpTrackingEntry): TrackingEntry {
  return {
    id: http.id,
    habitId: http.habit_id,
    date: http.date.slice(0, 10), // API returns full ISO datetime; extract YYYY-MM-DD
    completed: http.completed,
    createdAt: http.created_at,
    updatedAt: http.updated_at,
  };
}

export function mapToDailyScore(http: HttpDailyScore): DailyScore {
  return {
    date: http.date,
    completedCount: http.completed_count,
    totalCount: http.total_count,
    score: http.score,
  };
}

export function mapToWeeklyScore(http: HttpWeeklyScore): WeeklyScore {
  return {
    year: http.year,
    weekNumber: http.week_number,
    completedCount: http.completed_count,
    totalCount: http.total_count,
    score: http.score,
  };
}

export function mapToMonthlyScore(http: HttpMonthlyScore): MonthlyScore {
  return {
    month: http.month,
    year: http.year,
    completedCount: http.completed_count,
    totalCount: http.total_count,
    score: http.score,
  };
}

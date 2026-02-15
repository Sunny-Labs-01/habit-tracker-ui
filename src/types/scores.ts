// Score Types

// Internal camelCase type
export type DailyScore = {
  date: string;
  totalHabits: number;
  completedHabits: number;
  score: number;
  percentage: number;
};

// API snake_case type
export type HttpDailyScore = {
  date: string;
  total_habits: number;
  completed_habits: number;
  score: number;
  percentage: number;
};

// Weekly/Monthly score (same structure)
export type WeeklyScore = DailyScore;
export type MonthlyScore = DailyScore;
export type HttpWeeklyScore = HttpDailyScore;
export type HttpMonthlyScore = HttpDailyScore;

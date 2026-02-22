// Score Types

// Internal camelCase types
export type DailyScore = {
  date: string;
  completedCount: number;
  totalCount: number;
  score: number;
};

export type WeeklyScore = {
  year: number;
  weekNumber: number;
  completedCount: number;
  totalCount: number;
  score: number;
};

export type MonthlyScore = {
  month: number;
  year: number;
  completedCount: number;
  totalCount: number;
  score: number;
};

// API snake_case types
export type HttpDailyScore = {
  date: string;
  user_id: string;
  completed_count: number;
  total_count: number;
  score: number;
};

export type HttpWeeklyScore = {
  year: number;
  week_number: number;
  user_id: string;
  completed_count: number;
  total_count: number;
  score: number;
};

export type HttpMonthlyScore = {
  month: number;
  year: number;
  user_id: string;
  completed_count: number;
  total_count: number;
  score: number;
};

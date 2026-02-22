// Habit Types

export enum HabitStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  ARCHIVED = "ARCHIVED",
}

export type HabitGoal = {
  weekly?: number;
  monthly?: number;
};

// Internal camelCase type
export type Habit = {
  id: string;
  name: string;
  description?: string;
  status: HabitStatus;
  goals?: HabitGoal;
  frequency?: string; // Cron pattern (e.g., "0 0 * * *" for daily)
  emoji?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

// API snake_case type
export type HttpHabit = {
  id: string;
  name: string;
  description?: string;
  status: HabitStatus;
  goals?: HabitGoal;
  frequency?: string;
  emoji?: string;
  color?: string;
  created_at: string;
  updated_at: string;
};

// Create inputs
export type CreateHabitInputs = {
  name: string;
  description?: string;
  frequency?: string;
  emoji?: string;
  color?: string;
};

// Update inputs
export type UpdateHabitInputs = {
  name?: string;
  description?: string;
  goals?: HabitGoal;
  frequency?: string;
  emoji?: string;
  color?: string;
};

// Status update inputs
export type UpdateHabitStatusInputs = {
  status: HabitStatus;
};

// Events
export enum HabitEvent {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  STATUS_CHANGED = "STATUS_CHANGED",
}

// Frequency options for UI
export type FrequencyOption = "daily" | "weekdays" | "weekends" | "custom";

// Days of week for custom frequency
export const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;

// Frequency helpers
export function frequencyToCron(option: FrequencyOption, customDays?: number[]): string {
  switch (option) {
    case "daily":
      return "0 0 * * *";
    case "weekdays":
      return "0 0 * * 1-5";
    case "weekends":
      return "0 0 * * 0,6";
    case "custom":
      if (!customDays || customDays.length === 0) return "0 0 * * *";
      return `0 0 * * ${customDays.sort((a, b) => a - b).join(",")}`;
    default:
      return "0 0 * * *";
  }
}

export function cronToFrequencyOption(cron?: string): { option: FrequencyOption; customDays: number[] } {
  if (!cron) return { option: "daily", customDays: [] };
  
  const parts = cron.split(" ");
  if (parts.length !== 5) return { option: "daily", customDays: [] };
  
  const dayOfWeek = parts[4];
  
  if (dayOfWeek === "*") return { option: "daily", customDays: [] };
  if (dayOfWeek === "1-5") return { option: "weekdays", customDays: [] };
  if (dayOfWeek === "0,6") return { option: "weekends", customDays: [] };
  
  // Parse custom days
  const days = dayOfWeek.split(",").map(d => parseInt(d, 10)).filter(d => !isNaN(d));
  return { option: "custom", customDays: days };
}

// Check if habit is due on a given date
export function isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
  const frequency = habit.frequency || "0 0 * * *";
  const parts = frequency.split(" ");
  if (parts.length !== 5) return true; // Default to due if invalid cron
  
  const dayOfWeek = parts[4];
  const date = new Date(dateStr);
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (dayOfWeek === "*") return true;
  if (dayOfWeek === "1-5") return jsDay >= 1 && jsDay <= 5;
  if (dayOfWeek === "0,6") return jsDay === 0 || jsDay === 6;
  
  // Parse custom days
  const allowedDays = dayOfWeek.split(",").map(d => parseInt(d, 10));
  return allowedDays.includes(jsDay);
}

// Color palette for habits
export const HABIT_COLORS = [
  "#14b8a6", // teal
  "#22c55e", // green
  "#84cc16", // lime
  "#eab308", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#a855f7", // purple
  "#3b82f6", // blue
  "#06b6d4", // cyan
] as const;

// Default emoji options
export const DEFAULT_EMOJIS = [
  "✅", "⭐", "🎯", "💪", "🏃", "📚", "💧", "🧘", "😴", "🥗",
  "💊", "🎵", "✍️", "🧹", "🌱", "💰", "📱", "🧠", "❤️", "🏋️",
] as const;

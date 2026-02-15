// Habit Types

export enum HabitStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  STOPPED = "stopped",
  PENDING = "pending",
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
  created_at: string;
  updated_at: string;
};

// Create inputs
export type CreateHabitInputs = {
  name: string;
  description?: string;
  goals?: HabitGoal;
};

// Update inputs
export type UpdateHabitInputs = {
  name?: string;
  description?: string;
  goals?: HabitGoal;
};

// Status update inputs
export type UpdateHabitStatusInputs = {
  action: "start" | "pause" | "resume" | "stop";
};

// Events
export enum HabitEvent {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  STATUS_CHANGED = "STATUS_CHANGED",
}

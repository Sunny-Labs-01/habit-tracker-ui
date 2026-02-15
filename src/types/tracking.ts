// Tracking Types

// Internal camelCase type
export type TrackingEntry = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

// API snake_case type
export type HttpTrackingEntry = {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

// Create inputs
export type CreateTrackingInputs = {
  habitId: string;
  date: string;
  completed: boolean;
};

// Get tracking filters
export type GetTrackingFilters = {
  habitId?: string;
  startDate?: string;
  endDate?: string;
};

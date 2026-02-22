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

// Update inputs
export type UpdateTrackingInputs = {
  id: string;
  completed?: boolean;
  note?: string;
};

// Get tracking filters
export type GetTrackingFilters = {
  habitId?: string;
  dateFrom?: string;
  dateTo?: string;
};

# API Integration Deep Dive

## Configuration

- **Base URL:** `NEXT_PUBLIC_API_URL` (default: `http://localhost:3000`)
- **Required Headers:** `Authorization`, `x-request-id`, `Content-Type`
- **Response Format:** `{ data: T }`
- **Case Mapping:** API uses snake_case, internal types use camelCase

## useApi() Hook

```typescript
const {
  // State
  habits,           // Habit[] - all habits
  trackingEntries,  // TrackingEntry[] - tracking history
  dailyScores,      // DailyScore[] - score history
  loading,          // boolean - request in progress
  error,            // string - error message

  // Habit Methods
  createHabit,      // (data) => Promise<string> - returns new habit ID
  updateHabit,      // (id, data) => Promise<boolean>
  deleteHabit,      // (id) => Promise<boolean>
  updateHabitStatus,// (id, data) => Promise<boolean>
  getHabits,        // () => Promise<void> - refresh habits

  // Tracking Methods
  createTracking,   // (data) => Promise<string>
  getTracking,      // (filters?) => Promise<void>

  // Score Methods
  getDailyScores,   // (startDate?, endDate?) => Promise<void>

  // Utility
  refreshAll,       // () => Promise<void> - reload all data
} = useApi();
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/habits` | List all habits |
| `POST` | `/api/habits` | Create habit |
| `PUT` | `/api/habits/:id` | Update habit |
| `DELETE` | `/api/habits/:id` | Delete habit |
| `POST` | `/api/habits/:id/status` | Change status |
| `GET` | `/api/tracking` | List tracking (supports filters) |
| `POST` | `/api/tracking` | Create tracking entry |
| `GET` | `/api/scores/daily` | Get daily scores (supports date range) |

## Data Mappers

All API responses use snake_case; mappers in `src/utils/api.ts` convert to camelCase:

```typescript
mapToHabit(httpHabit: HttpHabit): Habit
mapToTrackingEntry(httpEntry: HttpTrackingEntry): TrackingEntry
mapToDailyScore(httpScore: HttpDailyScore): DailyScore
```

## Adding a New API Method

1. Add type definitions in `src/types/`
2. Add HTTP type and mapper in `src/utils/api.ts`
3. Add method in `ApiProvider.tsx`
4. Export in context value

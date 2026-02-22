# Core Types

## Habit

```typescript
type HabitStatus = "ACTIVE" | "PAUSED" | "STOPPED" | "PENDING";

interface Habit {
  id: string;
  name: string;
  description?: string;
  weeklyGoal: number;
  monthlyGoal: number;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
}
```

## Habit Status Flow

```
PENDING ──start──► ACTIVE ◄──resume── PAUSED
                     │                   ▲
                     └──pause────────────┘
                     │
              ACTIVE/PAUSED ──stop──► STOPPED
```

## Tracking Entry

```typescript
interface TrackingEntry {
  id: string;
  habitId: string;
  date: string;      // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}
```

## Daily Score

```typescript
interface DailyScore {
  date: string;
  score: number;       // 0-100 percentage
  completed: number;   // count of completed habits
  total: number;       // count of active habits
}
```

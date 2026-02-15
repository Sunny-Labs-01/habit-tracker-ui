# Habit Tracker UI

## What This Is

A web application for tracking daily habits, managing goals, and viewing progress with visual feedback.

## Tech Stack

- **Framework:** Next.js 16.1.6 (React 19.2.3) with App Router
- **Language:** TypeScript 5
- **UI:** Material-UI v7.3.1 + Tailwind CSS 4
- **Date Handling:** Luxon 3.7.1
- **HTTP Client:** Axios 1.11.0
- **Icons:** Lucide React + MUI Icons Material

## API Configuration

- **Base URL:** `http://localhost:3000` (configurable via `NEXT_PUBLIC_API_URL`)
- **Required Headers:** `x-request-id`, `Content-Type`
- **Response Format:** `{ data: T }`
- **Data Mapping:** All API responses use snake_case, internal types use camelCase
  - See mappers in: `src/utils/api.ts`

## Project Structure

```
src/
├── hooks/                  # React Context providers
│   ├── ApiProvider.tsx     # Global state + API methods
│   └── ThemeProvider.tsx   # Theme context (light/dark mode)
├── components/             # React components
│   ├── HabitList.tsx       # List of habits with CRUD actions
│   ├── HabitTable.tsx      # Monthly calendar view for tracking
│   ├── AddHabit.tsx        # Dialog for creating new habits
│   └── ScoreDisplay.tsx    # Daily/weekly/monthly score cards
├── types/                  # TypeScript definitions
│   ├── habits.ts           # Habit types and enums
│   ├── tracking.ts         # Tracking entry types
│   └── scores.ts           # Score types
├── utils/                  # Utility functions
│   ├── api.ts              # Data mappers: HttpType → Type
│   ├── datetime.ts         # Date formatting with Luxon
│   └── common.ts           # Misc helpers
└── app/                    # Next.js App Router pages
    ├── layout.tsx          # Root layout with providers
    └── page.tsx            # Main dashboard
```

## Key Features

### Habit Management
- Create, update, delete habits
- Set weekly/monthly goals
- Manage habit states (active, paused, stopped, pending)
- Status transitions: start → pause → resume → stop

### Habit Tracking
- Monthly calendar view (X-axis: days, Y-axis: habits)
- Check off habits only for TODAY (past/future dates are read-only)
- Visual indicators for current day
- Persistent tracking data

### Scores
- **Daily Score:** Completion percentage for today
- **Weekly Score:** Last 7 days aggregated
- **Monthly Score:** Current month aggregated

## Essential Commands

```bash
npm run dev      # Start dev server on port 3004 (with Turbopack)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint + TypeScript checks
```

## State Management

Uses React Context (`ApiProvider`) for global state. All components access via `useApi()` hook.

**Key state slices:**
- `habits` - All habits
- `trackingEntries` - Tracking history
- `dailyScores` - Score history
- `loading`, `error` - UI state

**API methods:**
- `createHabit`, `updateHabit`, `deleteHabit`
- `updateHabitStatus` (start/pause/resume/stop)
- `createTracking`, `getTracking`
- `getDailyScores`
- `refreshAll` - Reload all data

See: `src/hooks/ApiProvider.tsx`

## Habit Status Flow

```
PENDING → start → ACTIVE
ACTIVE → pause → PAUSED
PAUSED → resume → ACTIVE
ACTIVE/PAUSED → stop → STOPPED
```

## Date Handling

All dates use Luxon with English locale.

**Formats:** `src/utils/datetime.ts:5-11`
**Formatters:** `src/utils/datetime.ts:14-60`

**Key functions:**
- `getToday()` - Current date in YYYY-MM-DD
- `isToday(date)` - Check if date is today
- `getDaysInMonth(year, month)` - Array of all dates in month
- `getCurrentMonthRange()` - Start/end dates of current month

## Form Patterns

Standard pattern across all forms:

1. Separate state for each field
2. Loading state during async operations
3. Form reset on success/cancel
4. Validation before submission

**Example:** `src/components/AddHabit.tsx`

## Habit Table Logic

The habit table (`HabitTable.tsx`) implements the core tracking feature:

1. Display current month by default
2. Show all habits as rows
3. Show all days of month as columns
4. Checkboxes for marking completion
5. **Only today's column is editable** (past/future disabled)
6. Visual highlight for today's column
7. Auto-refresh on month change

## API Endpoints Used

- `GET /api/habits` - List all habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/status` - Change status
- `GET /api/tracking` - List tracking entries (supports filters)
- `POST /api/tracking` - Create tracking entry
- `GET /api/scores/daily` - Get daily scores (supports date range)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend API URL
```

## Contributing

Whenever working on this repository:

- Always pull the latest main branch
- Always create a new working branch based off main branch
- Run `npm run lint` before committing
- Run `npm run build` to ensure no build errors

## Backend Repository

Backend API: https://github.com/Sunny-Labs-01/habit-tracker-be

See backend CLAUDE.md for API documentation.

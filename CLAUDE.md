# CLAUDE.md - Habit Tracker UI

> Comprehensive documentation for AI agents working on this codebase.

## Overview

Habit Tracker UI is a Next.js web application for tracking daily habits, managing goals, and viewing progress with visual feedback. It uses Keycloak for authentication and connects to a separate backend API.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Component Library | Material-UI | 7.3.x |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.x |
| Authentication | Keycloak (keycloak-js) | 26.2.3 |
| HTTP Client | Axios | 1.13.5 |
| Date Handling | Luxon | 3.7.2 |
| Icons | Lucide React, MUI Icons | - |

## Quick Commands

```bash
npm run dev      # Start dev server on port 3005 (Turbopack)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint + TypeScript checks (REQUIRED before commits)
npm run lint:fix # Auto-fix lint issues
```

## Project Structure

```
habit-tracker-ui/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (provider hierarchy)
│   ├── page.tsx                # Main dashboard page
│   └── globals.css             # Global styles
├── src/
│   ├── components/             # UI Components
│   │   ├── AddHabit.tsx        # Habit creation dialog
│   │   ├── AuthRequired.tsx    # Auth guard wrapper
│   │   ├── HabitList.tsx       # Habit list with CRUD actions
│   │   ├── HabitTable.tsx      # Monthly calendar tracking view
│   │   ├── ScoreDisplay.tsx    # Daily/weekly/monthly score cards
│   │   └── UserMenu.tsx        # User avatar and dropdown menu
│   ├── hooks/                  # React Context Providers
│   │   ├── ApiProvider.tsx     # API state + methods (habits, tracking, scores)
│   │   ├── KeycloakProvider.tsx# Authentication context
│   │   └── ThemeProvider.tsx   # Theme context (light/dark)
│   ├── types/                  # TypeScript Definitions
│   │   ├── habits.ts           # Habit types, enums, HTTP types
│   │   ├── tracking.ts         # Tracking entry types
│   │   └── scores.ts           # Score types
│   └── utils/                  # Utility Functions
│       ├── api.ts              # Data mappers (snake_case → camelCase)
│       ├── datetime.ts         # Date formatting with Luxon
│       └── common.ts           # Misc helpers
├── .github/workflows/          # CI/CD pipelines
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Portainer deployment config
└── .env.example                # Environment template
```

## Provider Hierarchy

The app wraps components in this provider order (see `app/layout.tsx`):

```
HabitTrackerThemeProvider
  └─ KeycloakProvider (auth)
      └─ ApiProvider (state + API methods)
          └─ App Content
```

**Important:** `ApiProvider` depends on `KeycloakProvider` for the auth token.

## Environment Variables

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Keycloak server URL
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
```

**Note:** `NEXT_PUBLIC_*` variables are embedded at build time. For Docker, pass as build args:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.example.com \
  -t habit-tracker-ui .
```

## Authentication (Keycloak)

### Configuration

- **Realm:** `habit-tracker`
- **Client ID:** `habit-tracker-ui`
- **PKCE:** S256 (required)
- **Init Mode:** `check-sso` (silent auth check on load)

### Auth Flow

1. `KeycloakProvider` initializes Keycloak on mount
2. If user has valid session, tokens are loaded automatically
3. Unauthenticated users see login/register prompt (`AuthRequired` component)
4. Tokens auto-refresh every 30 seconds (or on expiry)
5. All API requests include `Authorization: Bearer <token>` header

### Key Hook: `useKeycloak()`

```typescript
const {
  authenticated,  // boolean - is user logged in
  token,          // string - JWT access token
  loading,        // boolean - auth init in progress
  error,          // string - auth error message
  login,          // () => void - redirect to login
  logout,         // () => void - redirect to logout
  register,       // () => void - redirect to registration
  userInfo,       // UserInfo - user profile data
} = useKeycloak();
```

### Auth-Protected Content

Wrap content with `AuthRequired` to show login prompt for unauthenticated users:

```tsx
<AuthRequired>
  <ProtectedContent />
</AuthRequired>
```

## API Integration

### Configuration

- **Base URL:** `NEXT_PUBLIC_API_URL` (default: `http://localhost:3000`)
- **Required Headers:** `Authorization`, `x-request-id`, `Content-Type`
- **Response Format:** `{ data: T }`
- **Case Mapping:** API uses snake_case, internal types use camelCase

### Key Hook: `useApi()`

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

### API Endpoints

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

### Data Mappers

All API responses use snake_case; mappers convert to camelCase:

```typescript
// src/utils/api.ts
mapToHabit(httpHabit: HttpHabit): Habit
mapToTrackingEntry(httpEntry: HttpTrackingEntry): TrackingEntry
mapToDailyScore(httpScore: HttpDailyScore): DailyScore
```

## Core Types

### Habit

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

### Habit Status Flow

```
PENDING ──start──► ACTIVE ◄──resume── PAUSED
                     │                   ▲
                     └──pause────────────┘
                     │
              ACTIVE/PAUSED ──stop──► STOPPED
```

### Tracking Entry

```typescript
interface TrackingEntry {
  id: string;
  habitId: string;
  date: string;      // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}
```

### Daily Score

```typescript
interface DailyScore {
  date: string;
  score: number;       // 0-100 percentage
  completed: number;   // count of completed habits
  total: number;       // count of active habits
}
```

## Key Components

### HabitTable (Monthly Calendar)

The main tracking interface (`src/components/HabitTable.tsx`):

- Displays current month with habits as rows, days as columns
- **Only today's column is editable** (past/future are read-only)
- Visual highlight on current day
- Checkbox triggers `createTracking` API call
- Auto-refreshes when month changes

### HabitList (Habit Management)

Habit CRUD interface (`src/components/HabitList.tsx`):

- Lists all habits with status badges
- Action buttons: Start, Pause, Resume, Stop, Edit, Delete
- Shows weekly/monthly goals
- Triggers status transitions via `updateHabitStatus`

### ScoreDisplay (Progress Cards)

Progress visualization (`src/components/ScoreDisplay.tsx`):

- **Daily Score:** Today's completion percentage
- **Weekly Score:** Last 7 days aggregated
- **Monthly Score:** Current month aggregated

### AddHabit (Creation Dialog)

Habit creation form (`src/components/AddHabit.tsx`):

- Material-UI Dialog
- Fields: name, description, weekly goal, monthly goal
- Validates before submission
- Resets on success or cancel

### UserMenu (Auth UI)

User authentication UI (`src/components/UserMenu.tsx`):

- Shows login/register buttons when unauthenticated
- Shows avatar with dropdown when authenticated
- Menu items: Account Settings (opens Keycloak), Profile, Sign Out

## Date Handling

All dates use Luxon with English locale.

### Key Functions (`src/utils/datetime.ts`)

```typescript
getToday(): string              // Current date as YYYY-MM-DD
isToday(date: string): boolean  // Check if date is today
getDaysInMonth(year, month): string[]  // Array of all dates in month
getCurrentMonthRange(): { start, end } // Month boundaries
formatDate(date, format): string       // Format date string
```

### Date Formats

```typescript
DATE_FORMAT = "yyyy-MM-dd"           // API format
DISPLAY_DATE_FORMAT = "MMM d, yyyy"  // User display
DAY_FORMAT = "d"                     // Day number only
```

## Form Patterns

Standard pattern across all forms:

1. Separate state for each field (`useState`)
2. `loading` state during async operations
3. Form reset on success/cancel
4. Validation before submission
5. Error display via Material-UI

Example structure:
```tsx
const [name, setName] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (!name.trim()) return;
  setLoading(true);
  try {
    await createHabit({ name });
    setName("");
    onClose();
  } finally {
    setLoading(false);
  }
};
```

## Docker Deployment

### Dockerfile

Multi-stage build optimized for production:

1. **deps** - Install dependencies
2. **builder** - Build Next.js app (with build args)
3. **runner** - Minimal production image

### Build Arguments

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.example.com \
  -t ghcr.io/sunny-labs-01/habit-tracker-ui .
```

### docker-compose.yml

Designed for Portainer deployment:
- Uses GHCR image
- Exposes port 3005
- Health check on `/health`
- Named volume for data persistence

## Git Workflow

1. **Always branch from `main`:**
   ```bash
   git checkout main && git pull
   git checkout -b feature/my-feature
   ```

2. **Before committing:**
   ```bash
   npm run lint   # Must pass with no warnings
   npm run build  # Must succeed
   ```

3. **Create PR to `main`**

## Common Tasks

### Adding a New Component

1. Create file in `src/components/`
2. Use `"use client"` directive for client components
3. Import hooks: `useApi()`, `useKeycloak()` as needed
4. Export as default

### Adding a New API Method

1. Add type definitions in `src/types/`
2. Add HTTP type and mapper in `src/utils/api.ts`
3. Add method in `ApiProvider.tsx`
4. Export in context value

### Modifying Auth Flow

1. Changes go in `src/hooks/KeycloakProvider.tsx`
2. Test with Keycloak dev server
3. Verify token refresh works

## Related Projects

- **Backend API:** [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be)
- See backend CLAUDE.md for API documentation

# CLAUDE.md - Habit Tracker UI

> Quick reference for AI agents. For setup and features, see [README.md](./README.md).

## Quick Commands

```bash
npm run dev      # Dev server on port 3005 (Turbopack)
npm run build    # Production build
npm run lint     # REQUIRED before commits
npm run lint:fix # Auto-fix lint issues
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Material-UI 7, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Auth | Keycloak (keycloak-js) |
| HTTP | Axios |
| Dates | Luxon |

## Project Structure

```
habit-tracker-ui/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (provider hierarchy)
│   └── page.tsx            # Main dashboard
├── src/
│   ├── components/         # UI Components
│   ├── hooks/              # Context Providers (API, Auth, Theme)
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utilities (api mappers, datetime)
├── .claude/docs/           # Deep-dive documentation
├── Dockerfile              # Multi-stage Docker build
└── docker-compose.yml      # Portainer deployment
```

## Provider Hierarchy

```
HabitTrackerThemeProvider
  └─ KeycloakProvider (auth)
      └─ ApiProvider (state + API methods)
          └─ App Content
```

**Important:** `ApiProvider` depends on `KeycloakProvider` for the auth token.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
```

**Note:** `NEXT_PUBLIC_*` are embedded at build time. For Docker, pass as `--build-arg`.

## Key Hooks

### useKeycloak()

```typescript
const { authenticated, token, loading, login, logout, register, userInfo } = useKeycloak();
```

### useApi()

```typescript
const {
  habits, trackingEntries, dailyScores, loading, error,
  createHabit, updateHabit, deleteHabit, updateHabitStatus,
  createTracking, getTracking, getDailyScores, refreshAll,
} = useApi();
```

## Core Types

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

**Status Flow:** `PENDING → ACTIVE ↔ PAUSED → STOPPED`

## Components Overview

| Component | Purpose |
|-----------|---------|
| `HabitTable` | Monthly calendar tracking (today only editable) |
| `HabitList` | Habit CRUD with status actions |
| `ScoreDisplay` | Daily/weekly/monthly score cards |
| `AddHabit` | Habit creation dialog |
| `AuthRequired` | Auth guard wrapper |
| `UserMenu` | User avatar and dropdown |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/habits` | List/create habits |
| PUT/DELETE | `/api/habits/:id` | Update/delete habit |
| POST | `/api/habits/:id/status` | Change status |
| GET/POST | `/api/tracking` | Tracking entries |
| GET | `/api/scores/daily` | Daily scores |

**Note:** API uses snake_case; mappers in `src/utils/api.ts` convert to camelCase.

## Git Workflow

```bash
git checkout main && git pull
git checkout -b feature/my-feature
# Make changes
npm run lint   # Must pass
npm run build  # Must succeed
# Create PR to main
```

> **Important:** Always run `git branch --show-current` to confirm you are on a feature branch before committing or merging. Never commit directly to `main`.

## Docker Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.example.com \
  -t habit-tracker-ui .
```

## Deep-Dive Documentation

For detailed implementation guides, see `.claude/docs/`:

- [Authentication](/.claude/docs/authentication.md) - Keycloak setup, auth flow, hooks
- [API Integration](/.claude/docs/api-integration.md) - useApi hook, data mappers
- [Types](/.claude/docs/types.md) - All TypeScript interfaces
- [Components](/.claude/docs/components.md) - Component details, form patterns
- [Date Handling](/.claude/docs/datetime.md) - Luxon utilities

## Related Projects

- **Backend:** [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be)

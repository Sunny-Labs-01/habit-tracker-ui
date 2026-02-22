# Habit Tracker UI

A modern web application for tracking daily habits and monitoring progress, built with Next.js and Material-UI.

## Features

- ✅ **Habit Management** - Create, update, delete habits with weekly/monthly goals
- ✅ **Status Workflow** - Active, Paused, Stopped, Pending states with transitions
- ✅ **Daily Tracking** - Monthly calendar view for marking habit completion
- ✅ **Progress Scores** - Daily, weekly, and monthly completion percentages
- ✅ **Secure Authentication** - Keycloak SSO with token refresh
- ✅ **User Accounts** - Self-registration and account management
- ✅ **Date Locking** - Only today's habits are editable (past/future locked)
- ✅ **Dark/Light Mode** - Theme toggle support

## Tech Stack

- **Framework:** Next.js 16 (React 19) with App Router
- **UI Library:** Material-UI v7 + Tailwind CSS 4
- **Language:** TypeScript 5
- **Authentication:** Keycloak (OIDC/OAuth2)
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Date Handling:** Luxon

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Running backend API ([habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be))
- Keycloak server (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sunny-Labs-01/habit-tracker-ui.git
cd habit-tracker-ui

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The app will be available at `http://localhost:3005`.

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
```

**Note:** `NEXT_PUBLIC_*` variables are embedded at build time. For Docker deployments, pass them as build arguments.

## Authentication

This app uses **Keycloak** for authentication with the following configuration:

- **Realm:** `habit-tracker`
- **Client ID:** `habit-tracker-ui`
- **Auth Method:** PKCE (S256)
- **Features:** Login, logout, self-registration, token auto-refresh

Users must authenticate to access the app. Unauthenticated users see a login/register prompt.

### Auth Flow

1. App initializes Keycloak with `check-sso`
2. If not authenticated, user sees login screen
3. On login, Keycloak redirects back with tokens
4. Tokens are automatically refreshed before expiry
5. All API requests include Bearer token in Authorization header

## Available Scripts

```bash
npm run dev      # Start development server (port 3005)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint and TypeScript checks
npm run lint:fix # Fix ESLint issues automatically
```

## Project Structure

```
habit-tracker-ui/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main dashboard
├── src/
│   ├── components/         # React components
│   │   ├── AddHabit.tsx    # Create habit dialog
│   │   ├── AuthRequired.tsx# Auth wrapper component
│   │   ├── HabitList.tsx   # Habit list with actions
│   │   ├── HabitTable.tsx  # Monthly calendar view
│   │   ├── ScoreDisplay.tsx# Score cards
│   │   └── UserMenu.tsx    # User avatar/menu
│   ├── hooks/              # React context providers
│   │   ├── ApiProvider.tsx # API state management
│   │   ├── KeycloakProvider.tsx # Auth context
│   │   └── ThemeProvider.tsx    # Theme context
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── .github/workflows/      # CI/CD pipelines
├── Dockerfile              # Docker build
├── docker-compose.yml      # Docker Compose for Portainer
└── CLAUDE.md               # AI agent documentation
```

## Docker Deployment

### Building the Image

```bash
# Build with environment variables baked in
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.example.com \
  -t habit-tracker-ui .
```

### Running with Docker Compose

```bash
docker-compose up -d
```

The included `docker-compose.yml` is designed for Portainer deployment.

## Usage

1. **Sign In/Register:** Use the login button or create an account
2. **Create a Habit:** Click "Add Habit", fill in name, description, and goals
3. **Track Progress:** Check off habits in the calendar view (today only)
4. **Manage Status:** Use action buttons to start/pause/resume/stop habits
5. **View Scores:** Check completion percentages for today, week, and month

## API Integration

This frontend connects to the [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be) backend.

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/habits` | List/create habits |
| PUT/DELETE | `/api/habits/:id` | Update/delete habit |
| POST | `/api/habits/:id/status` | Change habit status |
| GET/POST | `/api/tracking` | Tracking entries |
| GET | `/api/scores/daily` | Daily scores |

See [CLAUDE.md](./CLAUDE.md) for detailed API documentation.

## Contributing

1. Pull the latest `main` branch
2. Create a new feature branch from `main`
3. Make your changes
4. Run `npm run lint` and `npm run build` before committing
5. Create a pull request to `main`

## License

ISC

## Related Projects

- [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be) - Backend API

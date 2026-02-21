# Habit Tracker UI

A modern web application for tracking daily habits and monitoring progress.

## Features

- ✅ Habit CRUD operations (Create, Read, Update, Delete)
- ✅ Habit state management (Active, Paused, Stopped, Pending)
- ✅ Daily habit tracking with calendar view
- ✅ Weekly and monthly goals per habit
- ✅ Visual progress tracking
- ✅ Daily/Weekly/Monthly score display
- ✅ Only edit today's habits (past/future locked)

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **UI Library:** Material-UI v7 + Tailwind CSS 4
- **Language:** TypeScript
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Date Handling:** Luxon

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Running backend API (see [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be))

### Installation

```bash
# Clone the repository
git clone https://github.com/Sunny-Labs-01/habit-tracker-ui.git
cd habit-tracker-ui

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

The app will be available at `http://localhost:3005`.

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend API URL
```

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
├── app/                    # Next.js app router pages
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main dashboard
├── src/
│   ├── components/         # React components
│   │   ├── AddHabit.tsx    # Create habit dialog
│   │   ├── HabitList.tsx   # Habit list with actions
│   │   ├── HabitTable.tsx  # Monthly calendar view
│   │   └── ScoreDisplay.tsx # Score cards
│   ├── hooks/              # React context providers
│   │   ├── ApiProvider.tsx # API state management
│   │   └── ThemeProvider.tsx # Theme context
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── ...
├── .github/workflows/      # CI/CD workflows
├── CLAUDE.md               # Detailed project documentation
└── README.md               # This file
```

## Usage

1. **Create a Habit:** Click "Add Habit" button, fill in name, description, and goals
2. **Track Progress:** Check off habits in the calendar view (only today is editable)
3. **Manage Status:** Use action buttons to start/pause/resume/stop habits
4. **View Scores:** Check your completion percentage for today, last 7 days, and this month

## API Integration

This frontend connects to the [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be) backend.

**API Endpoints Used:**

- `GET/POST/PUT/DELETE /api/habits` - Habit management
- `POST /api/habits/:id/status` - Status updates
- `GET/POST /api/tracking` - Tracking entries
- `GET /api/scores/daily` - Daily scores

See [CLAUDE.md](./CLAUDE.md) for detailed API documentation.

## Contributing

1. Pull the latest `main` branch
2. Create a new feature branch from `main`
3. Make your changes
4. Run `npm run lint` and `npm run build` before committing
5. Create a pull request

## License

ISC

## Related Projects

- [habit-tracker-be](https://github.com/Sunny-Labs-01/habit-tracker-be) - Backend API

# Components Deep Dive

## HabitTable (Monthly Calendar)

The main tracking interface (`src/components/HabitTable.tsx`):

- Displays current month with habits as rows, days as columns
- **Only today's column is editable** (past/future are read-only)
- Visual highlight on current day
- Checkbox triggers `createTracking` API call
- Auto-refreshes when month changes

## HabitList (Habit Management)

Habit CRUD interface (`src/components/HabitList.tsx`):

- Lists all habits with status badges
- Action buttons: Start, Pause, Resume, Stop, Edit, Delete
- Shows weekly/monthly goals
- Triggers status transitions via `updateHabitStatus`

## ScoreDisplay (Progress Cards)

Progress visualization (`src/components/ScoreDisplay.tsx`):

- **Daily Score:** Today's completion percentage
- **Weekly Score:** Last 7 days aggregated
- **Monthly Score:** Current month aggregated

## AddHabit (Creation Dialog)

Habit creation form (`src/components/AddHabit.tsx`):

- Material-UI Dialog
- Fields: name, description, weekly goal, monthly goal
- Validates before submission
- Resets on success or cancel

## UserMenu (Auth UI)

User authentication UI (`src/components/UserMenu.tsx`):

- Shows login/register buttons when unauthenticated
- Shows avatar with dropdown when authenticated
- Menu items: Account Settings (opens Keycloak), Profile, Sign Out

## Adding a New Component

1. Create file in `src/components/`
2. Use `"use client"` directive for client components
3. Import hooks: `useApi()`, `useKeycloak()` as needed
4. Export as default

## Form Patterns

Standard pattern across all forms:

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

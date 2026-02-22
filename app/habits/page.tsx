"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowLeft, Flame, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/ApiProvider";
import {
  Habit,
  HabitStatus,
  cronToFrequencyOption,
  isHabitDueOnDate,
} from "@/types/habits";
import HabitHeatmap from "@/components/HabitHeatmap";
import HabitStats, { SingleHabitStats } from "@/components/HabitStats";
import AddHabit from "@/components/AddHabit";
import AuthRequired from "@/components/AuthRequired";
import UserMenu from "@/components/UserMenu";
import { getPastDays, getToday } from "@/utils/datetime";

function getFrequencyLabel(habit: Habit): string {
  const { option, customDays } = cronToFrequencyOption(habit.frequency);
  switch (option) {
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekends":
      return "Weekends";
    case "custom":
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return customDays.map((d) => dayNames[d]).join(", ");
    default:
      return "Daily";
  }
}

function HabitCardStats({ habit }: { habit: Habit }) {
  const { trackingEntries } = useApi();

  const { currentStreak, totalCompleted } = useMemo(() => {
    const days = getPastDays(365);
    const today = getToday();
    let currentStreak = 0;
    let totalCompleted = 0;
    let streakBroken = false;

    for (const date of [...days].reverse()) {
      if (!isHabitDueOnDate(habit, date)) continue;
      const done = trackingEntries.some(
        (e) => e.habitId === habit.id && e.date === date && e.completed
      );
      if (done) {
        totalCompleted++;
        if (!streakBroken) currentStreak++;
      } else if (date !== today) {
        streakBroken = true;
      }
    }

    return { currentStreak, totalCompleted };
  }, [habit, trackingEntries]);

  return (
    <Box display="flex" alignItems="center" gap={2} flexShrink={0}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Flame size={16} style={{ color: "#f97316" }} />
        <Typography variant="body2" fontWeight="bold">
          {currentStreak}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {totalCompleted} days
      </Typography>
    </Box>
  );
}

export default function HabitsPage() {
  const router = useRouter();
  const { habits } = useApi();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const activeHabits = habits.filter((h) => h.status !== HabitStatus.STOPPED);

  // Detail view for a single habit
  if (selectedHabit) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => setSelectedHabit(null)}>
            <ArrowLeft />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Typography variant="h4" component="span">
              {selectedHabit.emoji}
            </Typography>
            <Typography variant="h4">{selectedHabit.name}</Typography>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: selectedHabit.color || "#22c55e",
                ml: 1,
              }}
            />
          </Box>
          <UserMenu />
        </Box>

        <AuthRequired>
          <Box mb={4}>
            <SingleHabitStats habit={selectedHabit} />
          </Box>

          <Box mb={4}>
            <HabitHeatmap habit={selectedHabit} title="Activity" />
          </Box>
        </AuthRequired>
      </Container>
    );
  }

  // Main habits overview
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push("/")}>
            <ArrowLeft />
          </IconButton>
          <Box>
            <Typography variant="h3">Habits</Typography>
            <Typography variant="body2" color="text.secondary">
              Build consistency with daily habits
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Habit
          </Button>
          <UserMenu />
        </Box>
      </Box>

      <AuthRequired>
        {/* Overall Stats */}
        <Box mb={4}>
          <HabitStats />
        </Box>

        {/* Per-Habit Cards */}
        {activeHabits.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" gutterBottom>
              No habits yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setAddDialogOpen(true)}
            >
              Create Your First Habit
            </Button>
          </Paper>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {activeHabits.map((habit) => (
              <Card key={habit.id} sx={{ p: 2 }}>
                {/* Card header row */}
                <Box
                  display="flex"
                  alignItems="flex-start"
                  gap={2}
                  mb={2}
                >
                  {/* Emoji avatar */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: habit.color ? `${habit.color}22` : "action.hover",
                      border: `2px solid ${habit.color || "#22c55e"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      flexShrink: 0,
                    }}
                  >
                    {habit.emoji || "✅"}
                  </Box>

                  {/* Name, frequency, description */}
                  <Box flex={1} minWidth={0}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ lineHeight: 1.3 }}
                    >
                      {habit.name}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mt={0.5}
                      flexWrap="wrap"
                    >
                      <Chip
                        label={getFrequencyLabel(habit)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          bgcolor: habit.color ? `${habit.color}22` : "action.hover",
                          color: habit.color || "text.secondary",
                          border: `1px solid ${habit.color || "divider"}`,
                        }}
                      />
                      {habit.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: { xs: 160, sm: 360, md: 560 },
                          }}
                        >
                          {habit.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Streak + days + menu */}
                  <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                    <HabitCardStats habit={habit} />
                    <IconButton
                      size="small"
                      onClick={() => setSelectedHabit(habit)}
                      title="View details"
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Per-habit heatmap */}
                <HabitHeatmap habit={habit} />
              </Card>
            ))}
          </Box>
        )}

        <AddHabit
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
        />
      </AuthRequired>
    </Container>
  );
}

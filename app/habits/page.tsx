"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/ApiProvider";
import { Habit, cronToFrequencyOption } from "@/types/habits";
import HabitHeatmap from "@/components/HabitHeatmap";
import HabitStats, { SingleHabitStats } from "@/components/HabitStats";
import AddHabit from "@/components/AddHabit";
import AuthRequired from "@/components/AuthRequired";
import UserMenu from "@/components/UserMenu";

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

export default function HabitsPage() {
  const router = useRouter();
  const { habits } = useApi();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const activeHabits = habits.filter((h) => h.status === "active");

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
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push("/")}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h3">Habits</Typography>
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
          <Typography variant="h5" gutterBottom>
            Overview
          </Typography>
          <HabitStats />
        </Box>

        {/* Overall Heatmap */}
        <Box mb={4}>
          <HabitHeatmap title="Activity Heatmap" />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Habits List */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Your Habits
          </Typography>
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
            <List disablePadding>
              {activeHabits.map((habit) => (
                <Card key={habit.id} sx={{ mb: 2 }}>
                  <ListItemButton onClick={() => setSelectedHabit(habit)}>
                    <Box
                      display="flex"
                      alignItems="center"
                      width="100%"
                      gap={2}
                    >
                      {/* Emoji */}
                      <Typography variant="h5" component="span">
                        {habit.emoji || "✅"}
                      </Typography>

                      {/* Color indicator */}
                      <Box
                        sx={{
                          width: 8,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: habit.color || "#22c55e",
                        }}
                      />

                      {/* Name and frequency */}
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {habit.name}
                        </Typography>
                        <Chip
                          label={getFrequencyLabel(habit)}
                          size="small"
                          variant="outlined"
                          sx={{
                            mt: 0.5,
                            borderColor: habit.color || "primary.main",
                            color: habit.color || "primary.main",
                          }}
                        />
                      </Box>

                      {/* Arrow */}
                      <ChevronRight size={24} />
                    </Box>
                  </ListItemButton>
                </Card>
              ))}
            </List>
          )}
        </Box>

        <AddHabit
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
        />
      </AuthRequired>
    </Container>
  );
}

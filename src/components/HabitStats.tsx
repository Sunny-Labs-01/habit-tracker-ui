"use client";

import { useApi } from "@/hooks/ApiProvider";
import { Habit, HabitStatus, isHabitDueOnDate, cronToFrequencyOption } from "@/types/habits";
import { getPastDays, getToday } from "@/utils/datetime";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { Flame, Trophy, Target, Calendar } from "lucide-react";
import { useMemo } from "react";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Box sx={{ color: color || "primary.main" }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

type HabitStatsProps = {
  habit?: Habit; // If provided, show stats for single habit
};

export default function HabitStats({ habit }: HabitStatsProps) {
  const { habits, trackingEntries } = useApi();

  const stats = useMemo(() => {
    const targetHabits = habit ? [habit] : habits.filter((h) => h.status === HabitStatus.ACTIVE);
    const days = getPastDays(365); // Look back 1 year
    const today = getToday();

    // Initialize stats
    let currentStreak = 0;
    let longestStreak = 0;
    let totalDue = 0;
    let totalCompleted = 0;
    let tempStreak = 0;

    // Calculate streaks and completion rate
    // Go backwards from today
    const reverseDays = [...days].reverse();

    for (const date of reverseDays) {
      const habitsDueToday = targetHabits.filter((h) => isHabitDueOnDate(h, date));
      
      if (habitsDueToday.length === 0) continue;
      
      totalDue += habitsDueToday.length;
      
      const completedToday = habitsDueToday.filter((h) =>
        trackingEntries.some(
          (e) => e.habitId === h.id && e.date === date && e.completed
        )
      ).length;
      
      totalCompleted += completedToday;

      // For streak calculation - all habits due must be completed
      const allCompletedToday = completedToday === habitsDueToday.length;

      if (date === today || date === reverseDays[reverseDays.indexOf(date) - 1]) {
        // Count current streak
        if (allCompletedToday) {
          currentStreak++;
          tempStreak++;
        } else if (date !== today) {
          // Break in streak (excluding today, which might not be done yet)
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      } else {
        if (allCompletedToday) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    // Calculate completion rate
    const completionRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0;

    // Calculate this week's completion
    const weekDays = getPastDays(7);
    let weekDue = 0;
    let weekCompleted = 0;
    
    for (const date of weekDays) {
      const habitsDueToday = targetHabits.filter((h) => isHabitDueOnDate(h, date));
      weekDue += habitsDueToday.length;
      weekCompleted += habitsDueToday.filter((h) =>
        trackingEntries.some(
          (e) => e.habitId === h.id && e.date === date && e.completed
        )
      ).length;
    }
    
    const weekRate = weekDue > 0 ? Math.round((weekCompleted / weekDue) * 100) : 0;

    return {
      currentStreak,
      longestStreak,
      completionRate,
      weekRate,
      totalHabits: targetHabits.length,
    };
  }, [habits, habit, trackingEntries]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<Flame size={24} />}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          color="#f97316"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<Trophy size={24} />}
          label="Longest Streak"
          value={`${stats.longestStreak} days`}
          color="#eab308"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<Target size={24} />}
          label="This Week"
          value={`${stats.weekRate}%`}
          color="#22c55e"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<Calendar size={24} />}
          label="All Time"
          value={`${stats.completionRate}%`}
          color="#3b82f6"
        />
      </Grid>
    </Grid>
  );
}

// Single habit detailed stats
export function SingleHabitStats({ habit }: { habit: Habit }) {
  const { trackingEntries } = useApi();
  
  const stats = useMemo(() => {
    const days = getPastDays(365);
    const today = getToday();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalDue = 0;
    let totalCompleted = 0;

    const reverseDays = [...days].reverse();

    for (const date of reverseDays) {
      if (!isHabitDueOnDate(habit, date)) continue;
      
      totalDue++;
      
      const completed = trackingEntries.some(
        (e) => e.habitId === habit.id && e.date === date && e.completed
      );
      
      if (completed) {
        totalCompleted++;
        tempStreak++;
        if (date === today || reverseDays.indexOf(date) === 0) {
          currentStreak = tempStreak;
        }
      } else if (date !== today) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (currentStreak === 0) {
          currentStreak = 0;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    const completionRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0;

    // Get frequency display
    const { option, customDays } = cronToFrequencyOption(habit.frequency);
    let frequencyDisplay = "";
    switch (option) {
      case "daily":
        frequencyDisplay = "Every day";
        break;
      case "weekdays":
        frequencyDisplay = "Weekdays";
        break;
      case "weekends":
        frequencyDisplay = "Weekends";
        break;
      case "custom":
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        frequencyDisplay = customDays.map((d) => dayNames[d]).join(", ");
        break;
    }

    return {
      currentStreak,
      longestStreak,
      completionRate,
      totalCompleted,
      totalDue,
      frequencyDisplay,
    };
  }, [habit, trackingEntries]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<Flame size={24} />}
            label="Current Streak"
            value={`${stats.currentStreak}`}
            color={habit.color || "#f97316"}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<Trophy size={24} />}
            label="Best Streak"
            value={`${stats.longestStreak}`}
            color={habit.color || "#eab308"}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<Target size={24} />}
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            color={habit.color || "#22c55e"}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<Calendar size={24} />}
            label="Schedule"
            value={stats.frequencyDisplay}
            color={habit.color || "#3b82f6"}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

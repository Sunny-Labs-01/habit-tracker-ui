"use client";

import { useApi } from "@/hooks/ApiProvider";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { getCurrentMonthRange, getToday } from "@/utils/datetime";

export default function ScoreDisplay() {
  const { dailyScores, getDailyScores } = useApi();

  useEffect(() => {
    // Load scores for current month
    const { start, end } = getCurrentMonthRange();
    getDailyScores(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate today's score
  const today = getToday();
  const todayScore = dailyScores.find((s) => s.date === today);

  // Calculate weekly score (last 7 days)
  const last7Days = dailyScores.slice(-7);
  const weeklyTotal = last7Days.reduce((sum, s) => sum + s.completedHabits, 0);
  const weeklyPossible = last7Days.reduce((sum, s) => sum + s.totalHabits, 0);
  const weeklyPercentage =
    weeklyPossible > 0 ? Math.round((weeklyTotal / weeklyPossible) * 100) : 0;

  // Calculate monthly score
  const monthlyTotal = dailyScores.reduce(
    (sum, s) => sum + s.completedHabits,
    0
  );
  const monthlyPossible = dailyScores.reduce(
    (sum, s) => sum + s.totalHabits,
    0
  );
  const monthlyPercentage =
    monthlyPossible > 0
      ? Math.round((monthlyTotal / monthlyPossible) * 100)
      : 0;

  return (
    <Box display="flex" gap={2} mb={3}>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="h6">Today</Typography>
          <Typography variant="h3" color="primary">
            {todayScore?.percentage || 0}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {todayScore?.completedHabits || 0} / {todayScore?.totalHabits || 0}{" "}
            habits
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="h6">Last 7 Days</Typography>
          <Typography variant="h3" color="primary">
            {weeklyPercentage}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {weeklyTotal} / {weeklyPossible} habits
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="h6">This Month</Typography>
          <Typography variant="h3" color="primary">
            {monthlyPercentage}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {monthlyTotal} / {monthlyPossible} habits
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

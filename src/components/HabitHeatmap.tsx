"use client";

import { useApi } from "@/hooks/ApiProvider";
import { Habit, isHabitDueOnDate } from "@/types/habits";
import { formatHeatmapDate, getPastDays, getDayOfWeek } from "@/utils/datetime";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const WEEKS_TO_SHOW = 52; // ~1 year
const DAYS_TO_SHOW = WEEKS_TO_SHOW * 7;

// Color scale for heatmap (0% to 100%)
const getHeatmapColor = (percentage: number, baseColor?: string): string => {
  if (percentage === 0) return "#161b22"; // Empty
  
  // If we have a base color, use it with varying opacity
  if (baseColor) {
    if (percentage <= 25) return `${baseColor}40`; // 25% opacity
    if (percentage <= 50) return `${baseColor}80`; // 50% opacity
    if (percentage <= 75) return `${baseColor}b0`; // 69% opacity
    return baseColor; // Full color
  }
  
  // Default green scale (GitHub style)
  if (percentage <= 25) return "#0e4429";
  if (percentage <= 50) return "#006d32";
  if (percentage <= 75) return "#26a641";
  return "#39d353";
};

type HabitHeatmapProps = {
  habit?: Habit; // If provided, show heatmap for single habit
  title?: string;
};

export default function HabitHeatmap({ habit, title }: HabitHeatmapProps) {
  const { habits, trackingEntries, getTracking } = useApi();
  const [loaded, setLoaded] = useState(false);

  const days = useMemo(() => getPastDays(DAYS_TO_SHOW), []);

  useEffect(() => {
    // Load tracking data for the past year
    const startDate = days[0];
    const endDate = days[days.length - 1];
    getTracking({ startDate, endDate }).then(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate completion data for each day
  const heatmapData = useMemo(() => {
    if (!loaded) return [];

    const targetHabits = habit ? [habit] : habits.filter((h) => h.status === "active");

    return days.map((date) => {
      // Count habits due on this day
      const habitsDueToday = targetHabits.filter((h) => isHabitDueOnDate(h, date));
      const totalDue = habitsDueToday.length;

      if (totalDue === 0) {
        return { date, completed: 0, total: 0, percentage: 0 };
      }

      // Count completed habits
      const completed = habitsDueToday.filter((h) =>
        trackingEntries.some(
          (e) => e.habitId === h.id && e.date === date && e.completed
        )
      ).length;

      const percentage = Math.round((completed / totalDue) * 100);

      return { date, completed, total: totalDue, percentage };
    });
  }, [days, habits, habit, trackingEntries, loaded]);

  // Organize into weeks (columns) with days (rows)
  const weeks = useMemo(() => {
    const result: (typeof heatmapData)[] = [];
    let currentWeek: typeof heatmapData = [];

    // Start with empty cells to align to week start
    const firstDayOfWeek = getDayOfWeek(days[0]);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", completed: 0, total: 0, percentage: -1 });
    }

    heatmapData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [heatmapData, days]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Paper sx={{ p: 2, overflow: "auto" }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box display="flex" gap={0.5}>
        {/* Day labels */}
        <Box display="flex" flexDirection="column" gap={0.5} mr={1}>
          {dayLabels.map((label, idx) => (
            <Box
              key={label}
              sx={{
                width: 12,
                height: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {idx % 2 === 1 && (
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                >
                  {label}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Heatmap grid */}
        <Box display="flex" gap={0.5}>
          {weeks.map((week, weekIdx) => (
            <Box key={weekIdx} display="flex" flexDirection="column" gap={0.5}>
              {week.map((day, dayIdx) => (
                <Tooltip
                  key={`${weekIdx}-${dayIdx}`}
                  title={
                    day.percentage >= 0 && day.date
                      ? `${formatHeatmapDate(day.date)}: ${day.completed}/${day.total} completed (${day.percentage}%)`
                      : ""
                  }
                  arrow
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      bgcolor:
                        day.percentage < 0
                          ? "transparent"
                          : getHeatmapColor(day.percentage, habit?.color),
                      cursor: day.percentage >= 0 ? "pointer" : "default",
                      transition: "all 0.1s",
                      "&:hover": {
                        transform: day.percentage >= 0 ? "scale(1.2)" : "none",
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box display="flex" alignItems="center" gap={1} mt={2} justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary">
          Less
        </Typography>
        {[0, 25, 50, 75, 100].map((pct) => (
          <Box
            key={pct}
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: getHeatmapColor(pct, habit?.color),
            }}
          />
        ))}
        <Typography variant="caption" color="text.secondary">
          More
        </Typography>
      </Box>
    </Paper>
  );
}

"use client";

import { useApi } from "@/hooks/ApiProvider";
import { Habit, HabitStatus, isHabitDueOnDate } from "@/types/habits";
import { formatHeatmapDate, getPastDays, getDayOfWeek, getToday, getCurrentYearDays } from "@/utils/datetime";
import { Box, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { useMemo } from "react";

const EDITABLE_DAYS = 6; // today + 5 days back

// Color scale for heatmap (>0% to 100%)
const getHeatmapColor = (percentage: number, baseColor?: string): string => {
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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type HabitHeatmapProps = {
  habit?: Habit; // If provided, show heatmap for single habit
  title?: string;
};

export default function HabitHeatmap({ habit, title }: HabitHeatmapProps) {
  const theme = useTheme();
  const emptyColor = theme.palette.mode === "dark" ? "#2d333b" : "#ebedf0";
  const { habits, trackingEntries, trackingLoaded, getTracking, createTracking, updateTracking } = useApi();
  // Map date → existing entry for this habit (used to decide create vs update)
  const trackedByDate = useMemo(
    () => new Map(
      habit
        ? trackingEntries.filter((e) => e.habitId === habit.id).map((e) => [e.date, e])
        : []
    ),
    [habit, trackingEntries]
  );

  const today = useMemo(() => getToday(), []);
  const editableDateSet = useMemo(() => new Set(getPastDays(EDITABLE_DAYS)), []);
  const days = useMemo(() => getCurrentYearDays(), []);

  // Calculate completion data for each day
  const heatmapData = useMemo(() => {
    if (!trackingLoaded) return [];

    const targetHabits = habit ? [habit] : habits.filter((h) => h.status === HabitStatus.ACTIVE);

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
  }, [days, habits, habit, trackingEntries, trackingLoaded]);

  // Organize into weeks (columns) with days (rows)
  const { weeks, monthLabelByCol } = useMemo(() => {
    const result: (typeof heatmapData)[] = [];
    let currentWeek: typeof heatmapData = [];

    // Start with empty cells to align to week start (Sunday)
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

    // Build month label positions: for each month, find the column where its first day falls
    const padding = getDayOfWeek(days[0]);
    const labelByCol: (string | null)[] = Array(result.length).fill(null);

    let currentMonth = -1;
    days.forEach((date, dayIndex) => {
      const month = parseInt(date.slice(5, 7), 10) - 1; // 0-indexed
      if (month !== currentMonth) {
        currentMonth = month;
        const col = Math.floor((dayIndex + padding) / 7);
        if (col < result.length) {
          labelByCol[col] = MONTH_NAMES[month];
        }
      }
    });

    return { weeks: result, monthLabelByCol: labelByCol };
  }, [heatmapData, days]);

  const handleCellClick = async (date: string, total: number) => {
    if (!habit || !editableDateSet.has(date) || !trackingLoaded || total === 0) return;
    try {
      const existing = trackedByDate.get(date);
      if (existing) {
        await updateTracking({ id: existing.id, completed: !existing.completed });
      } else {
        await createTracking({ habitId: habit.id, date, completed: true });
      }
    } catch {
      // Re-sync on any error
      await getTracking({ dateFrom: days[0], dateTo: days[days.length - 1] });
    }
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Paper sx={{ p: 2, overflow: "auto" }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box display="flex" gap={0.5}>
        {/* Day labels column */}
        <Box display="flex" flexDirection="column" gap={0.5} mr={1}>
          {/* Spacer to align with month labels row */}
          <Box sx={{ height: 16 }} />
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

        {/* Heatmap grid + month labels */}
        <Box display="flex" flexDirection="column" gap={0.5}>
          {/* Month labels row */}
          <Box display="flex" gap={0.5}>
            {weeks.map((_, weekIdx) => (
              <Box
                key={weekIdx}
                sx={{
                  width: 12,
                  height: 14,
                  display: "flex",
                  alignItems: "center",
                  overflow: "visible",
                }}
              >
                {monthLabelByCol[weekIdx] && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.6rem",
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {monthLabelByCol[weekIdx]}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Cell grid */}
          <Box display="flex" gap={0.5}>
            {weeks.map((week, weekIdx) => (
              <Box key={weekIdx} display="flex" flexDirection="column" gap={0.5}>
                {week.map((day, dayIdx) => {
                  const isToday = day.date === today;
                  const isEditable =
                    !!habit &&
                    trackingLoaded &&
                    day.total > 0 &&
                    editableDateSet.has(day.date);

                  return (
                    <Tooltip
                      key={`${weekIdx}-${dayIdx}`}
                      title={
                        day.percentage >= 0 && day.date
                          ? `${formatHeatmapDate(day.date)}: ${day.completed}/${day.total} completed (${day.percentage}%)${isEditable ? " · click to toggle" : ""}`
                          : ""
                      }
                      arrow
                    >
                      <Box
                        onClick={() =>
                          isEditable &&
                          handleCellClick(day.date, day.total)
                        }
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: 0.5,
                          bgcolor:
                            day.percentage < 0
                              ? "transparent"
                              : day.percentage === 0
                              ? habit?.color
                                ? `${habit.color}18`
                                : emptyColor
                              : getHeatmapColor(day.percentage, habit?.color),
                          cursor: isEditable ? "pointer" : "default",
                          transition: "all 0.15s",
                          ...(isToday &&
                            day.percentage >= 0 && {
                              outline: `2px solid ${theme.palette.text.primary}`,
                              outlineOffset: "1px",
                            }),
                          "&:hover": isEditable
                            ? {
                                transform: "scale(1.3)",
                                opacity: 0.85,
                                outline: `2px solid ${theme.palette.text.secondary}`,
                                outlineOffset: "1px",
                              }
                            : {
                                transform: day.percentage >= 0 ? "scale(1.1)" : "none",
                              },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>
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
              bgcolor:
                pct === 0
                  ? habit?.color
                    ? `${habit.color}18`
                    : emptyColor
                  : getHeatmapColor(pct, habit?.color),
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

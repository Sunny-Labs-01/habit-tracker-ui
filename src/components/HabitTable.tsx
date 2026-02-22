"use client";

import { useApi } from "@/hooks/ApiProvider";
import { isHabitDueOnDate } from "@/types/habits";
import { getDaysInMonth, isToday } from "@/utils/datetime";
import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export default function HabitTable() {
  const { habits, trackingEntries, createTracking, getTracking } = useApi();
  const [selectedMonth] = useState<number>(DateTime.now().month);
  const [selectedYear] = useState<number>(DateTime.now().year);

  const days = getDaysInMonth(selectedYear, selectedMonth);

  useEffect(() => {
    // Load tracking data for the selected month
    const startDate = days[0];
    const endDate = days[days.length - 1];
    getTracking({ startDate, endDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    const entry = trackingEntries.find(
      (e) => e.habitId === habitId && e.date === date
    );
    return entry?.completed || false;
  };

  const handleToggle = async (habitId: string, date: string) => {
    // Only allow editing today
    if (!isToday(date)) {
      return;
    }

    const isCompleted = isHabitCompletedOnDate(habitId, date);
    await createTracking({
      habitId,
      date,
      completed: !isCompleted,
    });

    // Refresh tracking data
    const startDate = days[0];
    const endDate = days[days.length - 1];
    await getTracking({ startDate, endDate });
  };

  // Filter to only active habits
  const activeHabits = habits.filter((h) => h.status === "active");

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Habit Tracker -{" "}
        {DateTime.fromObject({ month: selectedMonth }).toFormat("MMMM")}{" "}
        {selectedYear}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 150 }}>Habit</TableCell>
              {days.map((day) => {
                const dt = DateTime.fromISO(day);
                const dayNum = dt.day;
                const dayOfWeek = dt.toFormat("ccc");
                const isTodayCell = isToday(day);
                return (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      bgcolor: isTodayCell ? "primary.light" : "transparent",
                      color: isTodayCell ? "primary.contrastText" : "inherit",
                      fontWeight: isTodayCell ? "bold" : "normal",
                      minWidth: 40,
                      px: 0.5,
                    }}
                  >
                    <Tooltip title={dayOfWeek} arrow>
                      <span>{dayNum}</span>
                    </Tooltip>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {activeHabits.map((habit) => (
              <TableRow key={habit.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {habit.emoji && (
                      <span style={{ fontSize: "1.1rem" }}>{habit.emoji}</span>
                    )}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: habit.color || "#22c55e",
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" noWrap>
                      {habit.name}
                    </Typography>
                  </Box>
                </TableCell>
                {days.map((day) => {
                  const isDue = isHabitDueOnDate(habit, day);
                  const isCompleted = isHabitCompletedOnDate(habit.id, day);
                  const isTodayCell = isToday(day);
                  const canEdit = isTodayCell && isDue;

                  return (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        bgcolor: isTodayCell
                          ? "primary.light"
                          : !isDue
                            ? "action.disabledBackground"
                            : "transparent",
                        px: 0.5,
                      }}
                    >
                      {isDue ? (
                        <Checkbox
                          checked={isCompleted}
                          onChange={() => handleToggle(habit.id, day)}
                          disabled={!canEdit}
                          size="small"
                          sx={{
                            p: 0.5,
                            color: habit.color || "primary.main",
                            "&.Mui-checked": {
                              color: habit.color || "primary.main",
                            },
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            —
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

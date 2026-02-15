"use client";

import { useApi } from "@/hooks/ApiProvider";
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
  Typography,
} from "@mui/material";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export default function HabitTable() {
  const { habits, trackingEntries, createTracking, getTracking } = useApi();
  const [selectedMonth] = useState<number>(
    DateTime.now().month
  );
  const [selectedYear] = useState<number>(
    DateTime.now().year
  );

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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Habit Tracker - {DateTime.fromObject({ month: selectedMonth }).toFormat("MMMM")} {selectedYear}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Habit</TableCell>
              {days.map((day) => {
                const dayNum = DateTime.fromISO(day).day;
                const isTodayCell = isToday(day);
                return (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      bgcolor: isTodayCell ? "primary.light" : "transparent",
                      color: isTodayCell ? "primary.contrastText" : "inherit",
                      fontWeight: isTodayCell ? "bold" : "normal",
                    }}
                  >
                    {dayNum}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {habits.map((habit) => (
              <TableRow key={habit.id}>
                <TableCell>{habit.name}</TableCell>
                {days.map((day) => {
                  const isCompleted = isHabitCompletedOnDate(habit.id, day);
                  const isTodayCell = isToday(day);
                  const canEdit = isTodayCell;

                  return (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        bgcolor: isTodayCell
                          ? "primary.light"
                          : "transparent",
                      }}
                    >
                      <Checkbox
                        checked={isCompleted}
                        onChange={() => handleToggle(habit.id, day)}
                        disabled={!canEdit}
                        size="small"
                      />
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

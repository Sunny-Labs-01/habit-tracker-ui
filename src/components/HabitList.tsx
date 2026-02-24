"use client";

import { useApi } from "@/hooks/ApiProvider";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import { Edit, Trash2, Play, Pause, Square, RotateCcw } from "lucide-react";
import { Habit, HabitStatus } from "@/types/habits";
import { useState } from "react";
import EditHabit from "@/components/EditHabit";

export default function HabitList() {
  const { habits, updateHabitStatus, deleteHabit } = useApi();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const getStatusColor = (status: HabitStatus) => {
    switch (status) {
      case HabitStatus.ACTIVE:
        return "success";
      case HabitStatus.PAUSED:
        return "warning";
      case HabitStatus.STOPPED:
        return "error";
      default:
        return "default";
    }
  };

  const handleStatusChange = async (id: string, status: HabitStatus) => {
    await updateHabitStatus(id, { status });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      await deleteHabit(id);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Your Habits
      </Typography>
      {habits.length === 0 ? (
        <Typography color="text.secondary">
          No habits yet. Create your first habit!
        </Typography>
      ) : (
        habits.map((habit) => (
          <Card key={habit.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flex={1}>
                  <Typography variant="h6">{habit.name}</Typography>
                  {habit.description && (
                    <Typography variant="body2" color="text.secondary">
                      {habit.description}
                    </Typography>
                  )}
                  <Box mt={1} display="flex" gap={1} alignItems="center">
                    <Chip
                      label={habit.status}
                      color={getStatusColor(habit.status)}
                      size="small"
                    />
                    {habit.goals?.weekly && (
                      <Typography variant="caption" color="text.secondary">
                        Weekly goal: {habit.goals.weekly}
                      </Typography>
                    )}
                    {habit.goals?.monthly && (
                      <Typography variant="caption" color="text.secondary">
                        Monthly goal: {habit.goals.monthly}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  {habit.status === HabitStatus.ACTIVE && (
                    <>
                      <IconButton
                        onClick={() => handleStatusChange(habit.id, HabitStatus.PAUSED)}
                        color="warning"
                        size="small"
                      >
                        <Pause size={18} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusChange(habit.id, HabitStatus.STOPPED)}
                        color="error"
                        size="small"
                      >
                        <Square size={18} />
                      </IconButton>
                    </>
                  )}
                  {habit.status === HabitStatus.PAUSED && (
                    <>
                      <IconButton
                        onClick={() => handleStatusChange(habit.id, HabitStatus.ACTIVE)}
                        color="success"
                        size="small"
                      >
                        <RotateCcw size={18} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusChange(habit.id, HabitStatus.STOPPED)}
                        color="error"
                        size="small"
                      >
                        <Square size={18} />
                      </IconButton>
                    </>
                  )}
                  {habit.status === HabitStatus.STOPPED && (
                    <IconButton
                      onClick={() => handleStatusChange(habit.id, HabitStatus.ACTIVE)}
                      color="success"
                      size="small"
                    >
                      <Play size={18} />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => setEditingHabit(habit)}>
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(habit.id)}
                    color="error"
                    size="small"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
      {editingHabit && (
        <EditHabit
          open={!!editingHabit}
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </Box>
  );
}

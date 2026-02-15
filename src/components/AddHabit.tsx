"use client";

import { useApi } from "@/hooks/ApiProvider";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

type AddHabitProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddHabit({ open, onClose }: AddHabitProps) {
  const { createHabit } = useApi();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a habit name");
      return;
    }

    setLoading(true);
    try {
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        goals: {
          weekly: weeklyGoal ? parseInt(weeklyGoal) : undefined,
          monthly: monthlyGoal ? parseInt(monthlyGoal) : undefined,
        },
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setWeeklyGoal("");
    setMonthlyGoal("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Habit</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Habit Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Weekly Goal (days per week)"
            type="number"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(e.target.value)}
            fullWidth
            inputProps={{ min: 1, max: 7 }}
          />
          <TextField
            label="Monthly Goal (days per month)"
            type="number"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(e.target.value)}
            fullWidth
            inputProps={{ min: 1, max: 31 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating..." : "Create Habit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import HabitList from "@/components/HabitList";
import HabitTable from "@/components/HabitTable";
import AddHabit from "@/components/AddHabit";
import ScoreDisplay from "@/components/ScoreDisplay";

export default function Home() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">Habit Tracker</Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Habit
        </Button>
      </Box>

      <ScoreDisplay />

      <Box mb={4}>
        <HabitTable />
      </Box>

      <HabitList />

      <AddHabit open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
    </Container>
  );
}

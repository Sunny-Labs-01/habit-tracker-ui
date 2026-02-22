"use client";

import { useApi } from "@/hooks/ApiProvider";
import {
  DAYS_OF_WEEK,
  DEFAULT_EMOJIS,
  FrequencyOption,
  frequencyToCron,
  HABIT_COLORS,
} from "@/types/habits";
import { Check } from "lucide-react";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
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
  const [frequency, setFrequency] = useState<FrequencyOption>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(HABIT_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState("✅");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    try {
      const cronPattern = frequencyToCron(frequency, customDays);
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency: cronPattern,
        emoji: selectedEmoji,
        color: selectedColor,
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
    setFrequency("daily");
    setCustomDays([]);
    setSelectedColor(HABIT_COLORS[0]);
    setSelectedEmoji("✅");
    onClose();
  };

  const handleFrequencyChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFrequency: FrequencyOption | null
  ) => {
    if (newFrequency !== null) {
      setFrequency(newFrequency);
      if (newFrequency !== "custom") {
        setCustomDays([]);
      }
    }
  };

  const handleDayToggle = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const getFrequencyLabel = (freq: FrequencyOption): string => {
    switch (freq) {
      case "daily":
        return "Daily";
      case "weekdays":
        return "Weekdays";
      case "weekends":
        return "Weekends";
      case "custom":
        return "Pick days";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>New Habit</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          {/* Habit Name Input */}
          <TextField
            placeholder="Habit name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            slotProps={{
              input: {
                endAdornment: name.trim() && (
                  <InputAdornment position="end">
                    <Check size={20} color="#22c55e" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Description Input */}
          <TextField
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
          />

          {/* Repeat Options */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Repeat
            </Typography>
            <ToggleButtonGroup
              value={frequency}
              exclusive
              onChange={handleFrequencyChange}
              size="small"
              sx={{
                flexWrap: "wrap",
                gap: 1,
                "& .MuiToggleButton-root": {
                  borderRadius: "20px !important",
                  border: "1px solid",
                  borderColor: "divider",
                  px: 2,
                  py: 0.5,
                  textTransform: "none",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderColor: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                },
              }}
            >
              {(["daily", "weekdays", "weekends", "custom"] as FrequencyOption[]).map(
                (freq) => (
                  <ToggleButton key={freq} value={freq}>
                    {getFrequencyLabel(freq)}
                  </ToggleButton>
                )
              )}
            </ToggleButtonGroup>

            {/* Custom Days Selection */}
            <Collapse in={frequency === "custom"}>
              <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                {DAYS_OF_WEEK.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={customDays.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        size="small"
                      />
                    }
                    label={day.label}
                    sx={{
                      mr: 0,
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                ))}
              </Box>
            </Collapse>
          </Box>

          {/* Color Palette */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Color
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {HABIT_COLORS.map((color) => (
                <IconButton
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: color,
                    border: selectedColor === color ? "3px solid" : "2px solid",
                    borderColor:
                      selectedColor === color ? "common.white" : "transparent",
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 2px ${color}`
                        : "none",
                    transform: selectedColor === color ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: color,
                      transform: "scale(1.1)",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Emoji Selector */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Emoji
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {DEFAULT_EMOJIS.map((emoji) => (
                <IconButton
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: "1.25rem",
                    border:
                      selectedEmoji === emoji
                        ? "2px solid"
                        : "1px solid transparent",
                    borderColor:
                      selectedEmoji === emoji ? "primary.main" : "transparent",
                    bgcolor:
                      selectedEmoji === emoji
                        ? "action.selected"
                        : "transparent",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {emoji}
                </IconButton>
              ))}
            </Box>
          </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

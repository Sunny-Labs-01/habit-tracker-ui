"use client";

import { PropsWithChildren } from "react";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import { LogIn, UserPlus } from "lucide-react";
import { useKeycloak } from "@/hooks/KeycloakProvider";

export default function AuthRequired({ children }: PropsWithChildren) {
  const { authenticated, loading, error, login, register } = useKeycloak();

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <Paper
          elevation={2}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  // Not authenticated - show login prompt
  if (!authenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <Paper
          elevation={2}
          sx={{
            p: 4,
            maxWidth: 450,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Welcome to Habit Tracker
          </Typography>
          <Typography color="text.secondary" paragraph>
            Track your daily habits, build consistency, and achieve your goals.
            Sign in or create an account to get started.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" mt={3}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<LogIn size={18} />}
              onClick={login}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<UserPlus size={18} />}
              onClick={register}
            >
              Create Account
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}

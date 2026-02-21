"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { LogOut, User, Settings } from "lucide-react";
import { useKeycloak } from "@/hooks/KeycloakProvider";

export default function UserMenu() {
  const { authenticated, loading, login, logout, register, userInfo } =
    useKeycloak();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleAccountManagement = () => {
    handleClose();
    // Open Keycloak account management in new tab
    const keycloakUrl =
      process.env.NEXT_PUBLIC_KEYCLOAK_URL ||
      "https://kc.lab.ishtiaquezafar.com";
    window.open(
      `${keycloakUrl}/realms/habit-tracker/account`,
      "_blank"
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  // Not authenticated - show login/register buttons
  if (!authenticated) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Button variant="outlined" onClick={login}>
          Sign In
        </Button>
        <Button variant="contained" onClick={register}>
          Register
        </Button>
      </Box>
    );
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (userInfo?.name) {
      const parts = userInfo.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return userInfo.name[0].toUpperCase();
    }
    if (userInfo?.preferred_username) {
      return userInfo.preferred_username[0].toUpperCase();
    }
    return "U";
  };

  const displayName =
    userInfo?.name || userInfo?.preferred_username || userInfo?.email || "User";

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
          {getInitials()}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 220,
              overflow: "visible",
              mt: 1.5,
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {displayName}
          </Typography>
          {userInfo?.email && (
            <Typography variant="body2" color="text.secondary">
              {userInfo.email}
            </Typography>
          )}
        </Box>

        <Divider />

        <MenuItem onClick={handleAccountManagement}>
          <ListItemIcon>
            <Settings size={18} />
          </ListItemIcon>
          <ListItemText>Account Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <User size={18} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import ListItemIcon from "@mui/material/ListItemIcon";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useAuth } from "../context/auth";
import ModeToggle from "./ModeToggle";

const DRAWER_WIDTH = 240;
const ACTIVE_COLOR = "#661FFF";
const PANUSER_API_URL = import.meta.env.VITE_PANUSER_API_URL ?? "http://localhost:9095";

export default function NavBar() {
  const { username, setUsername, ssoResponse } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  async function handleLogout() {
    const idToken = typeof ssoResponse?.id_token === "string" ? ssoResponse.id_token : null;
    setUsername("");
    setLogoutDialogOpen(false);
    if (idToken) {
      try {
        const body = new URLSearchParams({ id_token_hint: idToken });
        await fetch(`${PANUSER_API_URL}/connect/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
      } catch {
        // best-effort — local state is already cleared
      }
    }
    navigate("/");
  }

  function activeStyles(path: string) {
    return pathname === path
      ? { color: ACTIVE_COLOR, backgroundColor: "rgba(102, 31, 255, 0.12)", "&:hover": { backgroundColor: "rgba(102, 31, 255, 0.18)" } }
      : {};
  }

  function iconSx(path: string) {
    return { minWidth: 36, ...(pathname === path ? { color: ACTIVE_COLOR } : {}) };
  }

  function textProps(path: string) {
    return pathname === path
      ? { primaryTypographyProps: { sx: { color: ACTIVE_COLOR, fontWeight: 600 } } }
      : {};
  }

  return (
    <>
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            {username}
          </Typography>
        </Box>
        <ModeToggle />
      </Box>
      <Divider />
      <List dense disablePadding>
        <ListItemButton sx={activeStyles("/landing")} onClick={() => navigate("/landing")}>
          <ListItemIcon sx={iconSx("/landing")}><HomeIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Home" {...textProps("/landing")} />
        </ListItemButton>
      </List>
      <Divider />
      <List dense disablePadding>
        <ListItemButton onClick={() => setLogoutDialogOpen(true)}>
          <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
      <Box sx={{ mt: "auto", px: 2, py: 1 }}>
        <Typography variant="body2" color="text.disabled">
          &copy; Codesqueak 2026
        </Typography>
      </Box>
    </Drawer>
    <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
      <DialogTitle>Logout</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to logout?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleLogout}>Logout</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export { DRAWER_WIDTH };

import React, { useEffect, useState, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Chat from "./Chat";

import { APP_NAME } from "../env";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import ArchitectureDiagramDialog from "./ArchitectureDiagramDialog";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut, fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function LayoutApp() {
  const [userName, setUserName] = React.useState("Guest User");
  const [email, setEmail] = useState("");
  const [open, setOpen] = React.useState(false);
  // 👇 nuevo: token para indicar que hay que limpiar el chat
  const [clearChatToken, setClearChatToken] = useState(0);

  const effectRan = useRef(false);
  useEffect(() => {
    if (!effectRan.current) {
      console.log("effect applied - only on the FIRST mount");

      const fetchUserData = async () => {
        console.log("Layout");
        try {
          const currentUser = await getCurrentUser();
          console.log(currentUser);
          setUserName(
            currentUser.signInDetails.loginId
              .split("@")[0]
              .charAt(0)
              .toUpperCase() +
              currentUser.signInDetails.loginId
                .split("@")[0]
                .slice(1)
                .toLowerCase()
          );
          setEmail(currentUser.signInDetails.loginId);
          const userAttributes = await fetchUserAttributes();
          if ("name" in userAttributes) {
            setUserName(userAttributes.name);
          }
          console.log(userAttributes);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      Promise.all([fetchUserData()])
        .catch(console.error)
        .finally(() => {
          console.log("complete loading");
        });
    }

    return () => (effectRan.current = true);
  }, []);
// CREACIÓN DE TEMA DE COLORES
  const defaultTheme = createTheme({
    palette: {
      primary: {
        main: "#21b2d0",   /* Cian brillante */
        light: "#60a5fa",  // azul claro para hovers
        dark: "#007a94",   /* Azul turquesa INTENSO */
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#000000",   // Texto en medio
        light: "#a5b4fc",
        dark: "#4f46e5",
        contrastText: "#ffffff",
      },
      background: {
        default: "#f3f4f6", // fondo gris suave
        paper: "#ffffff",   // tarjetas blancas
      },
      text: {
        primary: "#111827",   // gris casi negro
        secondary: "#4b5563", // gris medio
      },
      divider: "#e5e7eb",
    },
    typography: {
      fontFamily: [
        "Open Sans",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "sans-serif",
      ].join(","),
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.02em",
      },
      body1: {
        fontSize: "0.95rem",
      },
    },
    shape: {
      borderRadius: 10,
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <CssBaseline />
      <AppBar
        position="static"
        elevation={0}
        sx={(theme) => ({
          background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.dark, 0.35)}`,
        })}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {APP_NAME}
          </Typography>

          {/* Desktop view */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1.5,
            }}
          >
          <Typography variant="body1" sx={{ color: "#e5e7eb" }}>
            {userName}
          </Typography>

            {/* BOTÓN LIMPIAR CHAT */}
            <IconButton
              onClick={() => setClearChatToken((t) => t + 1)}
              size="small"
              sx={{ color: "#e5e7eb" }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={handleSignOut}
              size="small"
              sx={{ color: "#e5e7eb" }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Mobile view */}
          <Box
            sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center" }}
          >
            <IconButton
              onClick={handleSignOut}
              size="small"
              sx={{ color: "primary.main" }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container disableGutters maxWidth="xl" component="main">
        <Chat userName={userName} clearChatToken={clearChatToken}/>
      </Container>
      <Box textAlign={"center"}>
        <Typography
          variant="body2"
          sx={{ pb: 1, pl: 2, pr: 2, fontSize: "0.775rem" }}
        >
          {/*&copy;{new Date().getFullYear()}, Amazon Web Services, Inc. or its
          affiliates. All rights reserved.*/}
        </Typography>
        {/*<img src="/images/Powered-By_logo-horiz_RGB.png" />*/}
      </Box>

      <Box sx={{ position: "fixed", bottom: "8px", right: "12px" }}>
        <IconButton aria-label="" onClick={handleClickOpen}>
          <CloudOutlinedIcon />
        </IconButton>
      </Box>

      {/*<ArchitectureDiagramDialog open={open} onClose={handleClose} src="/images/gen-ai-assistant-diagram.png" />*/}
    </ThemeProvider>
  );
}

export default LayoutApp;

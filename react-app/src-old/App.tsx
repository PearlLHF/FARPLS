import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import useMediaQuery from "@mui/material/useMediaQuery";
import VideoContainer from "./components/VideoContainer/VideoContainer.js";
import Sidebar from "./components/Sidebar/Sidebar.js";

import video1 from "./assets/video1.mp4";
import video2 from "./assets/video2.mp4";
const videos = [video1, video2];

import { useState, useEffect, useRef } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import darkTheme from "./darkTheme.ts";
import lightTheme from "./lightTheme.ts";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [user, setUser] = useState("");
  const hasPromptedRef = useRef(false);

  const changeUser = () => {
    if (!user && !hasPromptedRef.current) {
      const newUser = prompt("Enter user ID: ");
      if (newUser) {
        setUser(newUser);
      }
      hasPromptedRef.current = true;
    }
  };

  useEffect(() => {
    changeUser();
  }, []);

  // Handle sidebar open/close
  const handleDrawerOpen = () => {
    setSidebarOpen(true);
  };

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  // Handle theme
  const isDarkTheme = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Sidebar
          isDark={isDarkTheme}
          isOpen={sidebarOpen}
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          user={user || "p00"}
        />
        <VideoContainer sidebarOpen={sidebarOpen} user={user || "p00"} />
      </ThemeProvider>
    </>
  );
}

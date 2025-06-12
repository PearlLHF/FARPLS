import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import * as React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import VideoContainer from "./components/VideoContainer/VideoContainer.js";
import Sidebar from "./components/Sidebar/Sidebar.js";
import video1 from "./assets/video1.mp4";
import video2 from "./assets/video2.mp4";
const videos = [video1, video2];

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import darkTheme from "./theme.js";

function App() {
  const handleVideoEnd = () => {
    console.log("Video ended");
  };

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      prefersDarkMode
        ? darkTheme
        : createTheme({
            palette: {
              mode: "light",
            },
          }),
    [prefersDarkMode]
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Sidebar />
        <VideoContainer videoSources={videos} onVideoEnd={handleVideoEnd} />
      </ThemeProvider>
    </>
  );
}

export default App;

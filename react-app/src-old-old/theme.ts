import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: '#0a192f',
      paper: "#0a192f",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a7b6c2",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontWeight: 500,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.05em",
    },
    h2: {
      fontWeight: 500,
      fontSize: "2rem",
      lineHeight: 1.2,
      letterSpacing: "-0.05em",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.05em",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.25rem",
      lineHeight: 1.2,
      letterSpacing: "-0.05em",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.2,
      letterSpacing: "-0.05em",
    },
    h6: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1.2,
      letterSpacing: "-0.05em",
    },
    subtitle1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "-0.02em",
    },
    subtitle2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "-0.02em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "-0.02em",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "-0.02em",
    },
    button: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "-0.02em",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.2,
      letterSpacing: "0.03333em",
    },
    overline: {
      fontSize: "0.75rem",
      lineHeight: 2.66,
      letterSpacing: "0.083em",
      textTransform: "uppercase",
    },
  },
});

export default darkTheme;
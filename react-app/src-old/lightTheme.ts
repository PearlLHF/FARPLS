import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import darkTheme from "./darkTheme.ts";

const lightPalette = {
  primary: {
    main: "#2196f3",
  },
  secondary: {
    main: "#f50057",
  },
  background: {
    default: "#ffffff",
    paper: "#f3f6f9",
  },
  text: {
    primary: "#0a192f",
    secondary: "#4f5d73",
  },
};

const lightTheme = createTheme(
  deepmerge(darkTheme, {
    palette: lightPalette,
  })
);

export default lightTheme;
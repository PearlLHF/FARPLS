import axios from "axios";

import { Drawer, List, ListItem, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Button from "../Button/Button.tsx";

interface SidebarProps {
  user: string;
  isDark: boolean;
  isOpen: boolean;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
}

function Sidebar({
  isDark,
  isOpen,
  handleDrawerOpen,
  handleDrawerClose,
  user,
}: SidebarProps) {
  const resetPreferences = () => {
    // axios: http://127.0.0.1:5000/reset/baseline/p00
    axios
      .get(`http://127.0.0.1:5000/reset/baseline/${user}`)
      .then(function (response) {
        // Handle success
        console.log(response);
        window.location.reload();
        localStorage.setItem("preferences", "");
      })
      .catch(function (error) {
        // Handle error
        console.log(error);
      })
      .finally();
  };

  const downloadPreferences = () => {
    axios
      .get(`http://127.0.0.1:5000/download/baseline/${user}`, {
        responseType: "blob",
      })
      .then(function (response) {
        // Handle success
        // Create file in memory
        const url = URL.createObjectURL(response.data);

        // Create 'a' HTML element with href and click
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "preferences.txt");

        // Add to DOM and click
        document.body.appendChild(link);
        link.click();

        // Clean up and remove 'a'
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(function (error) {
        // Handle error
        console.log(error);
        //* Download from local storage as backup instead?
      })
      .finally(function () {
        // Always executed
      });
  };

  return (
    <>
      <IconButton
        onClick={handleDrawerOpen}
        sx={{
          color: isDark ? "#fff" : "#000",
          "& svg": {
            fill: isDark ? "#fff" : "#000",
          },
        }}
      >
        <ChevronRight />
      </IconButton>
      <Drawer open={isOpen} onClose={handleDrawerClose}>
        <div>
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              color: isDark ? "#fff" : "#000",
              "& svg": {
                fill: isDark ? "#fff" : "#000",
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
        </div>
        <List>
          <ListItem>
            <Typography variant="h1">
              New User Preference Collection Tool
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="h4">{user}</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="h4">Instruction 1</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="h4">Instruction 2</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="h4">Instruction 3</Typography>
          </ListItem>
        </List>
        <Button label="Reset" onClick={resetPreferences}></Button>
        <Button
          label="Download Preferences"
          onClick={downloadPreferences}
        ></Button>
      </Drawer>
    </>
  );
}

export default Sidebar;

import { useState } from "react";

import { Drawer, List, ListItem, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
function Sidebar() {
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleDrawerOpen} sx={{ color: "white" }}>
        <ChevronRight />
      </IconButton>
      <Drawer open={open} onClose={handleDrawerClose}>
        <div>
          <IconButton onClick={handleDrawerClose} sx={{ color: "white" }}>
            <ChevronLeft />
          </IconButton>
        </div>
        <List>
          <ListItem>
            <Typography variant="h1">
              Old User Preference Collection Tool
            </Typography>
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
      </Drawer>
    </>
  );
}

export default Sidebar;

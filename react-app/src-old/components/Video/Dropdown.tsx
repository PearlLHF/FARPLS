import { List, ListItem, ListItemText, IconButton, Slide } from "@mui/material";
import { useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Dropdown() {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleList = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <span style={{ position: "relative", left: "150px" }}>
        Stats
        <IconButton
          onClick={toggleList}
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          {isOpen ? (
            <ExpandLessIcon sx={{ color: "#fff" }} />
          ) : (
            <ExpandMoreIcon sx={{ color: "#fff" }} />
          )}
        </IconButton>
      </span>
      <Slide in={isOpen} direction="down" mountOnEnter unmountOnExit>
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: "60px",
            zIndex: 1,
          }}
        >
          <List>
            <ListItem>
              <ListItemText primary="Stat 1" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Stat 2" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Stat 3" />
            </ListItem>
          </List>
        </div>
      </Slide>
    </div>
  );
}

export default Dropdown;

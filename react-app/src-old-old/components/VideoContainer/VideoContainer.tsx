import Video from "../Video/Video.js";
import Button from "../Button/Button.js";
import { useState } from "react";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Card,
  Box,
  CardActions,
} from "@mui/material";

interface VideoContainerProps {
  videoSources: string[];
  onVideoEnd: () => void;
}

function VideoContainer({ videoSources, onVideoEnd }: VideoContainerProps) {
  //TODO: implement state consistency across refresh (localStorage)
  const [preferences, setPreferences] = useState<string[]>([]);

  //TODO: handleVideoPreference inside handleButtonClick (which includes video refreshing)
  const handleVideoPreference = (preference: string) => {
    setPreferences([...preferences, preference]);
  };

  return (
    <Grid
      container
      spacing={2}
      marginTop={2}
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "100vh" }}
    >
      <Grid item xs={6}>
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 2,
          }}
        >
          <Box sx={{ position: "relative", paddingBottom: "56.25%" }}>
            <Video
              src={videoSources[0]}
              onEnd={onVideoEnd}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
          <CardActions sx={{ justifyContent: "center" }}>
            <Button
              label="I prefer video 1"
              onClick={() => handleVideoPreference("video 1")}
            />
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 2,
          }}
        >
          <Box sx={{ position: "relative", paddingBottom: "56.25%" }}>
            <Video
              src={videoSources[1]}
              onEnd={onVideoEnd}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
          <CardActions sx={{ justifyContent: "center" }}>
            <Button
              label="I prefer video 2"
              onClick={() => handleVideoPreference("video 2")}
            />
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          label="No preference"
          onClick={() => handleVideoPreference("no pref")}
        />
      </Grid>
      <Grid item xs={12}>
        <List>
          {preferences.map((preference, index) => (
            <ListItem key={index}>
              <ListItemText primary={preference} />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}

export default VideoContainer;

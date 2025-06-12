import Video from "../Video/Video.tsx";
import Button from "../Button/Button.tsx";
import { useEffect, useState } from "react";
import { Grid, List, ListItem, ListItemText, Box } from "@mui/material";
import axios from "axios";

interface VideoContainerProps {
  sidebarOpen: boolean;
  user: string;
}

export default function VideoContainer({
  sidebarOpen,
  user,
}: VideoContainerProps) {
  const [preferences, setPreferences] = useState<string[]>([]);
  const [currentChoice, setCurrentChoice] = useState<string>("");
  const [videoSources, setVideoSources] = useState<string[]>([]);
  const [videoNames, setVideoNames] = useState<string[]>([]);
  const [video1Playing, setVideo1Playing] = useState<boolean>(true);
  const [video2Playing, setVideo2Playing] = useState<boolean>(true);
  const [video1End, setVideo1End] = useState<boolean>(false);
  const [video2End, setVideo2End] = useState<boolean>(false);

  // Initial load of existing preferences to retain progress
  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Initial fetch videos
  useEffect(() => {
    console.log("Fetching videos...");
    fetchVideos();
  }, []);

  // Get name of video from URL
  const getName = (videoName: string) => {
    const parts = videoName.split("/");
    return parts[parts.length - 2];
  };

  //* Offload to separate component / async + await? Need to add loading message etc
  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/query/baseline/${user}`
      );
      const fixedResponse = response.data.map(
        (url: string) => `http://localhost:5000${url}`
      );

      console.log(fixedResponse);
      setVideoSources(fixedResponse);
      setVideoNames(fixedResponse.map(getName));
    } catch (error) {
      console.log(error);
    }
  };

  // Prepare preference data for submission
  const constructFormData = (preference: string) => {
    console.log("Constructing form data...");
    const formData = new FormData();

    formData.append("video1", videoNames[0]);
    formData.append("video2", videoNames[1]);
    formData.append("pref_vid", preference);

    return formData;
  };

  const submitScore = async (formData: FormData) => {
    console.log("Submitting scores...");
    try {
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `http://127.0.0.1:5000/submit/baseline/${user}`,
        formData
      );

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleVideoPreference = (preference: string, formData: FormData) => {
    setPreferences([...preferences, preference]);
    localStorage.setItem(
      "preferences",
      JSON.stringify([...preferences, preference])
    );
    submitScore(formData);
  };

  const handleConfirm = () => {
    if (!currentChoice) {
      alert("Please select a valid option.");
    } else {
      console.log("Confirm button pressed...");
      handleVideoPreference(currentChoice, constructFormData(currentChoice));
      fetchVideos();
      setCurrentChoice("");
    }
  };

  useEffect(() => {
    if (!sidebarOpen) {
      if (!video1End) {
        setVideo1Playing(true);
      }
      if (!video2End) {
        setVideo2Playing(true);
      }
    } else {
      setVideo1Playing(false);
      setVideo2Playing(false);
    }
  }, [sidebarOpen, video1End, video2End]);

  useEffect(() => {
    if (video1End && video2End) {
      setVideo1End(false);
      setVideo2End(false);

      setVideo1Playing(true);
      setVideo2Playing(true);
    }
  }, [video1End, video2End]);

  const handleEnd = (video: number) => {
    if (video === 0) {
      setVideo1End(true);
    } else if (video === 1) {
      setVideo2End(true);
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Video 1 and relevant button (left) */}
      <Grid item xs>
        <Box textAlign="center">
          {/* Button 1 */}
          <Box sx={{ marginBottom: "20px" }}>
            <Button
              label="I prefer video 1"
              variant={
                currentChoice === videoNames[0] ? "contained" : "outlined"
              }
              color="primary"
              size="large"
              onClick={() => setCurrentChoice(videoNames[0])}
            ></Button>
          </Box>
          {/* Video 1 */}
          <Video
            url={videoSources[0]}
            onEnd={() => handleEnd(0)}
            onPlay={() => setVideo1Playing(true)}
            onPause={() => setVideo1Playing(false)}
            playing={video1Playing}
          />
        </Box>
      </Grid>

      <Grid item xs>
        {/* No pref button */}
        <Button
          label="No Pref."
          variant={currentChoice === "no pref" ? "contained" : "outlined"}
          color="warning"
          size="large"
          onClick={() => setCurrentChoice("no pref")}
        ></Button>
      </Grid>

      {/* Video 2 and relevant button (right) */}
      <Grid item xs>
        <Box textAlign="center">
          {/* Button 2 */}
          <Box sx={{ marginBottom: "20px" }}>
            <Button
              label="I prefer video 2"
              variant={
                currentChoice === videoNames[1] ? "contained" : "outlined"
              }
              color="primary"
              size="large"
              onClick={() => setCurrentChoice(videoNames[1])}
            ></Button>
          </Box>
          {/* Video 2 */}
          <Video
            url={videoSources[1]}
            onEnd={() => handleEnd(1)}
            onPlay={() => setVideo2Playing(true)}
            onPause={() => setVideo2Playing(false)}
            playing={video2Playing}
          />
        </Box>
      </Grid>

      {/* No pref button and score (center) */}
      <Grid item xs={12}>
        <Box textAlign="center">
          {/* Confirm button */}
          <Box sx={{ marginTop: "20px" }}>
            <Button
              label="Play/Pause Both"
              variant="outlined"
              size="large"
              onClick={() => {
                if (video1Playing !== video2Playing) {
                  setVideo1Playing(false);
                  setVideo2Playing(false);
                } else {
                  setVideo1Playing(!video1Playing);
                  setVideo2Playing(!video2Playing);
                }
              }}
            ></Button>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Button
              label="Confirm"
              variant="contained"
              color="success"
              size="large"
              onClick={handleConfirm}
            ></Button>
          </Box>

          {/* Scores */}
          <Box sx={{ marginTop: "20px" }}>
            <List sx={{ marginTop: "10px" }}>
              {preferences.map((preference, index) => (
                <ListItem key={index}>
                  <ListItemText primary={preference} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

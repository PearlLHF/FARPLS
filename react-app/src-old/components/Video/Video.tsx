import React, { useEffect, useState } from "react";
import { Box, styled } from "@mui/material";
import ReactPlayer from "react-player";
import Dropdown from "./Dropdown";
import Keyframes from "./Keyframes";

interface VideoProps {
  url?: string;
  onEnd: () => void;
  onPlay: () => void;
  onPause: () => void;
  playing: boolean;
  sx?: any;
}

function Video({ url, onEnd, onPlay, onPause, playing, sx }: VideoProps) {
  const playerRef = React.useRef<ReactPlayer | null>(null);
  const [activeKeyframe, setActiveKeyframe] = useState<string | null>(null);
  const [playedSeconds, setPlayedSeconds] = useState<number>(0);

  const handleKeyframeClick = (
    label: string,
    startTime: number,
    endTime: number
  ) => {
    setActiveKeyframe(label);
    playerRef.current?.seekTo(startTime);
  };

  return (
    <>
      <Box sx={{ ...sx, position: "relative" }}>
        <Dropdown />
        <ReactPlayer
          ref={playerRef}
          url={url}
          onEnded={onEnd}
          onPause={onPause}
          onPlay={onPlay}
          playing={playing}
          //
          controls
        />
        <Keyframes
          onKeyframeClick={handleKeyframeClick}
          activeKeyframe={activeKeyframe}
        />
      </Box>
    </>
  );
}

export default Video;

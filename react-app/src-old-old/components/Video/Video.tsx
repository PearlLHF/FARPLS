import { useRef } from "react";
import { styled } from "@mui/material";

interface VideoProps {
  src: string;
  onEnd: () => void;
  sx?: any;
}

const StyledVideo = styled("video")({
  width: "100%",
  height: "100%",
});

function Video({ src, onEnd, sx }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    onEnd();
  };

  return (
    <StyledVideo
      ref={videoRef}
      src={src}
      onEnded={handleEnd}
      autoPlay
      controls
      sx={sx}
    />
  );
}

export default Video;

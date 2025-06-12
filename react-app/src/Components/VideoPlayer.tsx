import {
  useState,
  memo,
  forwardRef,
  RefObject,
  ForwardRefRenderFunction,
} from "react";
import { getLogger } from "../logger";

interface VideoPlayerProps {
  source: string;
  id: string | undefined;
  videoKey: string;
  onEnded: () => void;
  onTimeUpdate?: () => void;
  logger: ReturnType<typeof getLogger>;
}

const VideoPlayer: ForwardRefRenderFunction<
  HTMLVideoElement,
  VideoPlayerProps
> = ({ source, id, videoKey, onEnded, onTimeUpdate, logger }, forwardedRef) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const ref = forwardedRef as RefObject<HTMLVideoElement>;

  const handlePause = () => {
    setIsPlaying(false);
    logger.info(`Video paused: ${id}`);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    logger.info(`Video playing: ${id}`);
  };

  const handleTimeUpdate = () => {
    if (ref.current) {
      setCurrentTime(ref.current.currentTime);
    }
  };

  return (
    <video
      id="player"
      controls
      ref={ref}
      key={videoKey}
      onTimeUpdate={handleTimeUpdate}
      onPause={handlePause}
      onPlay={handlePlay}
      onEnded={onEnded}
      muted
      onTimeUpdateCapture={onTimeUpdate}
      className="rounded-lg"
    >
      <source src={source} />
    </video>
  );
};

export default memo(forwardRef(VideoPlayer));

import axios from "axios";
import { useState, memo } from "react";
import { fetchKeyframes, Keyframe } from "../api";
import { getLogger } from "../logger";
import CollisionButton from "./CollisionButton";

axios.defaults.baseURL = "";

interface KeyframePointsProps {
  keyframes: Keyframe[];
  videoRef: React.RefObject<HTMLVideoElement>;
  videoName: string | undefined;
  side: string;
  updatePlaybackRange: (start: number, end: number) => void;
  handleExternalPlaybackToggle: () => void;
  updateActive: (active: string | null, keyframeType: string) => void;
  active: (string | null)[] | string | null;
  logger: ReturnType<typeof getLogger>;
}

function KeyframePoints({
  videoRef,
  updatePlaybackRange,
  videoName,
  side,
  keyframes,
  handleExternalPlaybackToggle,
  updateActive,
  logger,
  active,
}: KeyframePointsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleKeyframeHover = (keyframe: string) => {
    logger.info(`Hovered: ${keyframe}`);
    setHovered(keyframe);
  };

  const handleKeyframeLeave = () => {
    setHovered(null);
  };

  const handleCollisionKeyframeClick = (index: number) => {
    logger.info(`Clicked collision ${index + 1}`);
    const keyframe = keyframes[0];
    updateActive(`Collision ${index + 1}`, side);

    if (
      keyframe &&
      Array.isArray(keyframe.collisions) &&
      Array.isArray(keyframe.collisions[0])
    ) {
      const times = keyframe.collisions[index][0] as unknown as number[];
      if (videoRef.current) videoRef.current.currentTime = times[0];
      updatePlaybackRange(times[0], times[1]);
      videoRef.current?.play();
      handleExternalPlaybackToggle();
    } else {
      alert("Invalid keyframe");
    }
  };

  const handleURL = (url: string) => {
    return `${axios.defaults.baseURL}${url}`;
  };

  return (
    <div className="relative h-full w-full">
      {keyframes &&
        keyframes.map((frame) => (
          <div
            className="flex flex-wrap items-center flex-shrink-0 pr-2 mb-2"
            key={1}
          >
            {Object.entries(frame).map(([key, value]) => (
              <div className="justify-between flex flex-wrap" key={key}>
                {key === "collisions" &&
                  Array.isArray(value) &&
                  value.map((collision, index) => (
                    <CollisionButton
                      videoName={videoName}
                      side={side}
                      key={index}
                      index={index}
                      collision={
                        collision as
                          | string
                          | number
                          | [[number, number], string]
                      }
                      hovered={hovered}
                      active={active}
                      handleCollisionKeyframeClick={
                        handleCollisionKeyframeClick
                      }
                      handleKeyframeHover={handleKeyframeHover}
                      handleKeyframeLeave={handleKeyframeLeave}
                      handleURL={handleURL}
                    />
                  ))}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default memo(KeyframePoints);

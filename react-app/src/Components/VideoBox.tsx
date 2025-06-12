import { memo, ForwardRefRenderFunction, forwardRef, RefObject } from "react";

import KeyframePoints from "./KeyframePoints";
import VideoPlayer from "./VideoPlayer";
import KeyframeStats from "./KeyframeStats";
import { getLogger } from "../logger";
import { FeatureProps, StatisticProps, Keyframe } from "../api";

interface VideoBoxProps {
  source: string;
  colour: string;
  id: string | undefined;
  side: string;
  videoKey: string;
  onEnded: () => void;
  updatePlaybackRange: (keyframeStart: number, keyframeEnd: number) => void;
  updateActive: (active: string | null, keyframeType: string) => void;
  handleExternalPlaybackToggle: () => void;
  active: (string | null)[];
  keyframes: Keyframe[];
  start: number | undefined;
  end: number | undefined;
  resetVideo: () => void;
  systemType: string;
  anomalies: (string | undefined)[];
  anomalyInRed: string | undefined;
  features: FeatureProps | null;
  stats: StatisticProps | null;
  logger: ReturnType<typeof getLogger>;
}

const VideoBox: ForwardRefRenderFunction<HTMLVideoElement, VideoBoxProps> = (
  {
    source,
    handleExternalPlaybackToggle,
    videoKey,
    colour,
    id,
    side,
    onEnded,
    updateActive,
    active,
    keyframes,
    updatePlaybackRange,
    start,
    end,
    resetVideo,
    systemType,
    anomalies,
    anomalyInRed,
    features,
    stats,
    logger,
  },
  forwardedRef
) => {
  const ref = forwardedRef as RefObject<HTMLVideoElement>;

  const handleTimeUpdate = () => {
    if (ref.current) {
      if (active[1] != "None" && start && end) {
        if (end >= ref.current.duration) {
          end = ref.current.duration;
        }

        if (ref.current.currentTime >= end) {
          ref.current.currentTime = start;
          ref.current.play();
        }
      } else {
        resetVideo();
      }
    }
  };

  return (
    <div className="m-4 p-4 max-w-[80%] bg-gradient-to-r dark:from-[#2D343C] dark:to-[#342D3C] from-slate-200 to-slate-100 rounded-lg shadow-xl">
      <div className={`${colour} p-1 rounded-lg `}>
        <VideoPlayer
          id={id}
          ref={ref}
          source={source}
          videoKey={videoKey}
          onEnded={onEnded}
          onTimeUpdate={handleTimeUpdate}
          logger={logger}
        />
      </div>
      {systemType === "experiment" && (
        <div className="mt-5 justify-between">
          <KeyframePoints
            handleExternalPlaybackToggle={handleExternalPlaybackToggle}
            videoRef={ref}
            updatePlaybackRange={updatePlaybackRange}
            videoName={id}
            side={side}
            updateActive={updateActive}
            keyframes={keyframes}
            logger={logger}
            active={active}
          />
          <div className="flex justify-between mt-2">
            <KeyframeStats
              stats={stats}
              features={features}
              anomalies={anomalies}
              anomalyInRed={anomalyInRed}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(forwardRef(VideoBox));

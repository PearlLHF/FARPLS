import { memo } from "react";
import { Keyframe } from "../api";
import axios from "axios";
import featureName from "../assets/feature_name.json"

axios.defaults.baseURL = "";

interface KeyframeButtonProps {
  frameKey: string;
  side: string;
  active: (string | null)[] | string | null;
  hovered: string | null;
  keyframe1: Keyframe;
  keyframe2: Keyframe;
  handleKeyframeClick: (frameKey: string) => void;
  handleKeyframeHover: (keyframe: string) => void;
  handleKeyframeLeave: () => void;
}

function KeyframeButton({
  frameKey,
  side,
  active,
  handleKeyframeClick,
  hovered,
  handleKeyframeHover,
  handleKeyframeLeave,
  keyframe1,
  keyframe2,
}: KeyframeButtonProps) {
  const handleURL = (url: string) => {
    return `${axios.defaults.baseURL}${url}`;
  };

  return (
    <>
      <div
        className={`transition-all text-sm truncate flex-1 dark:bg-white dark:bg-opacity-25 bg-black bg-opacity-25 rounded cursor-pointer hover:bg-opacity-50 ml-2 mb-2 ${
          active?.includes(`${side}: ${frameKey}`)
            ? "dark:bg-opacity-50 bg-opacity-50"
            : "dark:bg-opacity-25 bg-opacity-25"
        }`}
      >
        <div
          onClick={() => handleKeyframeClick(frameKey)}
          className="p-1.5"
          onMouseEnter={() => handleKeyframeHover(frameKey)}
          onMouseLeave={() => handleKeyframeLeave()}
        >
          {featureName[frameKey as keyof typeof featureName]}
        </div>

        {hovered === frameKey && keyframe1 && keyframe2 && (
          <div className="w-1/2 left-1/2 z-50 absolute justify-center transform -translate-x-1/2 text-center mt-5 bg-black bg-opacity-80 text-white p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-[#FDD25A]">Video 1:</p>
                <p className="text-xs">
                  <span className="font-bold">Start Time: </span>
                  {keyframe1[frameKey as keyof Keyframe]?.[0][0].toFixed(2)}
                </p>
                <p className="text-xs ">
                  <span className="font-bold">End Time: </span>

                  {keyframe1[frameKey as keyof Keyframe]?.[0][1].toFixed(2)}
                </p>

                <img
                  className=" rounded-sm mt-1"
                  src={handleURL(
                    keyframe1[
                      frameKey as keyof Keyframe
                    ]?.[1].toString() as string
                  )}
                ></img>
              </div>
              <div>
                <p className="font-bold text-[#77EBD4]">Video 2:</p>
                <p className="text-xs">
                  <span className="font-bold">Start Time: </span>
                  {keyframe2[frameKey as keyof Keyframe]?.[0][0].toFixed(2)}
                </p>
                <p className="text-xs">
                  <span className="font-bold">End Time: </span>
                  {keyframe2[frameKey as keyof Keyframe]?.[0][1].toFixed(2)}
                </p>

                <img
                  className=" rounded-sm mt-1"
                  src={handleURL(
                    keyframe2[
                      frameKey as keyof Keyframe
                    ]?.[1].toString() as string
                  )}
                ></img>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(KeyframeButton);

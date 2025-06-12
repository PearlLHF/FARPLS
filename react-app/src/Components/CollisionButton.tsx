import { memo } from "react";

interface CollisionButtonProps {
  index: number;
  videoName: string | undefined;
  side: string;
  collision: string | number | [[number, number], string];
  hovered: string | null;
  active: (string | null)[] | string | null;
  handleCollisionKeyframeClick: (index: number) => void;
  handleKeyframeHover: (keyframe: string) => void;
  handleKeyframeLeave: () => void;
  handleURL: (url: string) => string;
}

function CollisionButton({
  index,
  videoName,
  side,
  collision,
  hovered,
  active,
  handleCollisionKeyframeClick,
  handleKeyframeHover,
  handleKeyframeLeave,
  handleURL,
}: CollisionButtonProps) {
  return (
    <>
      <div
        key={index}
        className={`transition-all text-sm truncate flex-1 dark:bg-white dark:bg-opacity-25 bg-black bg-opacity-25 rounded cursor-pointer hover:bg-opacity-50 ml-2 mb-2 ${
          active?.includes(`${side}: Collision ${index + 1}`)
            ? "dark:bg-opacity-50 bg-opacity-50"
            : "dark:bg-opacity-25 bg-opacity-25"
        }`}
      >
        <div
          onClick={() => handleCollisionKeyframeClick(index)}
          onMouseEnter={() => handleKeyframeHover(`Collision ${index + 1}`)}
          onMouseLeave={() => handleKeyframeLeave()}
          className="p-1.5"
        >
          {`Collision ${index + 1}`}
        </div>

        {hovered === `Collision ${index + 1}` && (
          <div className="w-11/12 z-50 absolute left-1/2 transform -translate-x-1/2 bottom-[110%] justify-center text-center mt-5 bg-black bg-opacity-80 text-white p-4 rounded-lg">
            {Array.isArray(collision) && Array.isArray(collision[0]) ? (
              <div>
                <p className="text-xs">
                  <span className="font-bold">Start Time: </span>
                  {collision[0][0].toFixed(2)}
                </p>
                <p className="text-xs">
                  <span className="font-bold">End Time: </span>
                  {collision[0][1].toFixed(2)}
                </p>
                <img
                  src={handleURL(collision[1].toString())}
                  className="rounded-sm mt-1"
                ></img>
              </div>
            ) : (
              <div>{collision}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default memo(CollisionButton);

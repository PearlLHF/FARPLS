import { useState } from "react";

interface KeyframesProps {
  onKeyframeClick: (label: string, startTime: number, endTime: number) => void;
  activeKeyframe: string | null;
}

function Keyframes({ onKeyframeClick }: KeyframesProps) {
  const keyframes = [
    { label: "Start", start: 0, end: 1, img: "https://picsum.photos/75" },
    { label: "Pick up can", start: 2, end: 3, img: "https://picsum.photos/75" },
    { label: "Drop can", start: 4, end: 5, img: "https://picsum.photos/75" },
  ];

  const [activeKeyframe, setActiveKeyframe] = useState<string | null>(null);
  const [hoveredKeyframe, setHoveredKeyframe] = useState<string | null>(null);

  const handleKeyframeClick = (label: string) => {
    if (activeKeyframe === label) {
      setActiveKeyframe(null);
    } else {
      setActiveKeyframe(label);
    }
    onKeyframeClick(
      keyframes.find((keyframe) => keyframe.label === label)?.label || "",
      keyframes.find((keyframe) => keyframe.label === label)?.start || 0,
      keyframes.find((keyframe) => keyframe.label === label)?.end || 0
    );
  };

  const handleMouseEnter = (label: string) => {
    setHoveredKeyframe(label);
  };

  const handleMouseLeave = () => {
    setHoveredKeyframe(null);
  };

  return (
    <div
      style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
    >
      {keyframes.map((keyframe) => (
        <div
          key={keyframe.label}
          onClick={() => handleKeyframeClick(keyframe.label)}
          onMouseEnter={() => handleMouseEnter(keyframe.label)}
          onMouseLeave={handleMouseLeave}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "10px",
            textAlign: "center",
            position: "relative",
            cursor: "pointer",
            border: "2px solid #ddd",
            borderRadius: "4px",
            padding: "8px",
            color: activeKeyframe === keyframe.label ? "black" : "white",
            backgroundColor:
              activeKeyframe === keyframe.label ? "white" : "transparent",
            boxShadow:
              activeKeyframe === keyframe.label ? "rgba(0, 0, 0, 1)" : "none",
            transition: "background-color 0.3s, box-shadow 0.3s",
          }}
        >
          <div
            style={{
              marginBottom: "5px",
              fontWeight: activeKeyframe === keyframe.label ? "bold" : "normal",
              fontSize: "14px",
            }}
          >
            {keyframe.label}
          </div>
          {(activeKeyframe === keyframe.label ||
            (hoveredKeyframe === keyframe.label && !activeKeyframe)) && (
            <div
              style={{
                display: "block",
                position: "absolute",
                top: "calc(100% + 10px)",
                left: "50%",
                transform: "translateX(-50%)",
                background:
                  activeKeyframe === keyframe.label
                    ? "rgba(0, 0, 0, 1)"
                    : "rgba(0, 0, 0, 0.25)",

                color: "#fff",
                transition: "background-color 0.3s",
                padding: "8px 8px 4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                zIndex: 1,
              }}
            >
              <img
                src={keyframe.img}
                alt="keyframe"
                style={{ width: "75px", height: "75px", borderRadius: "4px" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Keyframes;

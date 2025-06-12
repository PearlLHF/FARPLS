import { Settings, Play, Pause, RefreshCw } from "react-feather";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  submitScore,
  fetchProgress,
  fetchVideos,
  fetchKeyframes,
  fetchFeatures,
  submitLog,
  fetchStats,
  FeatureProps,
  StatisticProps,
  Keyframe,
} from "./api";
import { getLogger } from "./logger";
import { Typography } from "@mui/material";

import HorizontalNonLinearStepper from "./Components/Stepper";
import SettingsDialog from "./Components/Dialogs/SettingsDialog";
import FinishDialog from "./Components/Dialogs/MessageDialog";
import VideoBox from "./Components/VideoBox";
import StartDialog from "./Components/Dialogs/StartDialog";
import KeyframeButtonBasic from "./Components/KeyframeButtonBasic";
import AreaChart from "./Components/AreaChart";

import featureName from "./assets/feature_name.json";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(true);
  const [finishOpen, setFinishOpen] = useState(false);
  const [playbackPaused, setPlaybackPaused] = useState(true);
  const [selected, setSelected] = useState<string>("");
  const [videoSources, setVideoSources] = useState<string[]>([]);
  const [videoNames, setVideoNames] = useState<string[]>([]);
  const [video1Ended, setVideo1Ended] = useState<boolean>(false);
  const [video2Ended, setVideo2Ended] = useState<boolean>(false);
  const [user, setUser] = useState<string>("");
  const [systemType, setSystemType] = useState<string>("");
  const [active, setActive] = useState<(string | null)[]>([
    "Left Video",
    "Shared",
    "Right Video",
  ]);
  const [hover, setHover] = useState<string | null>("");
  const [message, setMessage] = useState<string>("");
  const [features1, setFeatures1] = useState<FeatureProps | null>(null);
  const [features2, setFeatures2] = useState<FeatureProps | null>(null);
  const [anomalies, setAnomalies] = useState<(string | undefined)[]>([]);
  const [stats, setStats] = useState<StatisticProps | null>(null);
  const [isVideosLoaded, setIsVideosLoaded] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const player1 = useRef<HTMLVideoElement>(null);
  const player2 = useRef<HTMLVideoElement>(null);

  const logger = getLogger();
  const [keyframes1, setKeyframes1] = useState<Keyframe[]>([]);
  const [playbackRange1, setPlaybackRange1] = useState<(number | undefined)[]>(
    []
  );
  const [keyframes2, setKeyframes2] = useState<Keyframe[]>([]);
  const [playbackRange2, setPlaybackRange2] = useState<(number | undefined)[]>(
    []
  );

  const updatePlaybackRange1 = useCallback(
    (keyframeStart: number, keyframeEnd: number) => {
      setPlaybackRange1([keyframeStart, keyframeEnd]);
    },
    [playbackRange1]
  );

  const updatePlaybackRange2 = useCallback(
    (keyframeStart: number, keyframeEnd: number) => {
      setPlaybackRange2([keyframeStart, keyframeEnd]);
    },
    [playbackRange2]
  );

  const resetVideo1 = useCallback(() => {
    setPlaybackRange1([0, undefined]);
  }, [playbackRange1]);

  const resetVideo2 = useCallback(() => {
    setPlaybackRange2([0, undefined]);
  }, [playbackRange2]);

  const handleKeyframeClick = useCallback(
    (curr: string) => {
      player1.current?.play();
      player2.current?.play();
      setPlaybackPaused(false);
      logger.info(`Clicked: ${curr}`);
      const keyframe1 = keyframes1[0];
      const keyframe2 = keyframes2[0];
      const keyframeName: keyof Keyframe = curr as keyof Keyframe;
      updateActive(curr, "Shared");

      if (
        keyframe1 &&
        keyframe1[keyframeName] &&
        keyframe2 &&
        keyframe2[keyframeName]
      ) {
        const times1 = keyframe1[keyframeName]?.[0] as unknown as number[];
        const times2 = keyframe2[keyframeName]?.[0] as unknown as number[];
        if (player1.current && player2.current) {
          player1.current.currentTime = times1[0];
          player2.current.currentTime = times2[0];
        }

        console.log(keyframe1[keyframeName]?.[1]);
        console.log(keyframe2[keyframeName]?.[1]);

        setPlaybackRange1([times1[0], times1[1]]);
        setPlaybackRange2([times2[0], times2[1]]);
      } else {
        alert("Invalid keyframe");
      }
    },
    [playbackRange1, playbackRange2, keyframes1, keyframes2]
  );

  const handleExternalPlaybackToggle = useCallback(() => {
    setPlaybackPaused(false);
  }, []);

  const handleKeyframeHover = (keyframe: string) => {
    logger.info(`Hovered: ${keyframe}`);
    setHover(keyframe);
  };

  const handleKeyframeLeave = () => {
    setHover(null);
  };

  const getVideos = () => {
    return new Promise((resolve, reject) => {
      setIsVideosLoaded(false);
      if (user && systemType) {
        fetchProgress(user, systemType)
          .then((progress) => {
            setCompletedSteps([true].concat(progress));
            console.log(`Progress fetched: ${progress}`);
          })
          .catch((error) => {
            console.log(error);
          });
        fetchVideos(user, systemType)
          .then((response) => {
            submitLog(systemType, user);
            if (
              !response ||
              (!Array.isArray(response) && typeof response === "string")
            ) {
              console.log(`${response}`);
              setFinishOpen(true);
              if (!response) {
                console.log("No more videos to label.");
                setMessage("No more video pairs to label.");
              }
              if (
                typeof response === "string" &&
                user &&
                systemType === "experiment"
              ) {
                console.log(response);
                setMessage(response);
                getVideos();
              }
              return;
            }
            console.log(`Videos fetched: ${response}`);
            setVideoNames(response.map(getName));
            setVideoSources(response);
            player1.current?.load();
            player2.current?.load();
            setPlaybackPaused(true);
            resolve(response);

            setIsVideosLoaded(true);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  };

  useEffect(() => {
    getVideos();
  }, [user, systemType]);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const statsData = await fetchStats();
        if (statsData) setStats(statsData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchStatsData();
  }, []);

  useEffect(() => {
    const fetchKeyframeData = async () => {
      try {
        if (videoNames && isVideosLoaded) {
          const data1 = await fetchKeyframes(videoNames[0]);
          if (data1) setKeyframes1(data1);

          const data2 = await fetchKeyframes(videoNames[1]);
          if (data2) setKeyframes2(data2);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchKeyframeData();
  }, [videoNames, user]);

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        if (videoNames && isVideosLoaded) {
          const data1 = await fetchFeatures(videoNames[0]);
          if (data1) setFeatures1(data1);

          const data2 = await fetchFeatures(videoNames[1]);
          if (data2) setFeatures2(data2);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchFeatureData();
  }, [videoNames, user]);

  useEffect(() => {
    if (features1?.anomaly != features2?.anomaly) {
      setAnomalies([features1?.anomaly, features2?.anomaly]);
    } else {
      setAnomalies([features1?.anomaly]);
    }
  }, [features1, features2]);

  const getName = (videoName: string) => {
    const parts = videoName.split("/");
    return parts[parts.length - 2];
  };

  const toggleSettingsDialog = () => {
    logger.info(`Settings opened: ${!settingsOpen}`);
    setSettingsOpen(!settingsOpen);
  };

  const togglePlayback = () => {
    logger.info(`Playback paused: ${!playbackPaused}`);
    setPlaybackPaused(!playbackPaused);
    if (playbackPaused) {
      player1.current?.play();
      player2.current?.play();
    } else {
      player1.current?.pause();
      player2.current?.pause();
    }
  };

  useEffect(() => {
    if (!settingsOpen) {
      if (!video1Ended) {
        player1.current?.play();
      }
      if (!video2Ended) {
        player2.current?.play();
      }
    } else {
      player1.current?.pause();
      player2.current?.pause();
    }
  }, [settingsOpen, video1Ended, video2Ended]);

  const handleVideo1Ended = () => {
    console.log(`Video 1 finished: ${videoNames[0]}`);
    setVideo1Ended(true);
  };
  const handleVideo2Ended = () => {
    console.log(`Video 2 finished: ${videoNames[1]}`);
    setVideo2Ended(true);
  };

  useEffect(() => {
    if (video1Ended && video2Ended) {
      console.log(`Both videos finished.`);
      setVideo1Ended(false);
      setVideo2Ended(false);

      player1.current?.play();
      player2.current?.play();
    }
  }, [video1Ended, video2Ended]);

  const constructFormData = (preference: string) => {
    const formData = new FormData();

    formData.append("video1", videoNames[0]);
    formData.append("video2", videoNames[1]);
    formData.append("pref_vid", preference);

    return formData;
  };

  const handleVideoPreference = async (preference: string) => {
    try {
      const response = await submitScore(
        constructFormData(preference),
        user,
        systemType
      );

      if (!response.endsWith(".csv") && systemType === "experiment") {
        console.log("Special message!");
        setFinishOpen(true);
        setMessage(response);
      }

      logger.info(`Preference submitted: ${preference}`);
      await getVideos();
      updateActive(null, "Null");
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error occurred:", error);
    }
  };

  const handleConfirmPreference = () => {
    logger.info(`Confirm button pressed.`);
    if (!selected) {
      alert("Please select a valid option.");
    } else {
      handleVideoPreference(selected);
      setSelected("");
    }
  };

  const handleStartDialog = (userID: string, systemType: string) => {
    logger.info(`Experiment begun.`);
    setUser(userID);
    setSystemType(systemType);
    setStartOpen(false);
  };

  const updateActive = (keyframeCurr: string | null, keyframeType: string) => {
    if (keyframeType === "Null") {
      setActive([null, "None", null]);
    } else if (keyframeType === "Shared") {
      setActive([null, `${keyframeType}: ${keyframeCurr}`, null]);
    } else if (keyframeType === "Left Video") {
      setActive([`${keyframeType}: ${keyframeCurr}`, null, active[2]]);
    } else if (keyframeType === "Right Video") {
      setActive([active[0], null, `${keyframeType}: ${keyframeCurr}`]);
    }
    console.log(`Active: ${active}`);
  };

  console.log(
    `Video1 anomaly: ${features1?.anomaly}, Video2 anomaly: ${features2?.anomaly}`
  );

  return (
    <div className="text-black dark:text-white p-4">
      {/* Dialog boxes */}
      {settingsOpen && (
        <SettingsDialog
          onClose={toggleSettingsDialog}
          user={user}
          systemType={systemType}
          logger={logger}
        />
      )}

      {startOpen && (
        <StartDialog
          onClose={() => setStartOpen(false)}
          onStart={handleStartDialog}
          logger={logger}
        />
      )}

      {finishOpen && (
        <FinishDialog text={message} onClose={() => setFinishOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-col justify-evenly">
        {/* Row 1: title and settings */}
        <div className="flex-grow mb-8">
          <div className="flex justify-between items-center">
            <div className="flex-grow">
              <h1 className="text-4xl font-bold text-black dark:text-white relative text-center">
                User Preference Labeling System
              </h1>
            </div>
            <Settings
              className={`text-black dark:text-white h-6 w-6 cursor-pointer shadow-xl transition-all ${settingsOpen ? "transform rotate-90" : ""
                }`}
              onClick={toggleSettingsDialog}
            />
          </div>
        </div>

        <div className="flex flex-row flex-grow">
          {/* Row 2, Col 1: preference button and video 1 */}
          <div className="mr-[-30px] flex-grow">
            <div className="flex flex-col items-center">
              <button
                className={`px-4 py-2 transition-all ${selected === videoNames[0]
                    ? "bg-gradient-to-r from-cyan-300 to-blue-300 font-extrabold text-blue-950"
                    : "bg-gradient-to-r from-cyan-950 to-blue-950 font-extralight text-white"
                  } rounded-md shadow-md mb-2 active:translate-y-0.5`}
                onClick={() => {
                  setSelected(videoNames[0]);
                  logger.info(`Video 1 selected: ${videoNames[0]}`);
                }}
              >
                I prefer video 1
              </button>
              <VideoBox
                source={videoSources[0]}
                handleExternalPlaybackToggle={handleExternalPlaybackToggle}
                colour="bg-gradient-to-r from-yellow-300 to-orange-300"
                videoKey={videoSources[0]}
                ref={player1}
                id={videoNames[0]}
                side={"Left Video"}
                onEnded={handleVideo1Ended}
                updateActive={updateActive}
                active={active}
                keyframes={keyframes1}
                updatePlaybackRange={updatePlaybackRange1}
                start={playbackRange1[0]}
                end={playbackRange1[1]}
                resetVideo={resetVideo1}
                systemType={systemType}
                anomalies={anomalies}
                anomalyInRed={anomalies[0]}
                features={features1}
                stats={stats}
                logger={logger}
              />
            </div>
          </div>

          {/* Row 2, Col 2: No pref, confirm, keyframes and stats */}
          <div className="w-1/3 mt-2 mx-3 flex-grow">
            <div className="flex flex-col items-center">
              <button
                className={`px-4 py-2 transition-all text-white ${selected === "no pref"
                    ? "bg-gradient-to-r from-orange-300 to-red-300 font-extrabold text-blue-950"
                    : "bg-gradient-to-r from-orange-950 to-red-950 text-white"
                  } rounded-md shadow-md mb-4 active:translate-y-0 overflow-hidden whitespace-nowrap`}
                onClick={() => {
                  setSelected("no pref");
                  logger.info(`No preference selected.`);
                }}
              >
                No preference
              </button>
              <button
                className=" m-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-green-600 font-extrabold text-white rounded-md shadow-md transition-all active:translate-y-0.5"
                onClick={handleConfirmPreference}
              >
                Confirm
              </button>
              <div className="mt-5">
                {keyframes1 && keyframes2 && systemType === "experiment" && (
                  <div className="grid grid-cols-2 gap-2 pr-2 mb-2">
                    {keyframes1.map((frame1) =>
                      keyframes2.map((frame2) =>
                        Object.entries(frame1).map(([key]) => {
                          // Check if the keyframe exists in both keyframes1 and keyframes2
                          if (
                            Object.keys(frame2).includes(key) &&
                            key !== "collisions"
                          ) {
                            return (
                              <KeyframeButtonBasic
                                active={active}
                                side="Shared"
                                frameKey={key}
                                keyframe1={frame1}
                                keyframe2={frame2}
                                handleKeyframeClick={handleKeyframeClick}
                                key={key}
                                hovered={hover}
                                handleKeyframeHover={handleKeyframeHover}
                                handleKeyframeLeave={handleKeyframeLeave}
                              />
                            );
                          }
                          return null;
                        })
                      )
                    )}
                  </div>
                )}
                <div className="flex justify-center items-center">
                  <button
                    className="h-16 w-16 p-3 font-bold rounded-md transition-all active:translate-y-0.5 pointer-events-auto"
                    onClick={togglePlayback}
                  >
                    {playbackPaused ? <Play /> : <Pause />}
                  </button>
                  {systemType === "experiment" && (
                    <button
                      className="h-16 w-16 p-3 font-bold rounded-md transition-all active:translate-y-0.5 pointer-events-auto"
                      onClick={() => {
                        updateActive(null, "Null");
                        logger.info(`Refresh button pressed.`);
                      }}
                    >
                      <RefreshCw />
                    </button>
                  )}
                </div>
                {systemType === "experiment" && (
                  <div>
                    {anomalies.map((anomaly, index) => (
                      <div key={index}>
                        {/* <span className="text-base font-bold">{`Anomaly ${index + 1
                          }: `}</span> */}
                        <span className="text-base">{featureName[anomaly as keyof typeof featureName]}</span>

                        <AreaChart
                          anomaly={anomaly}
                          stats={stats}
                          features1={features1}
                          features2={features2}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2, Col 3: preference button and video 2 */}
          <div className="flex-grow ml-[-30px]">
            <div className="flex flex-col items-center">
              <button
                className={`px-4 py-2 transition-all ${selected === videoNames[1]
                    ? "bg-gradient-to-r from-cyan-300 to-blue-300 font-extrabold text-blue-950"
                    : "bg-gradient-to-r from-cyan-950 to-blue-950 text-white"
                  } rounded-md shadow-md mb-2 active:translate-y-0.5`}
                onClick={() => {
                  setSelected(videoNames[1]);
                  logger.info(`Video 2 selected: ${videoNames[1]}`);
                }}
              >
                I prefer video 2
              </button>
              <VideoBox
                source={videoSources[1]}
                handleExternalPlaybackToggle={handleExternalPlaybackToggle}
                colour="bg-gradient-to-r from-green-300 to-cyan-300"
                videoKey={videoSources[1]}
                ref={player2}
                id={videoNames[1]}
                side={"Right Video"}
                onEnded={handleVideo2Ended}
                updateActive={updateActive}
                active={active}
                keyframes={keyframes2}
                updatePlaybackRange={updatePlaybackRange2}
                start={playbackRange2[0]}
                end={playbackRange2[1]}
                resetVideo={resetVideo2}
                systemType={systemType}
                anomalies={anomalies}
                anomalyInRed={
                  features1?.anomaly != features2?.anomaly
                    ? anomalies[1]
                    : anomalies[0]
                }
                features={features2}
                stats={stats}
                logger={logger}
              />
            </div>
          </div>
        </div>

        {/* Row 3: stepper and user/system type */}
        <div className="flex-grow mb-3 space-y-2">
          <div className="mb-3 mt-5">
            <HorizontalNonLinearStepper completeSteps={completedSteps} />
          </div>
          {/* <Typography>
            {`Actives:   `}
            {active.join(" | ")}
          </Typography> */}
          <Typography>
            {`User: ${user}, `}
            {`System Type: ${systemType === "baseline"
                ? "Group 1"
                : systemType === "experiment"
                  ? "Group 2"
                  : systemType
              }`}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default memo(App);

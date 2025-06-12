import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*
DONE 1: Autoplay at the same time and play the video in a loop
DONE 2: Automatically save progress (locally)
TODO 3: Set milestones to keep aware of progress
DONE 4: Confirm button to avoid misoperation
TODO 5: Keyframe display (video marker -> floating: show keyframe, click: goto timestamp)
  Make another progress bar ontop of the video and override the builtin one
  When clicked onto keyframe, just play that section
  (ie; marker on keyframe, JUST play that section)
  Integrate with API to get video sections
  
DONE 6: Collapsable stats display
DONE 7: Fix themes
DONE 8: Integrate with backend
DONE 9: Separate buttons more
  Colours, distance, etc...



*/

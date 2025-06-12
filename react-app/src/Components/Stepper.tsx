import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import useMediaQuery from "@mui/material/useMediaQuery";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import Typography from "@mui/material/Typography";
import { memo } from "react";

interface ConnectorProps {
  completed: boolean;
}
interface HorizontalNonLinearStepperProps {
  completeSteps: boolean[];
}

const steps = ["Start", "", "", "", "", "", "", "", "", "", "End"];

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: useMediaQuery("(prefers-color-scheme: dark)")
        ? "#166434"
        : "#87EFAC",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: useMediaQuery("(prefers-color-scheme: dark)")
        ? "#166434"
        : "#87EFAC",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: useMediaQuery("(prefers-color-scheme: dark)")
      ? "#374151"
      : "#D1D5DB",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

function HorizontalNonLinearStepper({
  completeSteps,
}: HorizontalNonLinearStepperProps) {
  const activeIndex = completeSteps.lastIndexOf(true);
  return (
    <Box sx={{ width: "100%", marginBottom: 0, justifyContent: "center" }}>
      <Stepper
        nonLinear
        activeStep={activeIndex}
        connector={<QontoConnector />}
      >
        {steps.map((label, index) => {
          if (index == activeIndex) {
            return (
              <Step key={index} active={true}>
                <div className="flex items-center text-blue-700 dark:text-blue-400 space-x-2.5">
                  <span>
                    <p className="text-sm">{""}</p>
                  </span>
                  <span className="flex items-center transition-none justify-center w-8 h-8 border border-blue-600 bg-blue-100 border border-blue-300 rounded-full shrink-0  dark:bg-gray-800 dark:border-blue-800">
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </span>
                  <span>
                    <p className="text-sm">{label}</p>
                  </span>
                </div>
              </Step>
            );
          }
          if (completeSteps[index]) {
            return (
              <Step key={index} completed={true}>
                <div className="flex items-center text-green-700 dark:text-green-400 space-x-2.5">
                  <span>
                    <p className="text-sm">{""}</p>
                  </span>
                  <span className="flex items-center transition-none justify-center w-8 h-8 border border-green-300 dark:border-green-800 rounded-full bg-green-50 dark:bg-gray-800 shrink-0">
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  </span>
                  <span>
                    <p className="text-sm">{label}</p>
                  </span>
                </div>
              </Step>
            );
          }
          if (!completeSteps[index]) {
            return (
              <Step key={index} completed={false}>
                <div className="flex items-center text-gray-900 dark:text-gray-400 space-x-2.5">
                  <span>
                    <p className="text-sm">{""}</p>
                  </span>
                  <span className="flex items-center transition-none justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded-full shrink-0 dark:bg-gray-800 dark:border-gray-700 "></span>
                  <span>
                    <p className="text-sm">{label}</p>
                  </span>
                </div>
              </Step>
            );
          }
        })}
      </Stepper>
    </Box>
  );
}

export default memo(HorizontalNonLinearStepper);

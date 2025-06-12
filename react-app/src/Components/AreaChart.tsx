import { memo, useEffect, useRef } from "react";
import ApexCharts from "apexcharts";
import Chart from "react-apexcharts";
import all_features from "../assets/all_features.json";
import { StatisticProps, FeatureProps } from "../api";
import { useMediaQuery } from "@mui/material";
import { red } from "@mui/material/colors";

interface AreaChartProps {
  anomaly: string | undefined;
  stats: StatisticProps | null;
  features1: FeatureProps | null;
  features2: FeatureProps | null;
}

const AreaChart = ({
  anomaly,
  stats,
  features1,
  features2,
}: AreaChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  var chart: ApexCharts | null = null;

  const plotData = () => {
    if (!anomaly || !stats || !features1 || !features2) return;

    const mean = stats[anomaly as keyof typeof stats].mean;
    const std = stats[anomaly as keyof typeof stats].std;

    const currSection = all_features[anomaly as keyof typeof all_features];
    const currSectionDensity =
      all_features[`${anomaly}_density` as keyof typeof all_features];
    const features1Anomaly = Number(
      Number(features1[anomaly as keyof typeof features1]).toFixed(10)
    );
    const features2Anomaly = Number(
      Number(features2[anomaly as keyof typeof features2]).toFixed(10)
    );
    let values = [
      [0, 0],
      [0, 0],
    ];

    let redBlue = ["", ""];

    if (features1.anomaly != features2.anomaly) {
      if (features1.anomaly === anomaly) {
        redBlue = ["#DB4437", "#008FFB"];
      } else {
        redBlue = ["#008FFB", "#DB4437"];
      }
    } else {
      redBlue = ["#DB4437", "#DB4437"];
    }

    const graphStats = { mean: mean, std: std };

    Object.entries(currSection).forEach(([key, value]) => {
      if (value === features1Anomaly) {
        const density =
          currSectionDensity[key as keyof typeof currSectionDensity];
        values[0] = [value, density];
      }
      if (value === features2Anomaly) {
        const density =
          currSectionDensity[key as keyof typeof currSectionDensity];
        values[1] = [value, density];
      }
    });

    const anomalyData = Object.values(currSection).map((v, i) => ({
      x: v,
      y: Object.values(currSectionDensity)[i],
    }));
    anomalyData.sort((a, b) => a.x - b.x);
    const xValues = anomalyData.map((v) => v.x);
    const yValues = anomalyData.map((v) => v.y);

    let sumDiff = 0;
    for (let i = 1; i < xValues.length; i++) {
      sumDiff += Math.abs(xValues[i] - xValues[i - 1]);
    }

    const avgDiff = sumDiff / (xValues.length - 1);

    createChart(anomaly, xValues, yValues, values, graphStats, redBlue, avgDiff);
  };

  useEffect(() => {
    plotData();
    // window.dispatchEvent(new Event("resize"));
  }, [anomaly, stats, features1, features2]);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const createChart = (
    anomaly: string,
    xValues: number[],
    yValues: number[],
    values: number[][],
    graphStats: { mean: number; std: number },
    redBlue: string[],
    avgDiff: number
  ) => {
    const chartOptions = {
      series: [
        {
          name: "Density",
          data: yValues,
        },
      ],
      tooltip: {
        y: {
          formatter: function (
            value: number,
            { series, seriesIndex, dataPointIndex, w }: any
          ) {
            return value.toFixed(2);
          },
        },
      },
      xaxis: {
        type: "numeric",
        categories: xValues,
        min: Math.min(...xValues) - 1.1 * avgDiff,
        max: Math.max(...xValues) + 1.1 * avgDiff,
      },
      yaxis: {
        show: false,
      },
      chart: {
        id: anomaly,
        type: "area",
        width: "100%",
        background: "none",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 6,
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.75,
          opacityTo: 0.25,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
        },
      },
      annotations: {
        xaxis: [
          {
            x: values[0][0],
            strokeDashArray: 0,
            borderColor: redBlue[0],
            borderWidth: 3,
            label: {
              position:
                Math.abs(values[0][0] - values[1][0]) < 1.5 * avgDiff
                  ? "bottom"
                  : "top",
              style: {
                color: "#000",
                background: "#FDD25A",
              },
              text: "Video 1",
            },
          },
          {
            x: values[1][0],
            strokeDashArray: 0,
            borderColor: redBlue[1],
            borderWidth: 3,
            label: {
              style: {
                border: "none",
                color: "#000",
                background: "#77EBD4",
              },
              text: "Video 2",
            },
          },
          {
            x: graphStats.mean - 0.5 * graphStats.std,
            x2: graphStats.mean,
            fillColor: "#59F2CA",
          },
          {
            x: graphStats.mean,
            x2: graphStats.mean + 0.5 * graphStats.std,
            fillColor: "#B3F7CA",
            label: {
              style: {
                color: "#000",
                background: "#FFF",
              },
              text: "Mean +/- 0.5 SD",
              orientation: "horizontal",
            },
          },
        ],
      },

      theme: {
        mode: prefersDarkMode ? "dark" : "light",
        palette: "palette1",
      },
    };

    if (!chart) {
      chart = new ApexCharts(chartRef.current, chartOptions);
      chart.render();
    }

    chart.updateOptions(chartOptions, true, true, true);
  };

  return (
    <>
      <div
        key="testKey"
        className="text-black dark:text-white overflow-visible w-full"
        id="boxPlotChart"
        ref={chartRef}
      ></div>
    </>
  );
};

export default memo(AreaChart);

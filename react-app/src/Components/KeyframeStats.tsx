import { memo } from "react";
import { FeatureProps, StatisticProps } from "../api";
import featureName from "../assets/feature_name.json";

interface KeyframeStatsProps {
  features: FeatureProps | null;
  stats: StatisticProps | null;
  anomalies: (string | undefined)[];
  anomalyInRed: string | undefined;
}

function KeyframeStats({
  features,
  stats,
  anomalies,
  anomalyInRed,
}: KeyframeStatsProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          {features ? (
            <>
              {Object.entries(features).map(([key, value]) => {
                // Check if the key is present in the anomalies array
                if (anomalies.includes(key)) {
                  const statistic = stats?.[key as keyof StatisticProps];

                  return (
                    <div key={key} className="mb-2">
                      {statistic && (
                        <div>
                          <h1 className="text-base">
                            <span
                              className={`font-extrabold ${
                                key === anomalyInRed ? "text-red-400" : ""
                              }`}
                            >
                              {featureName[key as keyof typeof featureName]}:
                            </span>{" "}
                            {value.toFixed(3)}
                          </h1>
                          <p className="text-sm">
                            <span className="font-medium">Mean:</span>{" "}
                            {statistic.mean.toFixed(3)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              Standard Deviation:
                            </span>{" "}
                            {statistic.std.toFixed(3)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </>
          ) : (
            <p>Loading stats...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KeyframeStats);

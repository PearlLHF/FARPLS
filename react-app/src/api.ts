import axios from 'axios';
import { resetLogs } from './logger';

axios.defaults.baseURL = "";

export const downloadPreferences = async (user: string, systemType: string) => {
  console.log("Downloading preferences...");
  try {
    const response = await axios.get(`/download/${systemType}/${user}`, {
      responseType: "blob",
    });
    // Handle success
    const url_2 = URL.createObjectURL(response.data);

    const link = document.createElement("a");
    link.href = url_2;
    link.setAttribute("download", "preferences.txt");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_2);
  } catch (error) {
    // Handle error
    console.log(error);
  }
};

export const fetchVideos = async (user: string, system: string) => {
  console.log("Fetching videos...");
  try {
    if (!user) {
      throw new Error("No user provided");
    }
    if (!system) {
      throw new Error("No system provided");
    }
    const response = await axios.get(
      `/query/${system}/${user}`
    );

    if (!Array.isArray(response) && typeof response === "string") {
      return response;
    }

    const fixedResponse = response.data.map(
      (url: string) => `${axios.defaults.baseURL}${url}`
    );

    return (fixedResponse);
  } catch (error) {
    console.log(error);

  }
};

export const resetPreferences = (user: string, systemType: string) => {
  console.log("Resetting preferences...");
  axios
    .get(`/reset/${systemType}/${user}`)
    .then(function (response) {
      // Handle success
      window.location.reload();
      resetLogs();
      console.log(`Reset: ${response.data}`);
    })
    .catch(function (error) {
      // Handle error
      console.log(error);

    })
};

export const submitScore = async (formData: FormData, user: string, systemType: string) => {
  console.log("Submitting scores...");
  try {
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await axios.post(
      `/submit/${systemType}/${user}`,
      formData
    );

    console.log(`Submitted: ${response.data}`);
    return response.data;
  } catch (error) {
    console.log(error);

  }
};

export const fetchProgress = async (user: string, systemType: string) => {
  console.log("Fetching progress...");
  try {
    if (!user) {
      throw new Error("No user provided");
    }
    if (!systemType) {
      throw new Error("No system provided");
    }
    const response = await axios.get(
      `/progress/${systemType}/${user}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};


export interface FeatureProps {
  "num_collisions": number
  "max_height_to_table": number
  "min_distance_to_edge": number
  "max_ee_force": number
  "avg_speed": number
  "reach_length": number
  "grasp_length": number
  "obj_path_length": number
  "total_time": number
  "pseudo_cost": number
  "speed_smoothness": number
  "trajectory_smoothness": number
  "anomaly": string
}

export const fetchFeatures = async (id: string) => {
  console.log("Fetching features...");
  try {
    if (!id) {
      throw new Error("No id provided");
    }

    const response = await axios.get(`/feature/${id}`);

    const data = response.data;

    const features: FeatureProps = {
      num_collisions: data.num_collisions,
      max_height_to_table: data.max_height_to_table,
      min_distance_to_edge: data.min_distance_to_edge,
      max_ee_force: data.max_ee_force,
      avg_speed: data.avg_speed,
      reach_length: data.reach_length,
      grasp_length: data.grasp_length,
      obj_path_length: data.obj_path_length,
      total_time: data.total_time,
      pseudo_cost: data.pseudo_cost,
      speed_smoothness: data.speed_smoothness,
      trajectory_smoothness: data.trajectory_smoothness,
      anomaly: data.anomaly,
    };

    return features;
  } catch (error) {
    console.log(error);

  }
};

interface KeyframeData {
  "collisions": [number, number, string][];
  "highest_point": [[number, number], string];
  "nearest_point_to_edge": [[number, number], string];
  "pick_up_point": [[number, number], string];
  "release_point": [[number, number], string];
}

export type Keyframe = Partial<KeyframeData>;

export const fetchKeyframes = async (id: string): Promise<Keyframe[]> => {
  console.log("Fetching keyframes...");
  try {
    if (!id) {
      throw new Error("No id provided");
    }

    const response = await axios.get(`/keyframe/${id}`);
    const data: KeyframeData = response.data;

    const keyframes: Keyframe[] = [
      { ...data },
    ];

    return keyframes;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export interface StatisticProps {
  "avg_speed": FeatureStats;
  "max_height_to_table": FeatureStats;
  "min_distance_to_edge": FeatureStats;
  "grasp_pos": FeatureStats;
  "max_ee_force": FeatureStats;
  "max_obj_to_eef_angle": FeatureStats;
  "num_collisions": FeatureStats;
  "grasp_length": FeatureStats;
  "obj_path_length": FeatureStats;
  "reach_length": FeatureStats;
  "pseudo_cost": FeatureStats;
  "speed_smoothness": FeatureStats;
  "total_time": FeatureStats;
  "trajectory_smoothness": FeatureStats;
}

export interface FeatureStats {
  "max": number;
  "mean": number;
  "median": number;
  "min": number;
  "percentile_25": number;
  "percentile_75": number;
  "std": number;
}

export const fetchStats = async () => {
  console.log("Fetching stats...");
  try {
    const response = await axios.get(`/feature/stats`);

    const data = response.data;

    const stats: StatisticProps = {
      num_collisions: data.num_collisions,
      max_height_to_table: data.max_height_to_table,
      min_distance_to_edge: data.min_distance_to_edge,
      max_ee_force: data.max_ee_force,
      avg_speed: data.avg_speed,
      reach_length: data.reach_length,
      grasp_length: data.grasp_length,
      obj_path_length: data.obj_path_length,
      total_time: data.total_time,
      pseudo_cost: data.pseudo_cost,
      speed_smoothness: data.speed_smoothness,
      trajectory_smoothness: data.trajectory_smoothness,
      grasp_pos: data.grasp_pos,
      max_obj_to_eef_angle: data.max_obj_to_eef_angle,
    };

    return stats;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};


export function submitLog(systemType: string, user: string) {
  if (!user) {
    console.log("No user provided");
    return;
  }
  if (!systemType) {
    console.log("No system provided");
    return;
  }
  const logs = localStorage.getItem("logs") || "";
  let formData = new FormData();
  console.log("Submitting logs...");
  formData.append("log", logs);

  const response = axios
    .post(`/log/${systemType}/${user}`, formData)
    .then(() => {
      console.log("Logs submitted successfully");
      localStorage.setItem("logs", "");
      resetLogs();
    })
    .catch((error) => {
      console.warn("Failed to submit logs:", error);
    });
  console.log('Logs are saved to', response);
}
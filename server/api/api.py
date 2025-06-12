"""
This module contains functions for the API of a trajectory preference collection tool. 
"""
import os
import json
import pandas as pd
from model.prompter import Prompter
from model.shared import (
    prompter_dict,
    videos2pair_id,
    reset_prompted_pair_id,
    reset_all_user_pref,
)

DB_DIR = "database/"
VIDEO_STATIC_DIR = "/videos"
VIDEO_DIR = os.path.join(DB_DIR, "videos")
KEYFRAME_DIR = os.path.join(DB_DIR, "keyframes")
BASELINE_DIR = os.path.join(DB_DIR, "baseline")
EXPERIMENT_DIR = os.path.join(DB_DIR, "experiment")
HISTORY_DIR = os.path.join(DB_DIR, "history")


def get_video_static_path(video_id):
    """
    Returns the static path to a video given its ID.

    Args:
        video_id (str): The ID of the video.

    Raises:
        ValueError: If the video ID is invalid.

    Returns:
        str: The static path to the video.
    """
    static_path = os.path.join(VIDEO_STATIC_DIR, video_id, f"{video_id}_frontview.mp4")
    if not os.path.exists(os.path.join(DB_DIR, static_path[1:])):
        raise ValueError(f"Video {video_id} does not exist.")
    return static_path


def get_feature_stats():
    """
    Returns a dictionary containing statistics about the features of the keyframes.

    Returns:
        dict: A dictionary containing statistics about the features of the keyframes.
    """
    with open(
        os.path.join(KEYFRAME_DIR, "feature_stats.json"), "r", encoding="utf-8"
    ) as f:
        return json.load(f)


def get_video_keyframes(video_id):
    """
    Returns the keyframes of a video as a list of dictionaries.

    Args:
        video_id (str): The ID of the video.

    Returns:
        list: A list of dictionaries, where each dictionary represents a keyframe.
    """
    json_path = os.path.join(KEYFRAME_DIR, video_id, f"{video_id}_keyframes.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_video_features(video_id):
    """
    Returns the feature data for a given video ID.

    Args:
        video_id (str): The ID of the video to retrieve features for.

    Returns:
        dict: A dictionary containing the feature data for the specified video.
    """
    json_path = os.path.join(KEYFRAME_DIR, video_id, f"{video_id}_features.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_keyframe_image_path(video_id, img_name):
    """
    Returns the path to a keyframe image for a given video ID and image name.

    Args:
        video_id (str): The ID of the video.
        img_name (str): The name of the image.

    Returns:
        tuple: A tuple containing the path to the keyframe image and the image name.
    """
    keyframe_image_path = os.path.join(KEYFRAME_DIR, video_id)
    if not os.path.exists(keyframe_image_path):
        raise ValueError(f"Keyframe with video {video_id} does not exist.")
    return keyframe_image_path, img_name


def get_video_path(video_id, video_name):
    """
    Returns the path to a video for a given video ID.

    Args:
        video_id (str): The ID of the video.

    Returns:
        tuple: A tuple containing the path to the video and the video name.
    """
    video_path = os.path.join(VIDEO_DIR, video_id)
    if not os.path.exists(video_path):
        raise ValueError(f"Video with video {video_id} does not exist.")
    return video_path, video_name


def query_video_pair(uid, mode="baseline"):
    """
    Returns a pair of videos for the user to rate based on the given mode.

    Args:
        uid (str): The user ID.
        mode (str, optional):
            The mode to use. Can be "baseline" or "experiment". Defaults to "baseline".

    Raises:
        ValueError: If the user ID is invalid.
        StopIteration: If there are no more video pairs to be rated.
        ValueError: If the mode is invalid.

    Returns:
        tuple: A tuple containing the pair of videos to be rated.
    """
    if mode not in ["baseline", "experiment"]:
        raise ValueError("Invalid mode")
    if uid == "test":
        mode = "baseline"

    prompter = None
    if uid in prompter_dict:
        prompter = prompter_dict[uid]
    else:
        prompter = Prompter(uid)
        prompter_dict[uid] = prompter

    next_pair = prompter.get_next_pair()
    if next_pair is None:
        raise StopIteration("No more video pairs to label.")

    print(f"Next pair: {next_pair}")
    return next_pair


def update_user_pref(uid, vid_pair, pref_vid, mode="baseline"):
    """
    Updates the user's preference for a given video pair.

    Args:
        uid (str): The user ID.
        vid_pair (tuple): A tuple of two video IDs.
        pref_vid (str): The preferred video ID.
        mode (str, optional): The mode of preference collection. Defaults to "baseline".

    Returns:
        str: The path of the user preference csv file.
    Raises:
        ValueError: If an invalid mode is provided.
    """
    if mode not in ["baseline", "experiment"]:
        raise ValueError("Invalid mode")
    if uid == "test":
        mode = "baseline"

    prompter = None
    if uid in prompter_dict:
        prompter = prompter_dict[uid]
    else:
        prompter = Prompter(uid)
        prompter_dict[uid] = prompter

    pair_id = videos2pair_id(*vid_pair)
    video1, video2, pref = prompter.pref_vid2pref(pair_id, pref_vid)
    user_csv_path = os.path.join(DB_DIR, mode, f"{uid}_pref.csv")
    user_df = pd.read_csv(user_csv_path)
    entry = user_df.loc[
        (user_df["video1"] == video1) & (user_df["video2"] == video2),
        ["video1", "video2", "pref"],
    ]
    if len(entry) != 0:
        if entry["pref"].values[0] != -1:
            user_df.loc[entry.index[0], "pref"] = (pref + entry["pref"].values[0]) / 2
        else:
            user_df.loc[entry.index[0], "pref"] = pref
    else:
        entry = user_df.loc[
            (user_df["video1"] == video2) & (user_df["video2"] == video1),
            ["video1", "video2", "pref"],
        ]
        user_df.loc[entry.index[0], ["video1", "video2"]] = [video1, video2]
        if entry["pref"].values[0] != -1:
            user_df.loc[entry.index[0], "pref"] = (pref + entry["pref"].values[0]) / 2
        else:
            user_df.loc[entry.index[0], "pref"] = pref
    user_df.to_csv(user_csv_path, index=False)

    prompter.update_history(pair_id, pref)

    return user_csv_path


def get_user_progress(uid, mode="baseline"):
    """
    Returns the progress of the user.

    Args:
        uid (str): The user ID.
        mode (str, optional): The mode of preference collection. Defaults to "baseline".

    Returns:
        dict: A dictionary containing the progress of the user.
    """
    if mode not in ["baseline", "experiment"]:
        raise ValueError("Invalid mode")

    prompter = None
    if uid in prompter_dict:
        prompter = prompter_dict[uid]
    else:
        prompter = Prompter(uid)
        prompter_dict[uid] = prompter

    return prompter.get_progress()


def reset_user(uid, mode="baseline"):
    """
    Resets all user preferences for the given user ID and mode.

    Args:
        uid (str): The user ID to reset preferences for.
        mode (str, optional): The mode to reset preferences for. Defaults to "baseline".

    Returns:
        str: The path of the user preference csv file.

    Raises:
        ValueError: If an invalid mode is specified.
    """
    if mode not in ["baseline", "experiment"]:
        raise ValueError("Invalid mode")
    if uid == "test":
        mode = "baseline"

    user_csv_path = os.path.join(DB_DIR, mode, f"{uid}_pref.csv")
    user_df = pd.read_csv(user_csv_path)
    user_df["pref"] = -1
    user_df.to_csv(user_csv_path, index=False)

    if mode == "experiment":
        reset_prompted_pair_id(uid)
        reset_all_user_pref(uid)

    user_history_path = os.path.join(HISTORY_DIR, f"{uid}_history.csv")
    user_consistency_path = os.path.join(HISTORY_DIR, f"{uid}_consistency.csv")

    if os.path.exists(user_history_path):
        os.remove(user_history_path)

    if os.path.exists(user_consistency_path):
        os.remove(user_consistency_path)

    prompter_dict.pop(uid, None)
    return user_csv_path


def get_user_csv_path(uid, mode="baseline"):
    """
    Returns the path to the user preference csv file.

    Args:
        uid (str): The user ID.
        mode (str, optional): The mode of preference collection. Defaults to "baseline".

    Returns:
        tuple: A tuple containing the path to the user preference csv file and the filename.

    Raises:
        ValueError: If an invalid mode is specified.
    """
    if mode not in ["baseline", "experiment"]:
        raise ValueError("Invalid mode")
    if uid == "test":
        mode = "baseline"

    return os.path.join(DB_DIR, mode), f"{uid}_pref.csv"

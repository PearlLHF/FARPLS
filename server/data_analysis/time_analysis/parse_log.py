# %%
import numpy as np
import pandas as pd
import argparse
from datetime import datetime

# %%
# uid = "U41"
parser = argparse.ArgumentParser()
parser.add_argument("--user_id", type=str, help="user id")
args = parser.parse_args()
uid = args.user_id

# %%
pair_information = pd.read_csv("../../database/data_assignment/pair_information.csv")
pair_information = pair_information.set_index("pair_id")[["video1", "video2"]]


# %%
def pref2pref_vid(pair_id, pref):
    if pref == 0.5 or pref == 0.25 or pref == 0.75:
        return "no pref"
    else:
        return pair_information.loc[pair_id][int(pref)]


# %%
def videos2pair_id(video1, video2):
    return int(
        pair_information[
            (
                (pair_information["video1"] == video1)
                & (pair_information["video2"] == video2)
            )
            | (
                (pair_information["video1"] == video2)
                & (pair_information["video2"] == video1)
            )
        ].index.values[0]
    )


# %%
lines = None
log_path = None
if int(uid[-2:]) % 2 == 0:
    log_path = f"../../log/experiment/{uid}.log"
else:
    log_path = f"../../log/baseline/{uid}.log"

with open(log_path) as log_f:
    lines = log_f.readlines()

# %%
fmt = "%Y-%m-%dT%H:%M:%S.%fZ"
start_time = None
end_time = None

time_df = pd.DataFrame(columns=["start_time", "end_time", "duration_in_seconds"])
attention_check_index = [16, 27, 38, 49, 60, 71, 82, 93, 104, 115]

submitted_video = None

# %%
block_idx = pd.DataFrame(columns=["start_idx", "end_idx", "pair_id", "submitted_video"])
block_start_idx = -1
block_end_idx = -1
pair_id = None
submitted_video = None
videos = set()
all_pair_id = set()
prev_pair_id = None
prev_submitted_video = None
for i, line in enumerate(lines):
    if (
        ("Video playing:" in line and "undefined" not in line)
        or "Hovered:" in line
        or "Clicked:" in line
    ):
        block_start_idx = i if block_start_idx == -1 else block_start_idx
        if "Video playing:" in line:
            video = line.split("Video playing: ")[-1].strip()
            if video and video != "undefined":
                videos.add(video)
    if "User ID started:" in line or "undefined" in line:
        if (
            block_start_idx != -1
            and block_end_idx != -1
            and submitted_video is not None
            and block_end_idx > block_start_idx
        ):
            if submitted_video != "undefined" and submitted_video != "no pref":
                videos.add(submitted_video)
            if len(videos) == 2:
                pair_id = videos2pair_id(*videos)
            else:
                pair_id = None
            if (
                (pair_id != prev_pair_id or pair_id is None or prev_pair_id is None)
                and (submitted_video != prev_submitted_video or submitted_video == "no pref")
            ) and submitted_video != "undefined":
                if pair_id not in all_pair_id:
                    if pair_id is not None:
                        all_pair_id.add(pair_id)
                    block_idx = pd.concat(
                        [
                            block_idx,
                            pd.DataFrame(
                                [
                                    [
                                        block_start_idx,
                                        block_end_idx,
                                        pair_id,
                                        submitted_video,
                                    ]
                                ],
                                columns=[
                                    "start_idx",
                                    "end_idx",
                                    "pair_id",
                                    "submitted_video",
                                ],
                                index=[block_idx.shape[0]],
                            ),
                        ],
                        axis=0,
                    )
                prev_pair_id = pair_id
                prev_submitted_video = submitted_video
        pair_id = None
        submitted_video = None
        block_start_idx = i if "User ID started:" in line else -1
        block_end_idx = -1
    if "selected: " in line:
        block_start_idx = i if block_start_idx == -1 else block_start_idx
        submitted_video = line.split("selected: ")[-1].strip()
    if "Confirm button pressed." in line:
        if block_start_idx != -1:
            block_end_idx = i if block_end_idx == -1 else block_end_idx
        else:
            block_end_idx = -1
    if "Preference submitted:" in line:
        if (
            block_start_idx != -1
            and block_end_idx != -1
            and block_end_idx > block_start_idx
        ):
            if submitted_video is None:
                submitted_video = line.split("submitted: ")[-1].strip()
                if submitted_video != "undefined" and submitted_video != "no pref":
                    videos.add(submitted_video)
            if len(videos) == 2:
                pair_id = videos2pair_id(*videos)
            else:
                pair_id = None
            if (
                pair_id != prev_pair_id or pair_id is None or prev_pair_id is None
            ) and submitted_video != "undefined":
                if pair_id not in all_pair_id:
                    if pair_id is not None:
                        all_pair_id.add(pair_id)
                    block_idx = pd.concat(
                        [
                            block_idx,
                            pd.DataFrame(
                                [
                                    [
                                        block_start_idx,
                                        block_end_idx,
                                        pair_id,
                                        submitted_video,
                                    ]
                                ],
                                columns=[
                                    "start_idx",
                                    "end_idx",
                                    "pair_id",
                                    "submitted_video",
                                ],
                                index=[block_idx.shape[0]],
                            ),
                        ],
                        axis=0,
                    )
                prev_pair_id = pair_id
                prev_submitted_video = submitted_video
        videos = set()
        pair_id = None
        submitted_video = None
        block_start_idx = -1
        block_end_idx = -1

# %%
print(len(all_pair_id))
block_idx

# %%
for i, block in block_idx.iterrows():
    start_idx = block["start_idx"]
    end_idx = block["end_idx"]
    pair_id = block["pair_id"]
    submitted_video = block["submitted_video"]
    start_time = datetime.strptime(lines[start_idx].split("]")[0][1:], fmt)
    end_time = datetime.strptime(lines[end_idx].split("]")[0][1:], fmt)
    duration_in_seconds = (end_time - start_time).total_seconds()
    if i > 0 and start_time < time_df["start_time"].max():
        print(block.values)
        continue
    time_df = pd.concat(
        [
            time_df,
            pd.DataFrame(
                [[start_time, end_time, duration_in_seconds]],
                columns=["start_time", "end_time", "duration_in_seconds"],
                index=[time_df.shape[0]],
            ),
        ],
        axis=0,
    )

# %%
assert (time_df.sort_values(by="start_time") == time_df).values.all()
print(len(time_df))
print((block_idx["submitted_video"] == "no pref").sum())

# %%
time_df.to_csv("time/log_time/{}_time.csv".format(uid), index=False)

# %%

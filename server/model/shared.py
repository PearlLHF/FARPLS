import logging
import os
import sys

import pandas as pd

this = sys.modules[__name__]  # For holding module globals

ALL_USER_PREF_PATH = "database/experiment/all_user_pref.csv"
ALL_USER_PREF_COLUMNS = [
    "pair_id",
    "video1",
    "video2",
    "user_id",
    "pref",
    "pair_feature",
]
PROMPT_HISTORY_PATH = "database/experiment/prompt_history.csv"
PAIR_INFORMATION_PATH = "database/data_assignment/pair_information.csv"

this.prompter_dict = {}


def add_file_handler(logger, path):
    """
    Add file handler to logger
    """
    fh = logging.FileHandler(path)
    fh.setLevel(logging.DEBUG)  # ensure all messages are logged to file

    # create a formatter and set the formatter for the handler.
    frmt = logging.Formatter("%(message)s")
    fh.setFormatter(frmt)

    # add the Handler to the logger
    logger.handlers.clear()
    logger.addHandler(fh)


# create logger
pref_lgr = logging.getLogger("all_user_pref")
pref_lgr.setLevel(logging.DEBUG)  # log all escalated at and above DEBUG

# add a file handler
if not os.path.exists(ALL_USER_PREF_PATH):
    add_file_handler(pref_lgr, ALL_USER_PREF_PATH)
    pref_lgr.info("%s", "pair_id,video1,video2,user_id,pref,pair_feature")
else:
    add_file_handler(pref_lgr, ALL_USER_PREF_PATH)


prompting_lgr = logging.getLogger("prompt_history")
prompting_lgr.setLevel(logging.DEBUG)

add_file_handler(prompting_lgr, PROMPT_HISTORY_PATH)

# pair information
this.all_pair_df = pd.read_csv(PAIR_INFORMATION_PATH)[
    ["pair_id", "video1", "video2", "pair_feature", "dist"]
]
this.all_pair_df["pair_id"] = this.all_pair_df["pair_id"].astype(int)


def videos2pair_id(video1, video2):
    """Return the pair id for the video pair.

    Args:
        video1 (str): the name of the first video
        video2 (str): the name of the second video

    Returns:
        pair_id (int): the pair id for the video pair
    """
    return int(
        this.all_pair_df[
            (
                (this.all_pair_df["video1"] == video1)
                & (this.all_pair_df["video2"] == video2)
            )
            | (
                (this.all_pair_df["video1"] == video2)
                & (this.all_pair_df["video2"] == video1)
            )
        ][["pair_id"]].values[0]
    )


def pair_id2videos(pair_id):
    """Return the video pair for the pair id.

    Args:
        pair_id (int): the pair id for the video pair

    Returns:
        video1 (str): the name of the first video
        video2 (str): the name of the second video
    """
    return this.all_pair_df[this.all_pair_df["pair_id"] == pair_id][
        ["video1", "video2"]
    ].values.tolist()[0]


# read the prompted pair id
this.prompted_pair_id = []


def reset_prompted_pair_id(user_id=None):
    """Reset the prompted pair id history list."""
    # Remove the user's history from the all history file
    if user_id is None:
        this.prompted_pair_id = []
        os.remove(PROMPT_HISTORY_PATH)
        add_file_handler(prompting_lgr, PROMPT_HISTORY_PATH)
    else:
        user_history_path = f"database/history/{user_id}_history.csv"
        if os.path.exists(PROMPT_HISTORY_PATH) and os.path.exists(user_history_path):
            user_history_pair_id = pd.read_csv(user_history_path)["pair_id"].values
            os.remove(PROMPT_HISTORY_PATH)
            add_file_handler(prompting_lgr, PROMPT_HISTORY_PATH)
            _ = [
                this.prompted_pair_id.remove(pair_id)
                for pair_id in user_history_pair_id
                if pair_id in this.prompted_pair_id
            ]
            _ = [prompting_lgr.info("%s", pair_id) for pair_id in this.prompted_pair_id]


def get_prompted_pair_id():
    """
    Return the prompted pair id history list
    """
    if os.path.exists(PROMPT_HISTORY_PATH):
        with open(PROMPT_HISTORY_PATH, "r", encoding="utf-8") as f:
            pair_id_list = f.read().split("\n")
            # map the pair_id to int
            this.prompted_pair_id = [
                int(pair_id) for pair_id in pair_id_list if pair_id != ""
            ]
    return this.prompted_pair_id


def log_prompted_pair(pair_id):
    """Log the prompted pair id."""
    prompting_lgr.info("%s", pair_id)
    return


# read the all user pref
this.all_user_pref = pd.DataFrame(columns=ALL_USER_PREF_COLUMNS)


def reset_all_user_pref(user_id=None):
    """Reset all user preferences for the given user ID."""
    if user_id is None:
        this.all_user_pref = pd.DataFrame(columns=ALL_USER_PREF_COLUMNS)
        os.remove(ALL_USER_PREF_PATH)
        add_file_handler(pref_lgr, ALL_USER_PREF_PATH)
        pref_lgr.info("%s", "pair_id,video1,video2,user_id,pref,pair_feature")
    else:
        # Remove the user's preferences from the all user preference file
        if os.path.exists(ALL_USER_PREF_PATH):
            this.all_user_pref = this.all_user_pref[
                this.all_user_pref["user_id"] != user_id
            ].copy()
            os.remove(ALL_USER_PREF_PATH)
            add_file_handler(pref_lgr, ALL_USER_PREF_PATH)
            pref_lgr.info("%s", "pair_id,video1,video2,user_id,pref,pair_feature")
            _ = [
                pref_lgr.info(
                    "%s",
                    f'{str(pair_id)},{video1},{video2},{user_id},{str(pref)},"{pair_feature}"',
                )
                for pair_id, video1, video2, user_id, pref, pair_feature in this.all_user_pref[
                    ALL_USER_PREF_COLUMNS
                ].values
            ]


def get_all_user_pref():
    """
    Return the all user pref dataframe
    """
    if os.path.exists(ALL_USER_PREF_PATH):
        this.all_user_pref = pd.read_csv(ALL_USER_PREF_PATH)
        # map the pair_id to int
        this.all_user_pref["pair_id"] = this.all_user_pref["pair_id"].astype(int)
        # map the pref to float
        this.all_user_pref["pref"] = this.all_user_pref["pref"].astype(float)

    return this.all_user_pref


def update_all_user_pref(user_id, pair_id, pref):
    """Update the this.all_user_pref dataframe."""
    video1, video2 = pair_id2videos(pair_id)
    pair_feature = this.all_pair_df[this.all_pair_df["pair_id"] == pair_id][
        "pair_feature"
    ].iloc[0]
    this.all_user_pref = pd.concat(
        [
            this.all_user_pref,
            pd.DataFrame(
                [[pair_id, video1, video2, user_id, pref, pair_feature]],
                columns=ALL_USER_PREF_COLUMNS,
            ),
        ],
        ignore_index=True,
    )
    pref_lgr.info(
        "%s",
        f'{str(pair_id)},{video1},{video2},{user_id},{str(pref)},"{pair_feature}"',
    )

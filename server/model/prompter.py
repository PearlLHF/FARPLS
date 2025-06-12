""" 
Keep recording of prompting history, generate prompts, and check consistency.
"""
import os

import pandas as pd
from model.shared import (
    log_prompted_pair,
    pair_id2videos,
    update_all_user_pref,
    videos2pair_id,
)
from model.metric import UserMetric

DB_DIR = "database/"
HISTORY_DIR = os.path.join(DB_DIR, "history")
BASELINE_DIR = os.path.join(DB_DIR, "baseline")


def save_new_csv_entry(path, line):
    """
    Save a new entry to the csv file.
    """
    with open(path, "a", encoding="utf-8") as f:
        f.write(line)


class Prompter:
    """
    A class for prompting a user to label pairs of videos.
    """

    def __init__(self, user_id):
        self.metric = None
        self.round = 0
        if user_id == "test":
            self.mode = "baseline"
        elif user_id in [f"U{i:02d}" for i in range(1, 42, 2)]:  # baseline
            self.mode = "baseline"
        elif user_id in [f"U{i:02d}" for i in range(2, 43, 2)]:
            self.mode = "experiment"
            self.metric = UserMetric(user_id)
        else:
            raise ValueError("Invalid user id in this system.")

        self.user_id = user_id

        if not os.path.exists(HISTORY_DIR):
            os.makedirs(HISTORY_DIR)
        self.history_path = f"./database/history/{user_id}_history.csv"
        self.consistency_path = f"./database/history/{user_id}_consistency.csv"
        if not os.path.exists(self.history_path):
            self.prompting_history = pd.DataFrame(
                columns=["time", "pair_id", "prompting_round", "pref"]
            )
            self.prompting_history.to_csv(self.history_path, index=False)
        else:
            self.prompting_history = pd.read_csv(self.history_path)
            if len(self.prompting_history):
                self.round = int(self.prompting_history["prompting_round"].max())

        if not os.path.exists(self.consistency_path):
            self.consistency_checking_history = pd.DataFrame(
                columns=["time", "pair_id", "attention_check_round", "pref"]
            )
            self.consistency_checking_history.to_csv(self.consistency_path, index=False)
        else:
            self.consistency_checking_history = pd.read_csv(self.consistency_path)

        num_attention_check = len(self.consistency_checking_history)
        self.attention_check = dict(
            zip(
                range(15, 106, 10),
                [True] * num_attention_check + [False] * (10 - num_attention_check),
            )
        )
        self.num_inconsistent = 0
        self.next_pair = None

    def pref_vid2pref(self, pair_id, pref_vid):
        """Converts the preferred video ID to a preference value.

        Args:
            video_pair (list): A list of two video names.
            pref_vid (str): The preferred video name.

        Raises:
            ValueError: If the preferred video name is invalid.

        Returns:
            float or int: The preference value.
        """
        video_pair = pair_id2videos(pair_id)

        if pref_vid not in [video_pair[0], video_pair[1], "no pref"]:
            raise ValueError(
                "Video preference must be one of the two videos or 'no pref'"
            )

        if pref_vid == "no pref":
            return *video_pair, 0.5

        return *video_pair, int(pref_vid == video_pair[1])

    def query_next_pair(self):
        """
        Returns the next pair of videos to label.

        Returns:
            A tuple representing the next pair of videos to label,
                or None if all pairs have been labeled.
        """
        print(f"Prompting round: {self.round}")
        # end condition
        if self.round >= 105 and len(self.consistency_checking_history) == 10:
            self.next_pair = None
            raise StopIteration("No more video pairs to label.")

        # check if prompting history of this round exists
        if (
            self.round in self.prompting_history["prompting_round"].values
            and self.prompting_history.loc[
                self.prompting_history["prompting_round"] == self.round, "pref"
            ].values[0]
            == -1
        ):
            return pair_id2videos(
                self.prompting_history.loc[
                    self.prompting_history["prompting_round"] == self.round, "pair_id"
                ].values[0]
            )

        if (
            self.round in self.attention_check.keys()
            and self.attention_check[self.round]
        ):  # check if attention check history exists
            if (
                self.round
                in self.consistency_checking_history["attention_check_round"].values
                and self.consistency_checking_history.loc[
                    self.consistency_checking_history["attention_check_round"]
                    == self.round,
                    "pref",
                ].values[0]
                == -1
            ):
                return pair_id2videos(
                    self.consistency_checking_history.loc[
                        self.consistency_checking_history["attention_check_round"]
                        == self.round,
                        "pair_id",
                    ].values[0]
                )

        # get avg rank score
        if self.mode == "baseline":
            user_csv_path = os.path.join(BASELINE_DIR, f"{self.user_id}_pref.csv")
            user_df = pd.read_csv(user_csv_path)
            unlabeled_data = user_df[user_df["pref"] == -1]
            labeled_data = user_df[user_df["pref"] != -1]
            # attention check sessions
            if (
                self.round in self.attention_check.keys()
                and not self.attention_check[self.round]
            ):  # attention check
                pair = labeled_data[["video1", "video2"]].sample(1).iloc[0].values
                pair_id = videos2pair_id(*list(pair))
                while pair_id in self.consistency_checking_history["pair_id"].values:
                    pair = labeled_data[["video1", "video2"]].sample(1).iloc[0].values
                    pair_id = videos2pair_id(*list(pair))

                time = pd.Timestamp.now()
                self.consistency_checking_history = pd.concat(
                    [
                        self.consistency_checking_history,
                        pd.DataFrame.from_dict(
                            {
                                "time": time,
                                "pair_id": pair_id,
                                "attention_check_round": self.round,
                                "pref": -1,
                            },
                            orient="index",
                        ).T,
                    ],
                    ignore_index=True,
                )
                self.attention_check[self.round] = True
                # self.consistency_checking_history.to_csv(
                #     self.consistency_path, index=False
                # )
                new_entry = f"{time},{pair_id},{self.round},-1\n"
                save_new_csv_entry(self.consistency_path, new_entry)
                return list(pair)[::-1]

            pair = unlabeled_data[["video1", "video2"]].sample(1).iloc[0].values
            pair_id = videos2pair_id(*list(pair))
            self.round += 1
            time = pd.Timestamp.now()
            self.prompting_history = pd.concat(
                [
                    self.prompting_history,
                    pd.DataFrame.from_dict(
                        {
                            "time": time,
                            "pair_id": pair_id,
                            "prompting_round": self.round,
                            "pref": -1,
                        },
                        orient="index",
                    ).T,
                ],
                ignore_index=True,
            )
            # self.prompting_history.to_csv(self.history_path, index=False)
            new_entry = f"{time},{pair_id},{self.round},-1\n"
            save_new_csv_entry(self.history_path, new_entry)
            return list(pair)

        if self.mode == "experiment":
            num_initial_round = len(self.metric.possible_cluster_count.keys())

            # initial rounds
            if self.round < num_initial_round:
                pair = (
                    self.metric.get_not_covered_cluster_data()
                    .sample(1)[["pair_id", "video1", "video2"]]
                    .iloc[0]
                    .values
                )
                pair_id = pair[0]
                self.round += 1
                time = pd.Timestamp.now()
                self.prompting_history = pd.concat(
                    [
                        self.prompting_history,
                        pd.DataFrame.from_dict(
                            {
                                "time": time,
                                "pair_id": pair_id,
                                "prompting_round": self.round,
                                "pref": -1,
                            },
                            orient="index",
                        ).T,
                    ],
                    ignore_index=True,
                )
                # self.prompting_history.to_csv(self.history_path, index=False)
                new_entry = f"{time},{pair_id},{self.round},-1\n"
                save_new_csv_entry(self.history_path, new_entry)
                log_prompted_pair(pair_id)
                return list(pair[1:])

            # attention check sessions
            if (
                self.round in self.attention_check.keys()
                and not self.attention_check[self.round]
            ):  # attention check
                labeled_data = self.metric.get_labeled_data()
                pair = None
                pair_id = None
                for pair in labeled_data[["pair_id", "video1", "video2"]].values:
                    pair_id = pair[0]
                    if (
                        pair_id
                        not in self.consistency_checking_history["pair_id"].values
                    ):
                        break
                time = pd.Timestamp.now()
                self.consistency_checking_history = pd.concat(
                    [
                        self.consistency_checking_history,
                        pd.DataFrame.from_dict(
                            {
                                "time": time,
                                "pair_id": pair_id,
                                "attention_check_round": self.round,
                                "pref": -1,
                            },
                            orient="index",
                        ).T,
                    ],
                    ignore_index=True,
                )
                self.attention_check[self.round] = True
                # self.consistency_checking_history.to_csv(
                #     self.consistency_path, index=False
                # )
                new_entry = f"{time},{pair_id},{self.round},-1\n"
                save_new_csv_entry(self.consistency_path, new_entry)
                return list(pair[1:])[::-1]

            candidates = self.metric.get_skewed_data()
            max_rank_score = candidates["avg_rank_score"].max()
            pair = (
                candidates[candidates["avg_rank_score"] == max_rank_score][
                    ["pair_id", "video1", "video2"]
                ]
                .sample(1)
                .iloc[0]
                .values
            )
            pair_id = pair[0]
            self.round += 1
            time = pd.Timestamp.now()
            self.prompting_history = pd.concat(
                [
                    self.prompting_history,
                    pd.DataFrame.from_dict(
                        {
                            "time": time,
                            "pair_id": pair_id,
                            "prompting_round": self.round,
                            "pref": -1,
                        },
                        orient="index",
                    ).T,
                ],
                ignore_index=True,
            )
            # self.prompting_history.to_csv(self.history_path, index=False)
            new_entry = f"{time},{pair_id},{self.round},-1\n"
            save_new_csv_entry(self.history_path, new_entry)
            log_prompted_pair(pair_id)
            return list(pair[1:])

    def update_history(self, pair_id, pref):
        """
        Update the history of prompting.

        Args:
            pair_id: A tuple representing the pair of videos to label.
            pref: An integer representing the preference of the user.
        """
        prev_pref = -1
        if (
            len(self.prompting_history)
            and pair_id in self.prompting_history["pair_id"].values
        ):
            prev_pref = self.prompting_history.loc[
                self.prompting_history["pair_id"] == pair_id, "pref"
            ].values[0]

        if (
            self.round in self.attention_check.keys()
            and self.attention_check[self.round]
        ):  # attention check
            self.consistency_checking_history.loc[
                self.consistency_checking_history["pair_id"] == pair_id, "pref"
            ] = pref
            self.consistency_checking_history.to_csv(self.consistency_path, index=False)

            if pref != prev_pref:
                self.num_inconsistent += 1
                self.prompting_history.loc[
                    self.prompting_history["pair_id"] == pair_id,
                    "pref",
                ] = (pref + prev_pref) / 2
                self.prompting_history.to_csv(self.history_path, index=False)

                if self.mode == "experiment":
                    update_all_user_pref(self.user_id, pair_id, pref)
                print(
                    f"Inconsistent preference in attention check: {pair_id}, {prev_pref}, {pref}"
                )
                self.next_pair = self.query_next_pair()
                raise ValueError("Feeling tried? Take a break if necessary and please stay attentive in the following sessions.")

            if self.mode == "experiment":
                update_all_user_pref(self.user_id, pair_id, pref)

            self.next_pair = self.query_next_pair()
            raise Exception("According to our record so far, you have been rather careful and thorough in the past labeling sessions! \nGood job! Take a break if needed and keep on the good work.")
        else:
            if prev_pref != -1 and pref != prev_pref:
                print(
                    f"Duplicated submits with different preferences: {pair_id}, {prev_pref}, {pref}"
                )
                raise ValueError("Duplicate submits with different preferences.")
            self.prompting_history.loc[
                self.prompting_history["pair_id"] == pair_id,
                "pref",
            ] = pref
            self.prompting_history.to_csv(self.history_path, index=False)

            if self.mode == "experiment":
                update_all_user_pref(self.user_id, pair_id, pref)
                self.metric.update_labeling_status(pair_id)

            self.next_pair = self.query_next_pair()

    def get_consistency(self):
        """
        Returns the consistency of the user's responses.

        Returns:
            A float representing the consistency of the user's responses.
        """
        self.num_inconsistent = 0
        for pair_id in self.consistency_checking_history["pair_id"].values:
            if (
                pair_id not in self.prompting_history["pair_id"].values
                or self.prompting_history.loc[
                    self.prompting_history["pair_id"] == pair_id, "pref"
                ].values[0]
                != self.consistency_checking_history.loc[
                    self.consistency_checking_history["pair_id"] == pair_id, "pref"
                ].values[0]
            ):
                self.num_inconsistent += 1
        return (
            1 - self.num_inconsistent / len(self.consistency_checking_history)
            if len(self.consistency_checking_history) != 0
            else None
        )

    def get_next_pair(self):
        """
        Returns the next pair of videos to label.

        Returns:
            A tuple representing the next pair of videos to label,
                or None if all pairs have been labeled.
        """
        if self.next_pair is None:
            self.next_pair = self.query_next_pair()
        return self.next_pair

    def get_progress(self):
        """
        Returns the progress of the user.

        Returns:
            A list of boolean values representing the progress of the user.
        """
        return list(self.attention_check.values())

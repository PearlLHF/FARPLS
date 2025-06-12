import numpy as np
import pandas as pd

from model.shared import (
    all_pair_df,
    get_all_user_pref,
    get_prompted_pair_id,
)


class UserMetric:
    """A class that represents the metrics for user video pairs prompting."""

    def __init__(self, user_id):
        data_feature_path = "database/data_assignment/data_feature.csv"
        self.all_pair_df = all_pair_df
        self.data_feature = pd.read_csv(data_feature_path)

        self.video2cluster_id = dict(
            zip(
                self.data_feature.demo_name.tolist(),
                self.data_feature.cluster_id.tolist(),
            )
        )

        self.possible_cluster_count = dict(
            zip(*np.unique(self.data_feature.cluster_id.values, return_counts=True))
        )
        self.possible_pair_count = dict(
            zip(*np.unique(self.all_pair_df["pair_feature"].values, return_counts=True))
        )

        self.user_id = user_id
        all_user_pref = get_all_user_pref()
        pair_label_status = all_user_pref.groupby("pair_id").apply(
            lambda x: user_id in x["user_id"].values
        )
        # add labeled_by_user_id column
        self.all_pair_df[f"labeled_by_{user_id}"] = self.all_pair_df["pair_id"].apply(
            lambda x: pair_label_status[x] if x in pair_label_status.index else False
        )

    def update_labeling_status(self, pair_id):
        """Update the labeling status for a pair."""
        self.all_pair_df.loc[
            self.all_pair_df["pair_id"] == pair_id, f"labeled_by_{self.user_id}"
        ] = True

    # Metrics are defined below
    def user_cluster_coverage(self) -> pd.DataFrame:
        """
        Rank the unlabeled data by cluster coverage.

        Returns:
            pd.DataFrame: a dataframe containing the unlabeled data for a user. Should contain at least 6 columns: `pair_id`, `video1`, `video2`, `pref`, `cluster_coverage_score`, `cluster_coverage_rank_score`
        """
        # get the cluster coverage score for each pair with the sum of labeled_by_user_id
        self.all_pair_df[["cluster_id1", "cluster_id2"]] = self.all_pair_df.apply(
            lambda row: pd.Series(
                [
                    self.video2cluster_id[row["video1"]],
                    self.video2cluster_id[row["video2"]],
                ]
            ),
            axis=1,
        )
        cluster_pair_coverage1 = (
            self.all_pair_df.groupby("cluster_id1")
            .apply(
                lambda x: (
                    x[f"labeled_by_{self.user_id}"].values.sum()
                    / self.possible_cluster_count[x.name]
                )
            )
            .rename_axis("cluster_id")
        )
        cluster_pair_coverage2 = (
            self.all_pair_df.groupby("cluster_id2")
            .apply(
                lambda x: (
                    x[f"labeled_by_{self.user_id}"].values.sum()
                    / self.possible_cluster_count[x.name]
                )
            )
            .rename_axis("cluster_id")
        )
        cluster_pair_coverage = cluster_pair_coverage1.add(
            cluster_pair_coverage2, fill_value=0
        ).to_dict()

        # calculate the cluster coverage score for each pair
        self.all_pair_df["cluster_coverage_score"] = self.all_pair_df[
            ["video1", "video2"]
        ].apply(
            lambda row: (
                cluster_pair_coverage.get(self.video2cluster_id[row["video1"]], 0)
                + cluster_pair_coverage.get(self.video2cluster_id[row["video2"]], 0)
                if self.video2cluster_id[row["video1"]]
                != self.video2cluster_id[row["video2"]]
                else cluster_pair_coverage.get(self.video2cluster_id[row["video1"]], 0)
                + cluster_pair_coverage.get(self.video2cluster_id[row["video2"]], 0)
                + 1 / self.possible_cluster_count[self.video2cluster_id[row["video1"]]]
            ),
            axis=1,
        )
        # self.all_pair_df["cluster_coverage_rank_score"] = self.all_pair_df[
        #     "cluster_coverage_score"
        # ].rank(method="max", ascending=False, pct=True)
        return self.all_pair_df

    def user_familarity(self) -> pd.DataFrame:
        """Rank the unlabeled data by familarity.

        Returns:
            pd.DataFrame: a dataframe containing the unlabeled data for a user. Should contain at least 6 columns: `pair_id`, `video1`, `video2`, `pref`, `familarity_score`, `familarity_score`
        """
        # get the familarity score for each pair with the sum of labeled_by_user_id
        cluster_pair_familarity = (
            self.all_pair_df.groupby("pair_feature")
            .apply(lambda x: x[f"labeled_by_{self.user_id}"].values.sum())
            .to_dict()
        )
        self.all_pair_df["familarity_score"] = self.all_pair_df["pair_feature"].apply(
            lambda x: (cluster_pair_familarity.get(x, 0) / self.possible_pair_count[x])
        )
        # self.all_pair_df["familarity_rank_score"] = self.all_pair_df[
        #     "familarity_score"
        # ].rank(method="max", ascending=False, pct=True)
        return self.all_pair_df

    def pair_distinctness(self) -> pd.DataFrame:
        """Rank the unlabeled data by distinctness.

        Args:
            user_id (str): in forms of `U01` so that we can find the corresponding data file in `database/experiment`
            mode (str, optional): the mode of distinctness. Defaults to "inter-cluster".

        Returns:
            pd.DataFrame: a dataframe containing the unlabeled data for a user. Should contain at least 5 columns: `video1`, `video2`, `pref`, `distinctness_score`, `distinctness_rank_score`
        """
        for i, rows in self.all_pair_df.iterrows():
            distance = self.all_pair_df[self.all_pair_df["pair_id"] == rows["pair_id"]][
                "dist"
            ].values[0]
            self.all_pair_df.loc[i, "distinctness_score"] = -distance
        # self.all_pair_df["distinctness_rank_score"] = self.all_pair_df[
        #     "distinctness_score"
        # ].rank(method="max", ascending=False, pct=True)
        return self.all_pair_df

    def disagreements(self) -> pd.DataFrame:
        """Score the labeled data by disagreement."""
        # group the labeled data by pair_id
        all_user_pref = get_all_user_pref()
        # merge the rows with the same pair_id and the same user_id, while retaining other columns
        all_user_pref = (
            all_user_pref.groupby(
                ["pair_id", "video1", "video2", "user_id", "pair_feature"]
            )
            .agg({"pref": "mean"})
            .reset_index()
        )
        pair_id_group = all_user_pref.groupby("pair_id")

        # get the disagreement for each pair with the variance in the pref score
        pair_disagreement = pair_id_group["pref"].var(ddof=0)
        self.all_pair_df["disagreement_score"] = self.all_pair_df["pair_id"].apply(
            lambda x: -pair_disagreement[x] if x in pair_disagreement.index else -np.inf
        )

        # # rank the disagreement score
        # self.all_pair_df["disagreement_rank_score"] = self.all_pair_df[
        #     "disagreement_score"
        # ].rank(method="max", ascending=False, pct=True)

        # group the labeled data by pair_id
        pair_feature_group = all_user_pref.groupby("pair_feature")
        # get the cluster disagreement for each pair with the variance in the pref score
        pair_cluster_disagreement = pair_feature_group["pref"].var(ddof=0)
        self.all_pair_df["cluster_disagreement_score"] = self.all_pair_df[
            "pair_feature"
        ].apply(
            lambda x: -pair_cluster_disagreement[x]
            if x in pair_cluster_disagreement.index
            else -np.inf
        )

        # # rank the label skewness score
        # self.all_pair_df["cluster_disagreement_rank_score"] = self.all_pair_df[
        #     "cluster_disagreement_score"
        # ].rank(method="max", ascending=False, pct=True)
        return self.all_pair_df

    def pair_label_skewness(self) -> pd.DataFrame:
        """Score the labeled data by label skewness."""
        prompted_pair_id = get_prompted_pair_id()
        # check if any pair has been prompted
        if len(prompted_pair_id) == 0:
            self.all_pair_df["label_skewness_score"] = 0
            # self.all_pair_df["label_skewness_rank_score"] = 0
            return self.all_pair_df
        # get the label skewness for each pair with the variance in the pref score
        pair_label_skewness = dict(
            zip(*np.unique(prompted_pair_id, return_counts=True))
        )
        self.all_pair_df["label_skewness_score"] = self.all_pair_df["pair_id"].apply(
            lambda x: pair_label_skewness.get(x, 0)
        )
        # # rank the label skewness score
        # self.all_pair_df["label_skewness_rank_score"] = self.all_pair_df[
        #     "label_skewness_score"
        # ].rank(method="max", ascending=False, pct=True)
        return self.all_pair_df

    # Get the rank score for all metrics in both unlabel and label data
    def get_avg_rank_score(self, df, columns=None, weights=None) -> pd.DataFrame:
        """Get the average rank score for all metrics in both unlabel and label data.

        Args:
            df (pd.DataFrame): a dataframe containing the unlabeled data for a user.
            columns (list, optional): the list of columns to get the rank score. Defaults to [
                "cluster_coverage",
                "familarity",
                "distinctness",
                "disagreement",
                "cluster_disagreement",
                "label_skewness",
            ].

        Returns:
            pd.DataFrame: a dataframe containing the unlabeled data for a user.
        """

        if columns is None:
            columns = [
                "cluster_coverage",
                "familarity",
                "distinctness",
                "disagreement",
                "cluster_disagreement",
                "label_skewness",
            ]
        if weights is None:
            weights = [1] * len(columns)
        weights = np.array(weights) / np.sum(weights)
        assert len(columns) == len(weights)

        # get the rank score for df
        for column in columns:
            df[f"{column}_rank_score"] = df[f"{column}_score"].rank(
                method="max", ascending=False, pct=True
            )

        df["avg_rank_score"] = df[[f"{column}_rank_score" for column in columns]].apply(
            lambda row: np.sum(row.values * weights), axis=1
        )
        # sort the df by avg_rank_score
        df.sort_values(
            by=["avg_rank_score"], ascending=False, ignore_index=True, inplace=True
        )
        return df

    def get_all_df(self, rank_score=False, columns=None, weights=None):
        """Get all the metrics score for a user.

        Args:
            columns (list, optional): the list of columns to get the rank score. Defaults to None.

        Returns:
            pd.DataFrame: a dataframe containing the unlabeled data for a user.
        """
        # get the metrics scores
        self.user_cluster_coverage()
        self.user_familarity()
        self.pair_distinctness()
        self.disagreements()
        self.pair_label_skewness()

        if rank_score:
            # get the rank score for all metrics in both unlabel and label data
            self.all_pair_df = self.get_avg_rank_score(
                self.all_pair_df, columns, weights
            )
        return self.all_pair_df

    def get_unlabeled_data(self, rank_score=False, columns=None, weights=None):
        """Get the unlabeled data for a user.

        Args:
            columns (list, optional): the list of columns to get the rank score. Defaults to None.

        Returns:
            pd.DataFrame: a dataframe containing the unlabeled data for a user.
        """
        self.all_pair_df = self.get_all_df(columns)
        # get the unlabeled data
        unlabeled_data = self.all_pair_df[
            ~self.all_pair_df[f"labeled_by_{self.user_id}"]
        ].copy()
        # unlabeled_data = unlabeled_data[
        #     unlabeled_data["label_skewness_score"] < 6
        # ].copy()
        if rank_score:
            # update the rank score
            unlabeled_data = self.get_avg_rank_score(unlabeled_data, columns, weights)
        return unlabeled_data

    def get_labeled_data(self, rank_score=False, columns=None, weights=None):
        """Get the labeled data for a user.

        Args:
            columns (list, optional): the list of columns to get the rank score. Defaults to None.

        Returns:
            pd.DataFrame: a dataframe containing the labeled data for a user.
        """

        self.all_pair_df = self.get_all_df(columns)
        # get the labeled data
        labeled_data = self.all_pair_df[
            self.all_pair_df[f"labeled_by_{self.user_id}"]
        ].copy()
        if rank_score:
            # update the rank score
            labeled_data = self.get_avg_rank_score(labeled_data, columns, weights)
        return labeled_data

    def get_not_covered_cluster_data(self):
        """Get the not covered cluster data for a user."""
        unlabeled_data = self.get_unlabeled_data()
        candidates = unlabeled_data[
            unlabeled_data["cluster_coverage_score"] == 0
        ].copy()
        if len(candidates) != 0:
            candidates = self.get_avg_rank_score(
                candidates,
                columns=[
                    "label_skewness",
                ],
            )
        else:
            candidates = self.get_avg_rank_score(
                unlabeled_data,
                columns=[
                    "cluster_coverage",
                    "familarity",
                    "label_skewness",
                ],
                weights=[
                    1,
                    1,
                    1
                    + 10
                    * (
                        unlabeled_data["label_skewness_score"].max()
                        - unlabeled_data["label_skewness_score"].min()
                    ),
                ],
            )
        max_rank_score = candidates["avg_rank_score"].max()
        print(
            candidates["label_skewness_score"].max(),
            candidates["label_skewness_score"].min(),
        )
        return candidates[candidates["avg_rank_score"] == max_rank_score]

    def get_skewed_data(self):
        """Get the skewed data for a user."""
        unlabeled_data = self.get_unlabeled_data()
        min_skewness_score = unlabeled_data["label_skewness_score"].min()
        candidates = unlabeled_data[
            unlabeled_data["label_skewness_score"] == min_skewness_score
        ].copy()
        if len(candidates) != 0:
            candidates = self.get_avg_rank_score(
                candidates,
                columns=[
                    "cluster_coverage",
                    "familarity",
                    "distinctness",
                    "disagreement",
                    "cluster_disagreement",
                ],
            )
        else:
            candidates = self.get_avg_rank_score(unlabeled_data)
        max_rank_score = candidates["avg_rank_score"].max()
        print(
            self.all_pair_df["label_skewness_score"].max(),
            self.all_pair_df["label_skewness_score"].min(),
        )
        return candidates[candidates["avg_rank_score"] == max_rank_score]

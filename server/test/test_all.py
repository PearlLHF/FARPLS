"""
Module for testing all functions in the trajectory-preference-collection-tool.
"""

from test_query import (
    test_query_vid,
    test_query_video_pair,
)
from test_submit import (
    test_submit_nopref,
    test_submit_video1,
    test_submit_video2,
)
from test_reset import (
    test_reset,
)
from test_feature import (
    test_get_feature_stats,
    test_query_keyframe_feature_dict,
)

if __name__ == "__main__":
    test_query_vid()
    test_query_video_pair()
    test_submit_video1()
    test_submit_video2()
    test_submit_nopref()
    test_reset()
    test_get_feature_stats()
    test_query_keyframe_feature_dict()
    print("All tests passed!")

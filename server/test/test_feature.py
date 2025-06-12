import os
import requests
from api import api

def test_get_feature_stats():
    url = 'http://127.0.0.1:5000/feature/stats'
    response = requests.get(url)
    assert response.status_code == 200


def test_query_keyframe_feature_dict():
    url = 'http://127.0.0.1:5000/feature/mg_demo_2477'
    response = requests.get(url)
    assert response.status_code == 200
    num_collisions = response.json()["num_collisions"]
    url = 'http://127.0.0.1:5000/keyframe/mg_demo_2477'
    response = requests.get(url)
    assert response.status_code == 200
    keyframes = response.json()
    assert len(keyframes["collisions"]) == num_collisions
    keyframe_keys = [
                    "collisions",
                    "highest_point",
                    "nearest_point_to_edge",
                    "pick_up_point",
                    "release_point",
                ]
    for k, value in keyframes.items():
        assert k in keyframe_keys
        if k == "collisions":
            for v in value:
                url = f"http://127.0.0.1:5000{v[1]}"
                response = requests.get(url)
                assert response.status_code == 200
        else:
            url = f"http://127.0.0.1:5000{value[1]}"
            response = requests.get(url)
            assert response.status_code == 200

if __name__ == "__main__":
    test_get_feature_stats()
    test_query_keyframe_feature_dict()
    "All feature tests passed."
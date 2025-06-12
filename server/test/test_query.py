import os
import requests
from api import api
import pandas as pd
from test_reset import test_reset

def test_query_vid():
    test_reset()
    url = 'http://127.0.0.1:5000/query/demo_10'
    assert requests.get(url).status_code == 500
    
    url = 'http://127.0.0.1:5000/query/mg_demo_2477'
    response = requests.get(url)
    assert response.status_code == 200
    assert response.json() == "/videos/mg_demo_2477/mg_demo_2477_frontview.mp4"

def test_query_video_pair():
    test_reset()
    url = 'http://127.0.0.1:5000/query/baseline/test'
    video_pair = requests.get(url)
    assert video_pair.status_code == 200
    assert len(video_pair.json()) == 2
    return video_pair.json()

def test_query_complete():
    test_reset()
    df = pd.read_csv('database/baseline/test_pref.csv')
    df['pref'] = 0.5
    df.to_csv('database/baseline/test_pref.csv', index=False)
    url = 'http://127.0.0.1:5000/query/baseline/test'
    video_pair = requests.get(url)
    assert video_pair.status_code == 200
    assert video_pair.json() == "No more video pairs to label."
    api.reset_all_user_pref("test")

if __name__ == "__main__":
    test_query_vid()
    test_query_video_pair()
    "All query tests passed."

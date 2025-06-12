import os
import requests
from api import api
from test_query import test_query_video_pair

def test_submit_video1():
    vid_pair = test_query_video_pair()[::-1]
    vid_pair = [v.split("/")[-2] for v in vid_pair]
    url = 'http://127.0.0.1:5000/submit/baseline/test'
    pref_vid = vid_pair[0]
    assert requests.post(url, data={
        "video1": vid_pair[0], 
        "video2": vid_pair[1],
        "pref_vid": pref_vid
        }).status_code == 200

def test_submit_video2():
    vid_pair = test_query_video_pair()[::-1]
    vid_pair = [v.split("/")[-2] for v in vid_pair]
    url = 'http://127.0.0.1:5000/submit/baseline/test'
    pref_vid = vid_pair[1]
    assert requests.post(url, data={
        "video1": vid_pair[0], 
        "video2": vid_pair[1],
        "pref_vid": pref_vid
        }).status_code == 200

def test_submit_nopref():
    vid_pair = test_query_video_pair()[::-1]
    vid_pair = [v.split("/")[-2] for v in vid_pair]
    url = 'http://127.0.0.1:5000/submit/baseline/test'
    pref_vid = "no pref"
    assert requests.post(url, data={
        "video1": vid_pair[0], 
        "video2": vid_pair[1],
        "pref_vid": pref_vid
        }).status_code == 200

def test_submit_log():
    url = 'http://127.0.0.1:5000/upload/baseline/test'
    files = {
        'file': ('test.txt', open('test/test.txt', 'rb')),
    }
    response = requests.post(url, files=files)
    assert response.status_code == 200
    assert os.path.exists("log/baseline/test.log")

if __name__ == "__main__":
    test_submit_nopref()
    test_submit_log()
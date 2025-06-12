import os
import requests
from api import api

def test_download_user_pref():
    url = 'http://127.0.0.1:5000/download/baseline/test'
    attachment = requests.get(url)
    assert attachment.status_code == 200

# if __name__ == "__main__":
    # test_download_user_pref()
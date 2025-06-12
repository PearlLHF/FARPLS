import os
import requests
from api import api
import pandas as pd

def test_reset():
    url = 'http://127.0.0.1:5000/reset/baseline/test'
    response = requests.get(url)
    assert response.status_code == 200
    assert response.json() == "database/baseline/test_pref.csv"

    url = 'http://127.0.0.1:5000/reset/experiment/test'
    response = requests.get(url)
    assert response.status_code == 200
    assert response.json() == "database/baseline/test_pref.csv"


if __name__ == "__main__":
    test_reset()
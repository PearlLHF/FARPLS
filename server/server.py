"""
This file defines the server API. 
Deployment:
```gunicorn -w 1 -t 30 -b localhost:5000 server:app```
"""
import argparse
import os
import random
from pathlib import Path

from api.api import (
    get_feature_stats,
    get_keyframe_image_path,
    get_user_csv_path,
    get_video_features,
    get_video_keyframes,
    get_video_path,
    get_video_static_path,
    query_video_pair,
    reset_user,
    update_user_pref,
    get_user_progress,
)
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# app = Flask(__name__)
app = Flask(__name__, static_url_path="/", static_folder="build")
app.config["SECRET_KEY"] = os.urandom(24)
app.config["UPLOAD_FOLDER"] = "log"
cors = CORS(app)


@app.route("/query/<mode>/<uid>", methods=["GET"])
def query_pair(mode, uid):
    """
    API to query incomplete video pair by user id
    params:
        uid: user id
        mode: baseline or experiment
    """
    print(f"\nQuerying {uid} {mode} .....\n")
    try:
        video_pair = query_video_pair(uid, mode)
        random.shuffle(video_pair)
        print(f"\n{uid} {mode} {video_pair} .....Queried")
        return jsonify([get_video_static_path(vid) for vid in video_pair])
    except Exception as e:
        print(f"\n.....{uid} {mode} with querying error {e}\n")
        return jsonify(str(e))


@app.route("/submit/<mode>/<uid>/", methods=["POST", "GET"])
def submit_preference(mode, uid):
    """
    API to submit user preference
    params:
        uid: user id
        mode: baseline or experiment
    """
    print(f"\nSubmitting {uid} {mode}.....\n")
    vid_pair = (request.form["video1"], request.form["video2"])
    pref_vid = request.form["pref_vid"]
    try:
        path = update_user_pref(uid, vid_pair, pref_vid, mode)
        print(f"\n{uid} {mode} {vid_pair} {pref_vid} .....Submitted to {path}\n")
        return path
    except Exception as e:
        print(f"\n.....{uid} {mode} {vid_pair} {pref_vid} with submitting error {e}\n")
        return jsonify(str(e))


@app.route("/progress/<mode>/<uid>/", methods=["GET"])
def get_user_steps(mode, uid):
    """
    API to get user progress
    params:
        uid: user id
        mode: baseline or experiment
    """
    return jsonify(get_user_progress(uid, mode))


@app.route("/reset/<mode>/<uid>/", methods=["GET"])
def reset_user_pref(mode, uid):
    """
    API to reset user preference
    """
    print(f"\nResetting {uid} {mode}.....\n")
    log_path = os.path.join(app.config["UPLOAD_FOLDER"], mode, f"{uid}.log")
    if os.path.exists(log_path):
        os.remove(log_path)
    print(f"\n.....{uid} {mode} {log_path} Removed\n")
    return jsonify(reset_user(uid, mode))


@app.route("/download/<mode>/<uid>/", methods=["GET"])
def download_user_pref(mode, uid):
    """
    API to download user preference csv file
    params:
        uid: user id
        mode: baseline or experiment
    """
    file_dir, file_name = get_user_csv_path(uid, mode)
    if not Path(file_dir, file_name).exists():
        return jsonify("Please initialize the database.")
    else:
        file_dir_abs = os.path.abspath(file_dir)
        return send_from_directory(file_dir_abs, file_name, as_attachment=True)


@app.route("/log/<mode>/<uid>", methods=["POST", "GET"])
def receive_user_log(mode, uid):
    """
    API to receive user action log string
    params:
        uid: user id
        mode: baseline or experiment
    """
    if request.method == "POST":
        log = request.form["log"]
        filename = f"{uid}.log"
        log_path = os.path.join(app.config["UPLOAD_FOLDER"], mode, filename)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(log)
        print(f"\nLog {uid} {mode}......\n{log}\n......Received.\n")
        return log_path


@app.route("/feature/stats", methods=["GET"])
def get_traj_feature_stats():
    """
    API to get feature stats
    """
    return jsonify(get_feature_stats())


@app.route("/keyframe/<vid>", methods=["GET"])
def query_traj_keyframe_dict(vid):
    """
    API to query keyframe dict by video id
    """
    return jsonify(get_video_keyframes(vid))


@app.route("/feature/<vid>", methods=["GET"])
def query_traj_feature_dict(vid):
    """
    API to query feature dict by video id
    """
    return jsonify(get_video_features(vid))


# Custom static data for keyframe images and videos
@app.route("/keyframes/<vid>/<img_name>")
def query_keyframe_image(vid, img_name):
    """
    API to query keyframe images
    """
    keyframe_image_path, img_name = get_keyframe_image_path(vid, img_name)
    return send_from_directory(keyframe_image_path, img_name)


@app.route("/videos/<vid>/<vid_name>")
def query_video(vid, vid_name):
    """
    API to query video
    """
    video_path, video_name = get_video_path(vid, vid_name)
    return send_from_directory(video_path, video_name)


# Custom static react build index file
@app.route("/")
def index():
    """
    API to query react build index file
    """
    return app.send_static_file("index.html")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start the server.")
    parser.add_argument(
        "--port", type=int, default=5000, help="Port to run the server on."
    )
    parser.add_argument(
        "--debug",
        default=False,
        action="store_true",
        help="Run the server in debug mode.",
    )
    args = parser.parse_args()

    app.run(port=args.port, debug=args.debug)

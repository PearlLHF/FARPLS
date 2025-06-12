import streamlit as st
import random
import os
import time
import pandas as pd
import argparse

st.set_page_config(page_title='Trajectory Preference Tool', page_icon="⚖️", layout='wide', initial_sidebar_state = 'expanded')

# TODO: change this to a user input from the sidebar
UID = "P01"

# TODO: change all these arguments to user inputs in the sidebar, and add a save button
# Parse arguments
parser = argparse.ArgumentParser()
parser.add_argument("--video_dir", default='dataset/formative-study', help="Directory of videos to be compared")
# parser.add_argument("--save", default=False, action="store_true", help="Save scores to csv file")
parser.add_argument("--save_path", default=f"{UID}_pref_scores.csv", help="File directory to save scores to")
args = parser.parse_args()

# Create a 2d array to store scores for each video pair, where each row is a new pair
# Use session state to retain values between button clicks
if "scores" not in st.session_state:
    st.session_state["scores"] = []

if "completedIndices" not in st.session_state:
    st.session_state["completedIndices"] = []

# TODO: add video display function, which can display video to streamlit
# Create class to hold video name and score
class Video:
    def __init__(self, name, directory=args.video_dir):
        self.name = name
        self.directory = directory

    def get_name(self):
        return self.name.split("/")[0]
    
    def get_dir(self):
        return os.path.join(self.directory, self.name)


# TODO: add VideoPair class to hold two Video objects, with the functions below as class functions
# Iterate through list of videos and create Video objects
def createVideoPairs(directory=args.video_dir):
    # List of video names fetched from 'demonstrations' folder
    videoDirs = []
    for folder in os.listdir(directory):
        for (dirpath, dirnames, filenames) in os.walk(os.path.join(directory, folder)):
            for filename in filenames:
                if "frontview_video.mp4" in filename:
                    videoDirs.append(os.path.join(folder, filename))
    
    # Append rVideo objects to list as per videos list
    videoPairs = []
    for i in range(len(videoDirs)):
        for j in range(i+1, len(videoDirs)):
            videoPairs.append((Video(videoDirs[i]), Video(videoDirs[j])))

    # for i in range(len(videoPairs)):
    #     st.write(videoPairs[i][0].get_name(), videoPairs[i][1].get_name())

    return videoPairs


# TODO: how to avoid sampling the same video pair twice?
# Function to select and display random videos
def selectVideoPair(videoPairs, completedIndices = st.session_state["completedIndices"]):

    availableIndices = [i for i in range(len(videoPairs)) if i not in completedIndices]

    if not availableIndices:
        return None, None

    index = random.choice(availableIndices)
    
    video_file_1 = open(videoPairs[index][0].get_dir(), "rb")
    video_file_2 = open(videoPairs[index][1].get_dir(), "rb")
    video_bytes_1 = video_file_1.read()
    video_bytes_2 = video_file_2.read()
    video_bytes = (video_bytes_1, video_bytes_2)

    return video_bytes, videoPairs[index]

# TODO: place two classes above in separate file and import them here
def updateScores(score):
    global video1, video2
    st.session_state.scores.append((video1.get_name(), video2.get_name(), score))


# Main function for streamlit
def main():
    # st.title("Trajectory Preference Tool")
    st.markdown("<h1 style='text-align: center;'>Trajectory Preference Tool</h1>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    videoPairs = createVideoPairs()

    # Create sidebar
    st.sidebar.title("Instructions")
    st.sidebar.write("1. Watch the videos showing the robot trajectories.")
    st.sidebar.write("2. Choose your prefered robot trajectory.")
    st.sidebar.write("3. Click the relevant button to submit your choice (once submitted, you cannot go back).")
    st.sidebar.write("4. Repeat steps 1-3 until you have watched all videos.")
    st.sidebar.write("5. Remember to click the download button below to save your preference data.")

    # Create columns for buttons
    _, butn1, _, butn2, _ = st.columns((2, 2, 3, 2, 2))
    # Create two columns for videos
    _, col1, _, col2, _ = st.columns((1, 4, 1, 4, 1))

    # Sketchy way to center
    cola, colb, colc, cold, cole= st.columns((1, 4, 1.6, 4, 1))

    # Display videos and buttons
    # If either button is clicked, update relevant score and change both videos
    global video1, video2
    try:
        (videoBytes1, videoBytes2), (video1, video2) = selectVideoPair(videoPairs)
        st.session_state.completedIndices.append(videoPairs.index((video1, video2)))

        # Update scores on click
        btn1 = butn1.button("Video 1 is better", key = "btn1", on_click = updateScores, args = (0,), kwargs = ())
        btn2 = butn2.button("Video 2 is better", key = "btn2", on_click = updateScores, args = (1,), kwargs = ())

        col1.video(videoBytes1)
        col2.video(videoBytes2)
        
        btn3 = colc.button("No preference", key = "btn3", on_click = updateScores, args = (0.5,), kwargs = ())
    except TypeError as e:
        # st.write("oops, finished: ", e)
        print(e)
        _, finishWord, _ = st.columns((1, 8, 1))
        finishWord.write("You have finished your labeling task!")
        finishWord.write("Remember to download and send us your preference data.")
        finishWord.write("Thank you for your participation!")


    # Save results to csv file
    df = pd.DataFrame(st.session_state.scores, columns = ["video1", "video2", "score"])
    # df.to_csv(args.save_path, index=False)
    st.sidebar.download_button(label="Download Preference Data", data=df.to_csv(index=False), file_name=args.save_path, mime='text/csv', help="Click to Download Your Preference Data")
    st.sidebar.write("Thank you for your participation!")

    # Display results
    if not df.empty:
        _, displayResults, _ = st.columns((1, 8, 1))
        displayResults.markdown("## Results")
        displayResults.markdown(df.to_markdown(index=False))

if __name__ == "__main__":

    main()
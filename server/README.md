## Backend

### Usage

1. Install python dependencies

   ```[bash]
   pip install -r requirements.txt
   ```

2. Run server at `localhost:5000`

   ```[bash]
   cd server/
   python server.py
   ```

### APIs

1. [GET] Query video path by id

   ```
   url = http://localhost:5000/query/<vid>
   ```

   and we will get a json response with path:

   ```
   {
       "/videos/<vid>/<vid>_frontview.mp4"
   }
   ```

   The path corresponds to the video file in `database/` directory,
   which is the static directory of the server. So we can get the video at
   `http://localhost:5000/videos/<vid>/<vid>_frontview.mp4`

2. [GET] Query users' incomplete video pair by user id

   ```
   url = http://localhost:5000/query/<mode>/<uid>
   ```

   and we will get a json response with paths of an incomplete video pair:

   ```
   {
       "/videos/<vid1>/<vid1>_frontview.mp4",
       "/videos/<vid2>/<vid2>_frontview.mp4"
   }
   ```

3. [POST] Submit user preference for a certain video pair

   ```
   url = http://localhost:5000/query/<mode>/<uid>
   data = {
       "video1": vid_pair[0],
       "video2": vid_pair[1],
       "pref_vid": pref_vid
   }
   ```

   where `pref_vid` is `vid_pair[0]`, `vid_pair[1]` or `"no pref"`, indicating the preferred video or no preference in the pair.

4. [GET] Download user preference csv file

   ```
   url = http://localhost:5000/download/<mode>/<uid>/
   ```

   and we will get the binaries of a csv file with the following format:

   ```
   video1,video2,pref_vid
   <vid1>,<vid2>,<pref_vid>
   <vid1>,<vid2>,<pref_vid>
   ...
   ```

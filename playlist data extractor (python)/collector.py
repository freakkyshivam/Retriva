import os
import json
import time

from youtube_transcript_api import YouTubeTranscriptApi


# ============================================================
# CONFIGURATION
# ============================================================

PLAYLIST_URL = (
    "https://www.youtube.com/playlist?"
    "list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz"
)

BASE_DIR = "data"

VIDEOS_DIR = os.path.join(
    BASE_DIR,
    "videos"
)

PLAYLIST_FILE = os.path.join(
    BASE_DIR,
    "playlist.json"
)

CHECKPOINT_FILE = os.path.join(
    BASE_DIR,
    "checkpoint.json"
)

FAILED_FILE = os.path.join(
    BASE_DIR,
    "failed.json"
)

# Number of videos to process in one run.
# You can later change this to 316.
MAX_VIDEOS = 316

# Delay between requests.
DELAY_SECONDS = 2


# ============================================================
# CREATE DIRECTORIES
# ============================================================

os.makedirs(
    VIDEOS_DIR,
    exist_ok=True
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def load_json(file_path, default):

    if not os.path.exists(file_path):
        return default

    try:
        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except Exception:

        print(
            f"Warning: Could not read {file_path}"
        )

        return default


def save_json(file_path, data):

    temp_file = file_path + ".tmp"

    with open(
        temp_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2
        )

    # Replace old file only after successful write
    os.replace(
        temp_file,
        file_path
    )


# ============================================================
# LOAD PLAYLIST
# ============================================================

playlist_data = load_json(
    PLAYLIST_FILE,
    None
)


if playlist_data is None:

    print()
    print("=" * 70)
    print("playlist.json not found!")
    print("=" * 70)
    print()
    print("Put your existing playlist.json inside:")
    print()
    print("data/playlist.json")
    print()

    input("Press Enter to exit...")
    exit()


videos = playlist_data.get(
    "videos",
    []
)


if not videos:

    print("No videos found in playlist.json.")

    input("Press Enter to exit...")
    exit()


print()
print("=" * 70)
print("DSA TRANSCRIPT COLLECTOR")
print("=" * 70)

print(
    f"Playlist : {playlist_data.get('title')}"
)

print(
    f"Videos   : {len(videos)}"
)

print(
    f"Output   : {VIDEOS_DIR}"
)

print("=" * 70)
print()


# ============================================================
# LOAD CHECKPOINT
# ============================================================

checkpoint = load_json(
    CHECKPOINT_FILE,
    {
        "completed": []
    }
)


completed = set(
    checkpoint.get(
        "completed",
        []
    )
)


# ============================================================
# LOAD FAILED VIDEOS
# ============================================================

failed = load_json(
    FAILED_FILE,
    []
)


failed_ids = set(
    item.get("video_id")
    for item in failed
)


print(
    f"Already completed : {len(completed)}"
)

print(
    f"Previously failed  : {len(failed)}"
)

print()


# ============================================================
# API CLIENT
# ============================================================

api = YouTubeTranscriptApi()


# ============================================================
# MAIN WORKER
# ============================================================

processed_this_run = 0


for index, video in enumerate(
    videos,
    start=1
):

    video_id = video.get(
        "video_id"
    )

    title = video.get(
        "title"
    )

    url = video.get(
        "url"
    )


    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if not video_id:

        print(
            f"⚠ Skipping video {index}: "
            "missing video_id"
        )

        continue


    # --------------------------------------------------------
    # Video JSON path
    # --------------------------------------------------------

    video_file = os.path.join(
        VIDEOS_DIR,
        f"{video_id}.json"
    )


    # --------------------------------------------------------
    # Already completed
    # --------------------------------------------------------

    if video_id in completed:

        print(
            f"✓ [{index}/{len(videos)}] "
            f"Already completed: {title}"
        )

        continue


    # --------------------------------------------------------
    # Existing file
    # --------------------------------------------------------

    if os.path.exists(video_file):

        print(
            f"✓ [{index}/{len(videos)}] "
            f"File exists: {title}"
        )

        completed.add(
            video_id
        )

        checkpoint["completed"] = list(
            completed
        )

        save_json(
            CHECKPOINT_FILE,
            checkpoint
        )

        continue


    # --------------------------------------------------------
    # Previously failed
    # --------------------------------------------------------

    if video_id in failed_ids:

        print(
            f"⚠ [{index}/{len(videos)}] "
            f"Previously failed: {title}"
        )

        continue


    # --------------------------------------------------------
    # MAX VIDEOS LIMIT
    # --------------------------------------------------------

    if processed_this_run >= MAX_VIDEOS:

        break


    # --------------------------------------------------------
    # PROCESS VIDEO
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print(
        f"Processing {index}/{len(videos)}"
    )
    print(
        f"Title: {title}"
    )
    print(
        f"Video ID: {video_id}"
    )
    print("=" * 70)


    try:

        # ----------------------------------------------------
        # Fetch transcript
        # ----------------------------------------------------

        transcript = api.fetch(
            video_id
        )


        # ----------------------------------------------------
        # Convert transcript
        # ----------------------------------------------------

        transcript_data = []


        for item in transcript:

            start = float(
                item.start
            )

            duration = float(
                item.duration
            )

            end = start + duration


            transcript_data.append({

                "start": start,

                "duration": duration,

                "end": end,

                "text": item.text

            })


        # ----------------------------------------------------
        # Build video data
        # ----------------------------------------------------

        video_data = {

            "position": index,

            "video_id": video_id,

            "title": title,

            "url": url,

            "transcript": transcript_data

        }


        # ----------------------------------------------------
        # Save transcript
        # ----------------------------------------------------

        save_json(
            video_file,
            video_data
        )


        # ----------------------------------------------------
        # Update checkpoint
        # ----------------------------------------------------

        completed.add(
            video_id
        )


        checkpoint["completed"] = list(
            completed
        )


        save_json(
            CHECKPOINT_FILE,
            checkpoint
        )


        # ----------------------------------------------------
        # Remove from failed if necessary
        # ----------------------------------------------------

        failed = [

            item

            for item in failed

            if item.get(
                "video_id"
            ) != video_id

        ]


        failed_ids.discard(
            video_id
        )


        save_json(
            FAILED_FILE,
            failed
        )


        # ----------------------------------------------------
        # Counter
        # ----------------------------------------------------

        processed_this_run += 1


        print()
        print(
            f"✓ SUCCESS"
        )

        print(
            f"Segments: "
            f"{len(transcript_data)}"
        )


        # ----------------------------------------------------
        # Delay
        # ----------------------------------------------------

        time.sleep(
            DELAY_SECONDS
        )


    except KeyboardInterrupt:

        print()
        print()
        print("=" * 70)
        print("STOPPED BY USER")
        print("=" * 70)
        print()
        print(
            "Progress has already been saved."
        )
        print(
            "Run the script again to continue."
        )
        print()

        break


    except Exception as e:

        # ----------------------------------------------------
        # Save failure
        # ----------------------------------------------------

        error_data = {

            "position": index,

            "video_id": video_id,

            "title": title,

            "url": url,

            "error": str(e)

        }


        failed.append(
            error_data
        )


        failed_ids.add(
            video_id
        )


        save_json(
            FAILED_FILE,
            failed
        )


        print()
        print(
            f"✗ FAILED"
        )

        print(
            f"Error: {e}"
        )

        print(
            "Continuing with next video..."
        )

        continue


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 70)
print("RUN COMPLETED")
print("=" * 70)

print(
    f"Processed this run : "
    f"{processed_this_run}"
)

print(
    f"Total completed    : "
    f"{len(completed)}"
)

print(
    f"Total failed       : "
    f"{len(failed)}"
)

print(
    f"Remaining          : "
    f"{len(videos) - len(completed) - len(failed)}"
)

print()
print(
    f"Transcripts saved in: {VIDEOS_DIR}"
)

print("=" * 70)

input(
    "\nPress Enter to exit..."
)
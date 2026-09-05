import os
import json
import time

from youtube_transcript_api import YouTubeTranscriptApi


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = "data"

VIDEOS_DIR = os.path.join(
    BASE_DIR,
    "videos"
)

FAILED_FILE = os.path.join(
    BASE_DIR,
    "failed.json"
)

CHECKPOINT_FILE = os.path.join(
    BASE_DIR,
    "checkpoint.json"
)

DELAY_SECONDS = 5


# ============================================================
# HELPERS
# ============================================================

def load_json(file_path, default):

    if not os.path.exists(file_path):
        return default

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)


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

    os.replace(
        temp_file,
        file_path
    )


# ============================================================
# LOAD DATA
# ============================================================

failed = load_json(
    FAILED_FILE,
    []
)

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


if not failed:

    print("No failed videos found.")

    input("Press Enter to exit...")
    exit()


print("=" * 70)
print("RETRY FAILED VIDEOS")
print("=" * 70)

print(
    "Failed videos:",
    len(failed)
)

print(
    "Already completed:",
    len(completed)
)

print("=" * 70)


# ============================================================
# API
# ============================================================

api = YouTubeTranscriptApi()


# ============================================================
# RETRY
# ============================================================

new_failed = []

success_count = 0

failed_count = 0


for retry_index, item in enumerate(
    failed,
    start=1
):

    video_id = item["video_id"]
    title = item.get(
        "title",
        "Unknown"
    )

    position = item.get(
        "position"
    )

    url = item.get(
        "url",
        f"https://www.youtube.com/watch?v={video_id}"
    )


    # --------------------------------------------------------
    # Already completed
    # --------------------------------------------------------

    if video_id in completed:

        print(
            f"✓ Already completed: {video_id}"
        )

        continue


    print()
    print("=" * 70)

    print(
        f"Retry {retry_index}/{len(failed)}"
    )

    print(
        f"Position: {position}"
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


        for item_data in transcript:

            start = float(
                item_data.start
            )

            duration = float(
                item_data.duration
            )

            end = start + duration


            transcript_data.append({

                "start": start,

                "duration": duration,

                "end": end,

                "text": item_data.text

            })


        # ----------------------------------------------------
        # Build JSON
        # ----------------------------------------------------

        video_data = {

            "position": position,

            "video_id": video_id,

            "title": title,

            "url": url,

            "transcript": transcript_data

        }


        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        video_file = os.path.join(
            VIDEOS_DIR,
            f"{video_id}.json"
        )


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


        success_count += 1


        print(
            f"✓ SUCCESS | "
            f"Segments: {len(transcript_data)}"
        )


    except KeyboardInterrupt:

        print()
        print("Stopped by user.")

        break


    except Exception as e:

        failed_count += 1


        # Keep this video in failed list
        new_failed.append({

            "position": position,

            "video_id": video_id,

            "title": title,

            "url": url,

            "error": str(e)

        })


        print(
            f"✗ FAILED: {e}"
        )


    # --------------------------------------------------------
    # Delay
    # --------------------------------------------------------

    time.sleep(
        DELAY_SECONDS
    )


# ============================================================
# SAVE UPDATED FAILED LIST
# ============================================================

save_json(
    FAILED_FILE,
    new_failed
)


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("RETRY COMPLETED")
print("=" * 70)

print(
    "Successful retries:",
    success_count
)

print(
    "Still failed:",
    len(new_failed)
)

print("=" * 70)
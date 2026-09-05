import json
import os
import time

from youtube_transcript_api import YouTubeTranscriptApi

FAILED_FILE = os.path.join("data", "failed.json")
OUTPUT_DIR = os.path.join("data", "videos")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_transcript(video_id):
    api = YouTubeTranscriptApi()
    transcript_list = api.list(video_id)

    hindi = None
    for transcript in transcript_list:
        if transcript.language_code == "hi":
            hindi = transcript
            break

    if hindi is None:
        raise RuntimeError("Hindi transcript not available")

    try:
        english = hindi.translate("en")
        return english.fetch(), "hi -> en"
    except Exception:
        return hindi.fetch(), "hi"


def main():
    if not os.path.exists(FAILED_FILE):
        print(f"ERROR: {FAILED_FILE} not found")
        return

    with open(FAILED_FILE, "r", encoding="utf-8") as f:
        failed = json.load(f)

    print("=" * 70)
    print("FAILED VIDEO RECOVERY")
    print("=" * 70)
    print(f"Videos to recover: {len(failed)}")

    recovered = 0
    failed_again = 0

    for index, video in enumerate(failed, start=1):
        video_id = video["video_id"]
        title = video.get("title")
        url = video["url"]
        position = video.get("position")

        output_file = os.path.join(OUTPUT_DIR, f"{video_id}.json")

        print()
        print("=" * 70)
        print(f"{index} / {len(failed)}")
        print(f"Title: {title}")
        print(f"Video ID: {video_id}")

        if os.path.exists(output_file):
            print("Already recovered, skipping")
            recovered += 1
            continue

        try:
            transcript, source_language = get_transcript(video_id)

            transcript_data = []

            for item in transcript:
                start = float(item.start)
                duration = float(item.duration)

                transcript_data.append({
                    "start": start,
                    "duration": duration,
                    "end": start + duration,
                    "text": item.text
                })

            video_data = {
                "position": position,
                "video_id": video_id,
                "title": title,
                "url": url,
                "transcript": transcript_data,
                "transcript_source": source_language
            }

            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(video_data, f, ensure_ascii=False, indent=2)

            print(
                f"Recovered | {len(transcript_data)} segments "
                f"| Source: {source_language}"
            )
            recovered += 1

        except Exception as e:
            print(f"Failed again: {e}")
            failed_again += 1

        time.sleep(2)

    print()
    print("=" * 70)
    print("RECOVERY COMPLETE")
    print("=" * 70)
    print("Recovered    :", recovered)
    print("Failed again :", failed_again)


if __name__ == "__main__":
    main()

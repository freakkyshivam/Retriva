import os
import json
import re


# ============================================================
# CONFIG
# ============================================================

VIDEOS_DIR = "data/videos"
CHUNKS_DIR = "data/chunks"

TARGET_WORDS = 350
OVERLAP_SEGMENTS = 1


# ============================================================
# CREATE OUTPUT DIRECTORY
# ============================================================

os.makedirs(
    CHUNKS_DIR,
    exist_ok=True
)


# ============================================================
# HELPERS
# ============================================================

def save_json(file_path, data):

    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2
        )


def clean_text(text):

    if not text:
        return ""

    # Remove excessive whitespace
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# GET VIDEO FILES
# ============================================================

video_files = [
    file
    for file in os.listdir(VIDEOS_DIR)
    if file.endswith(".json")
]


video_files.sort()


print()
print("=" * 70)
print("TRANSCRIPT CHUNKER")
print("=" * 70)

print(
    f"Videos found: {len(video_files)}"
)

print(
    f"Target words per chunk: {TARGET_WORDS}"
)

print("=" * 70)


total_chunks = 0
processed_videos = 0


# ============================================================
# PROCESS VIDEOS
# ============================================================

for video_index, filename in enumerate(
    video_files,
    start=1
):

    video_path = os.path.join(
        VIDEOS_DIR,
        filename
    )


    try:

        # ----------------------------------------------------
        # Load video JSON
        # ----------------------------------------------------

        with open(
            video_path,
            "r",
            encoding="utf-8"
        ) as f:

            video_data = json.load(f)


        video_id = video_data.get(
            "video_id"
        )

        title = video_data.get(
            "title"
        )

        url = video_data.get(
            "url"
        )

        position = video_data.get(
            "position"
        )

        transcript = video_data.get(
            "transcript",
            []
        )


        if not transcript:

            print(
                f"⚠ [{video_index}/{len(video_files)}] "
                f"No transcript: {filename}"
            )

            continue


        # ----------------------------------------------------
        # Prepare transcript segments
        # ----------------------------------------------------

        segments = []

        for segment in transcript:

            text = clean_text(
                segment.get(
                    "text",
                    ""
                )
            )

            if not text:
                continue


            segments.append({

                "start": float(
                    segment.get(
                        "start",
                        0
                    )
                ),

                "end": float(
                    segment.get(
                        "end",
                        segment.get(
                            "start",
                            0
                        )
                    )
                ),

                "text": text

            })


        if not segments:

            print(
                f"⚠ [{video_index}/{len(video_files)}] "
                f"Empty transcript: {filename}"
            )

            continue


        # ----------------------------------------------------
        # Create chunks
        # ----------------------------------------------------

        chunks = []

        current_segments = []
        current_words = 0


        for segment in segments:

            words = segment["text"].split()

            word_count = len(words)


            # ------------------------------------------------
            # If adding this segment crosses target,
            # finish current chunk first.
            # ------------------------------------------------

            if (
                current_segments
                and
                current_words + word_count > TARGET_WORDS
            ):

                chunk_text = " ".join(
                    item["text"]
                    for item in current_segments
                )


                chunks.append({

                    "chunk_index": len(chunks),

                    "video_id": video_id,

                    "position": position,

                    "title": title,

                    "url": url,

                    "start": current_segments[0]["start"],

                    "end": current_segments[-1]["end"],

                    "text": chunk_text,

                    "word_count": current_words

                })


                # --------------------------------------------
                # Keep small overlap
                # --------------------------------------------

                if OVERLAP_SEGMENTS > 0:

                    current_segments = (
                        current_segments[
                            -OVERLAP_SEGMENTS:
                        ]
                    )

                    current_words = sum(
                        len(
                            item["text"].split()
                        )
                        for item in current_segments
                    )

                else:

                    current_segments = []

                    current_words = 0


            # ------------------------------------------------
            # Add segment
            # ------------------------------------------------

            current_segments.append(
                segment
            )

            current_words += word_count


        # ----------------------------------------------------
        # Save final chunk
        # ----------------------------------------------------

        if current_segments:

            chunk_text = " ".join(
                item["text"]
                for item in current_segments
            )


            chunks.append({

                "chunk_index": len(chunks),

                "video_id": video_id,

                "position": position,

                "title": title,

                "url": url,

                "start": current_segments[0]["start"],

                "end": current_segments[-1]["end"],

                "text": chunk_text,

                "word_count": current_words

            })


        # ----------------------------------------------------
        # Save chunks for this video
        # ----------------------------------------------------

        output_file = os.path.join(
            CHUNKS_DIR,
            f"{video_id}.json"
        )


        output_data = {

            "video_id": video_id,

            "position": position,

            "title": title,

            "url": url,

            "chunk_count": len(chunks),

            "chunks": chunks

        }


        save_json(
            output_file,
            output_data
        )


        # ----------------------------------------------------
        # Stats
        # ----------------------------------------------------

        total_chunks += len(chunks)

        processed_videos += 1


        print(
            f"✓ [{video_index}/{len(video_files)}] "
            f"{title}"
        )

        print(
            f"  Segments: {len(segments)}"
        )

        print(
            f"  Chunks: {len(chunks)}"
        )


    except Exception as e:

        print(
            f"✗ [{video_index}/{len(video_files)}] "
            f"{filename}"
        )

        print(
            f"  Error: {e}"
        )


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 70)
print("CHUNKING COMPLETED")
print("=" * 70)

print(
    f"Videos processed : {processed_videos}"
)

print(
    f"Total chunks     : {total_chunks}"
)

print(
    f"Output directory : {CHUNKS_DIR}"
)

print("=" * 70)
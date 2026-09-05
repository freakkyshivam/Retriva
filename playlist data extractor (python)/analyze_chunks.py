import os
import json
import statistics


# ============================================================
# CONFIG
# ============================================================

CHUNKS_DIR = "data/chunks"


# ============================================================
# LOAD CHUNKS
# ============================================================

files = [
    file
    for file in os.listdir(CHUNKS_DIR)
    if file.endswith(".json")
]

files.sort()


if not files:

    print("No chunk files found.")

    input("Press Enter to exit...")
    exit()


# ============================================================
# STATS
# ============================================================

video_count = 0
total_chunks = 0

word_counts = []
chunks_per_video = []

small_chunks = []
large_chunks = []

short_duration_chunks = []
long_duration_chunks = []


# ============================================================
# PROCESS
# ============================================================

for filename in files:

    file_path = os.path.join(
        CHUNKS_DIR,
        filename
    )

    try:

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as f:

            data = json.load(f)


        chunks = data.get(
            "chunks",
            []
        )


        if not chunks:
            continue


        video_count += 1

        total_chunks += len(chunks)

        chunks_per_video.append(
            len(chunks)
        )


        for chunk in chunks:

            word_count = chunk.get(
                "word_count",
                len(
                    chunk.get(
                        "text",
                        ""
                    ).split()
                )
            )

            start = float(
                chunk.get(
                    "start",
                    0
                )
            )

            end = float(
                chunk.get(
                    "end",
                    0
                )
            )

            duration = end - start


            word_counts.append(
                word_count
            )


            # ----------------------------------------------
            # Very small chunks
            # ----------------------------------------------

            if word_count < 150:

                small_chunks.append({

                    "video_id": chunk.get(
                        "video_id"
                    ),

                    "title": chunk.get(
                        "title"
                    ),

                    "chunk_index": chunk.get(
                        "chunk_index"
                    ),

                    "word_count": word_count

                })


            # ----------------------------------------------
            # Very large chunks
            # ----------------------------------------------

            if word_count > 500:

                large_chunks.append({

                    "video_id": chunk.get(
                        "video_id"
                    ),

                    "title": chunk.get(
                        "title"
                    ),

                    "chunk_index": chunk.get(
                        "chunk_index"
                    ),

                    "word_count": word_count

                })


            # ----------------------------------------------
            # Duration stats
            # ----------------------------------------------

            if duration < 20:

                short_duration_chunks.append(
                    duration
                )


            if duration > 180:

                long_duration_chunks.append(
                    duration
                )


    except Exception as e:

        print(
            f"Error reading {filename}: {e}"
        )


# ============================================================
# CALCULATE
# ============================================================

average_words = (
    statistics.mean(word_counts)
    if word_counts
    else 0
)

median_words = (
    statistics.median(word_counts)
    if word_counts
    else 0
)

min_words = (
    min(word_counts)
    if word_counts
    else 0
)

max_words = (
    max(word_counts)
    if word_counts
    else 0
)

average_chunks = (
    statistics.mean(chunks_per_video)
    if chunks_per_video
    else 0
)

median_chunks = (
    statistics.median(chunks_per_video)
    if chunks_per_video
    else 0
)


# ============================================================
# PRINT REPORT
# ============================================================

print()
print("=" * 70)
print("CHUNK ANALYSIS")
print("=" * 70)

print()

print(
    f"Video files analysed : {video_count}"
)

print(
    f"Total chunks         : {total_chunks}"
)

print()

print(
    f"Average chunks/video : {average_chunks:.2f}"
)

print(
    f"Median chunks/video  : {median_chunks}"
)

print()

print(
    f"Average words/chunk  : {average_words:.2f}"
)

print(
    f"Median words/chunk   : {median_words}"
)

print(
    f"Minimum words        : {min_words}"
)

print(
    f"Maximum words        : {max_words}"
)

print()

print(
    f"Chunks < 150 words  : {len(small_chunks)}"
)

print(
    f"Chunks > 500 words  : {len(large_chunks)}"
)

print()

print(
    f"Chunks < 20 sec     : "
    f"{len(short_duration_chunks)}"
)

print(
    f"Chunks > 3 minutes  : "
    f"{len(long_duration_chunks)}"
)

print()

print("=" * 70)


# ============================================================
# SHOW EXTREMES
# ============================================================

if small_chunks:

    print()
    print("SMALL CHUNKS")
    print("-" * 70)

    for chunk in small_chunks[:10]:

        print(
            f"{chunk['word_count']} words | "
            f"{chunk['title']} | "
            f"chunk {chunk['chunk_index']}"
        )


if large_chunks:

    print()
    print("LARGE CHUNKS")
    print("-" * 70)

    for chunk in large_chunks[:10]:

        print(
            f"{chunk['word_count']} words | "
            f"{chunk['title']} | "
            f"chunk {chunk['chunk_index']}"
        )


# ============================================================
# FINAL
# ============================================================

print()
print("=" * 70)
print("ANALYSIS COMPLETE")
print("=" * 70)

input("\nPress Enter to exit...")
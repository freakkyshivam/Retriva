import json

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# CONFIG
# ============================================================

EMBEDDINGS_FILE = "data/embeddings.json"

MODEL_NAME = "all-MiniLM-L6-v2"

CANDIDATE_K = 20

MAX_VIDEOS = 5

MAX_RESULTS_PER_VIDEO = 3

SIMILARITY_THRESHOLD = 0.35


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading embedding model...")

model = SentenceTransformer(MODEL_NAME)

print("✓ Model loaded")


# ============================================================
# LOAD EMBEDDINGS
# ============================================================

print("Loading embeddings...")

with open(
    EMBEDDINGS_FILE,
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)


print(f"✓ Loaded {len(data)} chunks")


# ============================================================
# HELPERS
# ============================================================

def format_timestamp(seconds):

    seconds = int(seconds)

    hours = seconds // 3600

    minutes = (seconds % 3600) // 60

    seconds = seconds % 60

    if hours > 0:

        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    return f"{minutes:02d}:{seconds:02d}"


def build_timestamp_url(url, start):

    separator = "&" if "?" in url else "?"

    return f"{url}{separator}t={int(start)}s"


# ============================================================
# SEARCH
# ============================================================

def search(query):

    # --------------------------------------------------------
    # Create query embedding
    # --------------------------------------------------------

    query_embedding = model.encode(
        [query],
        normalize_embeddings=True
    )


    # --------------------------------------------------------
    # Get stored embeddings
    # --------------------------------------------------------

    stored_embeddings = [
        item["embedding"]
        for item in data
    ]


    # --------------------------------------------------------
    # Calculate similarity
    # --------------------------------------------------------

    similarities = cosine_similarity(
        query_embedding,
        stored_embeddings
    )[0]


    # --------------------------------------------------------
    # Get top candidates
    # --------------------------------------------------------

    top_indices = similarities.argsort()[::-1][:CANDIDATE_K]


    candidates = []


    for index in top_indices:

        score = float(similarities[index])

        if score < SIMILARITY_THRESHOLD:
            continue

        result = data[index].copy()

        result["score"] = score

        candidates.append(result)


    # --------------------------------------------------------
    # Group results by video
    # --------------------------------------------------------

    videos = {}


    for result in candidates:

        video_id = result["video_id"]

        if video_id not in videos:

            videos[video_id] = {
                "video_id": video_id,
                "title": result["title"],
                "url": result["url"],
                "position": result.get("position"),
                "results": []
            }

        videos[video_id]["results"].append(result)


    # --------------------------------------------------------
    # Sort chunks inside each video by score
    # --------------------------------------------------------

    for video in videos.values():

        video["results"].sort(
            key=lambda x: x["score"],
            reverse=True
        )

        video["best_score"] = video["results"][0]["score"]


    # --------------------------------------------------------
    # Sort videos by best score
    # --------------------------------------------------------

    video_list = list(videos.values())

    video_list.sort(
        key=lambda x: x["best_score"],
        reverse=True
    )


    # --------------------------------------------------------
    # Select top videos
    # --------------------------------------------------------

    video_list = video_list[:MAX_VIDEOS]


    # --------------------------------------------------------
    # Remove nearby chunks
    # --------------------------------------------------------

    for video in video_list:

        selected = []

        # Sort by timestamp
        chronological = sorted(
            video["results"],
            key=lambda x: x["start"]
        )


        for result in chronological:

            if len(selected) >= MAX_RESULTS_PER_VIDEO:
                break


            duplicate = False


            for existing in selected:

                # If chunks are overlapping
                # or very close to each other
                if (
                    result["start"] <= existing["end"] + 30
                    and
                    result["end"] >= existing["start"] - 30
                ):

                    duplicate = True

                    break


            if not duplicate:

                selected.append(result)


        # Sort selected results by relevance
        selected.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        video["results"] = selected


    # ========================================================
    # DISPLAY
    # ========================================================

    print()
    print("=" * 70)
    print(f"QUERY: {query}")
    print("=" * 70)


    if not video_list:

        print()
        print("No relevant results found.")

        return


    for video_number, video in enumerate(
        video_list,
        start=1
    ):

        print()

        print(
            f"#{video_number} {video['title']}"
        )

        print(
            f"Best Score: {video['best_score']:.4f}"
        )

        print(
            f"Video ID: {video['video_id']}"
        )

        print()


        for result in video["results"]:

            start = result["start"]

            end = result["end"]

            timestamp = format_timestamp(start)

            end_timestamp = format_timestamp(end)

            timestamp_url = build_timestamp_url(
                result["url"],
                start
            )


            print(
                f"  ▶ {timestamp} → {end_timestamp}"
            )

            print(
                f"    Score: {result['score']:.4f}"
            )

            print()

            print(
                f"    {result['text'][:400]}"
            )

            print()

            print(
                f"    {timestamp_url}"
            )

            print()


        print("-" * 70)


# ============================================================
# INTERACTIVE SEARCH
# ============================================================

print()
print("=" * 70)
print("DSA SEMANTIC SEARCH")
print("=" * 70)

print()
print("Type your query.")
print("Type 'exit' to stop.")
print()


while True:

    query = input("Search: ").strip()


    if query.lower() == "exit":

        print("Goodbye!")

        break


    if not query:

        continue


    try:

        search(query)

    except Exception as e:

        print()
        print(f"Search error: {e}")
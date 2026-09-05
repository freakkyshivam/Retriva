import os
import json

from sentence_transformers import SentenceTransformer


# ============================================================
# CONFIG
# ============================================================

CHUNKS_DIR = "data/chunks"
OUTPUT_FILE = "data/embeddings.json"

MODEL_NAME = "all-MiniLM-L6-v2"

BATCH_SIZE = 32


# ============================================================
# LOAD MODEL
# ============================================================

print()
print("=" * 70)
print("LOADING EMBEDDING MODEL")
print("=" * 70)

model = SentenceTransformer(
    MODEL_NAME
)

print("✓ Model loaded")


# ============================================================
# LOAD CHUNKS
# ============================================================

chunk_files = [
    file
    for file in os.listdir(CHUNKS_DIR)
    if file.endswith(".json")
]

chunk_files.sort()


print()
print(
    f"Video chunk files found: {len(chunk_files)}"
)


all_chunks = []


for filename in chunk_files:

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


        for chunk in chunks:

            all_chunks.append(chunk)


    except Exception as e:

        print(
            f"✗ Failed to read {filename}: {e}"
        )


print(
    f"Total chunks loaded: {len(all_chunks)}"
)


if not all_chunks:

    print("No chunks found.")

    input("Press Enter to exit...")
    exit()


# ============================================================
# PREPARE TEXT
# ============================================================

texts = [
    chunk["text"]
    for chunk in all_chunks
]


# ============================================================
# GENERATE EMBEDDINGS
# ============================================================

print()
print("=" * 70)
print("GENERATING EMBEDDINGS")
print("=" * 70)

print(
    f"Chunks: {len(texts)}"
)

print(
    f"Batch size: {BATCH_SIZE}"
)

print()


embeddings = model.encode(
    texts,
    batch_size=BATCH_SIZE,
    show_progress_bar=True,
    normalize_embeddings=True
)


print()
print("✓ Embeddings generated")


# ============================================================
# BUILD OUTPUT
# ============================================================

embedding_data = []


for index, chunk in enumerate(all_chunks):

    embedding_data.append({

        "id": index,

        "video_id": chunk["video_id"],

        "position": chunk.get(
            "position"
        ),

        "title": chunk["title"],

        "url": chunk["url"],

        "chunk_index": chunk["chunk_index"],

        "start": chunk["start"],

        "end": chunk["end"],

        "text": chunk["text"],

        "word_count": chunk["word_count"],

        "embedding": embeddings[index].tolist()

    })


# ============================================================
# SAVE
# ============================================================

print()
print("=" * 70)
print("SAVING EMBEDDINGS")
print("=" * 70)


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        embedding_data,
        f,
        ensure_ascii=False
    )


print()
print(
    f"✓ Saved: {OUTPUT_FILE}"
)

print(
    f"✓ Total embeddings: {len(embedding_data)}"
)

print(
    f"✓ Dimension: {len(embedding_data[0]['embedding'])}"
)

print()
print("=" * 70)
print("EMBEDDING GENERATION COMPLETED")
print("=" * 70)
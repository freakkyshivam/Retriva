import fs from "node:fs/promises";
import path from "node:path";

import { qdrant } from "../config/qdrant.js";

const COLLECTION_NAME = "striver_dsa";

const EMBEDDINGS_FILE = path.join(
  process.cwd(),
  "data",
  "embeddings.json"
);

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

interface EmbeddingEntry {
  id: number;
  video_id: string;
  position: number;
  title: string;
  url: string;
  chunk_index: number;
  start: number;
  end: number;
  text: string;
  word_count: number;
  embedding: number[];
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function uploadBatch(
  batch: EmbeddingEntry[],
  batchNumber: number,
  totalBatches: number
) {
  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,

        points: batch.map((item) => ({
          // Qdrant point IDs can be integers.
          id: item.id,

          vector: item.embedding,

          payload: {
            videoId: item.video_id,
            position: item.position,
            title: item.title,
            url: item.url,
            chunkIndex: item.chunk_index,
            start: item.start,
            end: item.end,
            text: item.text,
            wordCount: item.word_count,
          },
        })),
      });

      console.log(
        `✓ Batch ${batchNumber}/${totalBatches} uploaded | ${batch.length} chunks`
      );

      return;
    } catch (error) {
      console.error(
        `✗ Batch ${batchNumber} failed | Attempt ${attempt}/${MAX_RETRIES}`
      );

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await sleep(2000 * attempt);
    }
  }
}

async function ingestEmbeddings() {
  console.log("\n" + "=".repeat(70));
  console.log("QDRANT INGESTION");
  console.log("=".repeat(70));

  // --------------------------------------------------
  // Read embeddings.json
  // --------------------------------------------------

  console.log("\nReading embeddings.json...");

  const raw = await fs.readFile(
    EMBEDDINGS_FILE,
    "utf-8"
  );

  const embeddings: EmbeddingEntry[] =
    JSON.parse(raw);

  console.log(
    `✓ Loaded ${embeddings.length} embeddings`
  );

  if (embeddings.length === 0) {
    throw new Error(
      "embeddings.json is empty"
    );
  }

  // --------------------------------------------------
  // Validate first embedding
  // --------------------------------------------------

  const dimension =
    embeddings[0]?.embedding.length;

  console.log(
    `Embedding dimension: ${dimension}`
  );

  if (dimension !== 384) {
    throw new Error(
      `Expected 384 dimensions, got ${dimension}`
    );
  }

  // --------------------------------------------------
  // Check collection
  // --------------------------------------------------

  const collections =
    await qdrant.getCollections();

  const collectionExists =
    collections.collections.some(
      (collection) =>
        collection.name === COLLECTION_NAME
    );

  if (!collectionExists) {
    throw new Error(
      `Collection "${COLLECTION_NAME}" does not exist`
    );
  }

  console.log(
    `✓ Collection "${COLLECTION_NAME}" found`
  );

  // --------------------------------------------------
  // Create batches
  // --------------------------------------------------

  const totalBatches = Math.ceil(
    embeddings.length / BATCH_SIZE
  );

  console.log(
    `Batch size: ${BATCH_SIZE}`
  );

  console.log(
    `Total batches: ${totalBatches}`
  );

  console.log();

  // --------------------------------------------------
  // Upload
  // --------------------------------------------------

  let uploaded = 0;

  for (
    let i = 0;
    i < embeddings.length;
    i += BATCH_SIZE
  ) {
    const batch = embeddings.slice(
      i,
      i + BATCH_SIZE
    );

    const batchNumber =
      Math.floor(i / BATCH_SIZE) + 1;

    await uploadBatch(
      batch,
      batchNumber,
      totalBatches
    );

    uploaded += batch.length;

    const percentage = (
      (uploaded / embeddings.length) *
      100
    ).toFixed(1);

    console.log(
      `  Progress: ${uploaded}/${embeddings.length} (${percentage}%)`
    );

    // Small delay between batches
    await sleep(300);
  }

  // --------------------------------------------------
  // Verify count
  // --------------------------------------------------

  const collectionInfo =
    await qdrant.getCollection(
      COLLECTION_NAME
    );

  console.log("\n" + "=".repeat(70));
  console.log("INGESTION COMPLETE");
  console.log("=".repeat(70));

  console.log(
    `Embeddings loaded : ${embeddings.length}`
  );

  console.log(
    `Uploaded          : ${uploaded}`
  );

  console.log(
    `Qdrant points      : ${collectionInfo.points_count}`
  );

  console.log("=".repeat(70));
}

ingestEmbeddings().catch((error) => {
  console.error("\n" + "=".repeat(70));
  console.error("INGESTION FAILED");
  console.error("=".repeat(70));

  console.error(error);

  process.exit(1);
});
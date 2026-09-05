import { pipeline } from "@huggingface/transformers";
import { qdrant } from "../config/qdrant.js";

const COLLECTION_NAME = "striver_dsa";

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

async function semanticSearch(query: string) {
  console.log("\n" + "=".repeat(70));
  console.log("SEMANTIC SEARCH");
  console.log("=".repeat(70));

  console.log("\nQuery:", query);
  console.log("Loading embedding model...");

  const extractor = await pipeline(
    "feature-extraction",
    MODEL_NAME
  );

  console.log("✓ Model loaded");

  // Generate embedding for the search query
  const output = await extractor(query, {
    pooling: "mean",
    normalize: true,
  });

  const queryVector = Array.from(output.data);

  console.log(
    "Query embedding dimensions:",
    queryVector.length
  );

  // Search Qdrant
  const results = await qdrant.query(
    COLLECTION_NAME,
    {
      query: queryVector,
      limit: 5,
      with_payload: true,
    }
  );

  console.log("\n" + "=".repeat(70));
  console.log("SEARCH RESULTS");
  console.log("=".repeat(70));

  results.points.forEach((result, index) => {
    const payload = result.payload as {
      videoId: string;
      title: string;
      url: string;
      chunkIndex: number;
      start: number;
      end: number;
      text: string;
      wordCount: number;
    };

    console.log(
      `\n#${index + 1} | Score: ${result.score.toFixed(4)}`
    );

    console.log(
      `Title: ${payload.title}`
    );

    console.log(
      `Video ID: ${payload.videoId}`
    );

    console.log(
      `Timestamp: ${payload.start}s → ${payload.end}s`
    );

    console.log(
      `Chunk: ${payload.chunkIndex}`
    );

    console.log(
      `URL: ${payload.url}&t=${Math.floor(
        payload.start
      )}s`
    );

    console.log(
      `\n${payload.text.slice(0, 500)}...`
    );

    console.log("-".repeat(70));
  });
}

const query =
  process.argv.slice(2).join(" ") ||
  "Dijkstra's Algorithm";

semanticSearch(query).catch((error) => {
  console.error("\nSearch failed:");
  console.error(error);

  process.exit(1);
});
import fs from "node:fs/promises";
import path from "node:path";

const EMBEDDINGS_FILE = path.join(
  process.cwd(),
  "data",
  "embeddings.json"
);

async function inspectEmbeddings() {
  const raw = await fs.readFile(
    EMBEDDINGS_FILE,
    "utf-8"
  );

  const data = JSON.parse(raw);

  console.log("\n" + "=".repeat(60));
  console.log("EMBEDDINGS INSPECTION");
  console.log("=".repeat(60));

  console.log(
    "Total entries:",
    Array.isArray(data) ? data.length : "Not an array"
  );

  const first = Array.isArray(data)
    ? data[0]
    : null;

  if (!first) {
    throw new Error("No embedding entries found");
  }

  console.log("\nFirst entry keys:");
  console.log(Object.keys(first));

  console.log(
    "\nEmbedding dimensions:",
    first.embedding?.length
  );

  console.log(
    "\nText:",
    first.text?.slice(0, 200) + "..."
  );

  console.log(
    "\nWord count:",
    first.word_count
  );

  console.log("\nFull first entry metadata:");
  console.dir(
    {
      ...first,
      embedding: `[${first.embedding?.length} numbers]`
    },
    { depth: null }
  );

  console.log("\n" + "=".repeat(60));
}

inspectEmbeddings().catch((error) => {
  console.error("Inspection failed:");
  console.error(error);
  process.exit(1);
});
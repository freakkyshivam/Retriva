import fs from "node:fs/promises";
import path from "node:path";

const CHUNKS_DIR = path.join(process.cwd(), "data", "chunks");

async function readChunks() {
  const files = await fs.readdir(CHUNKS_DIR);

  const jsonFiles = files.filter(
    (file) => file.endsWith(".json")
  );

  console.log(`Found ${jsonFiles.length} JSON files`);

  if (jsonFiles.length === 0) {
    console.log("No chunk files found.");
    return;
  }

  const firstFile = jsonFiles[0];
  if (!firstFile) return;

  const filePath = path.join(
    CHUNKS_DIR,
    firstFile
  );

  const content = await fs.readFile(
    filePath,
    "utf-8"
  );

  const data = JSON.parse(content);

  console.log("\nFirst file:");
  console.log(firstFile);

  console.log("\nData:");
  console.dir(data, {
    depth: null
  });
}

readChunks().catch((error) => {
  console.error("Failed to read chunks:");
  console.error(error);
});
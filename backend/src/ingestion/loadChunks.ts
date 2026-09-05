import fs from "node:fs/promises";
import path from "node:path";

export interface Chunk {
  id: string;
  videoId: string;
  position: number;
  title: string;
  url: string;
  chunkIndex: number;
  start: number;
  end: number;
  text: string;
  wordCount: number;
}

interface VideoFile {
  video_id: string;
  position: number;
  title: string;
  url: string;
  chunk_count: number;
  chunks: Array<{
    chunk_index: number;
    video_id: string;
    position: number;
    title: string;
    url: string;
    start: number;
    end: number;
    text: string;
    word_count: number;
  }>;
}

const CHUNKS_DIR = path.join(
  process.cwd(),
  "data",
  "chunks"
);

export async function loadChunks(): Promise<Chunk[]> {
  const files = await fs.readdir(CHUNKS_DIR);

  const jsonFiles = files.filter(
    (file) => file.endsWith(".json")
  );

  console.log(
    `Found ${jsonFiles.length} video files`
  );

  const allChunks: Chunk[] = [];

  for (const file of jsonFiles) {
    const filePath = path.join(
      CHUNKS_DIR,
      file
    );

    const content = await fs.readFile(
      filePath,
      "utf-8"
    );

    const video: VideoFile = JSON.parse(content);

    for (const chunk of video.chunks) {
      allChunks.push({
        id: `${video.video_id}-${chunk.chunk_index}`,

        videoId: video.video_id,

        position: video.position,

        title: video.title,

        url: video.url,

        chunkIndex: chunk.chunk_index,

        start: chunk.start,

        end: chunk.end,

        text: chunk.text,

        wordCount: chunk.word_count
      });
    }
  }

  return allChunks;
}


// Test loader
async function main() {
  const chunks = await loadChunks();

  console.log();
  console.log("=".repeat(60));
  console.log("CHUNK LOADER");
  console.log("=".repeat(60));

  console.log(
    `Video files : ${new Set(
      chunks.map((chunk) => chunk.videoId)
    ).size}`
  );

  console.log(
    `Total chunks: ${chunks.length}`
  );

  console.log();
  console.log("First chunk:");
  console.dir(chunks[0], {
    depth: null
  });
}

main().catch((error) => {
  console.error(
    "Failed to load chunks:"
  );

  console.error(error);

  process.exit(1);
});
import { openai } from "../config/openai.js";
import { qdrant } from "../config/qdrant.js";
import { loadChunks } from "./loadChunks.js";

const COLLECTION_NAME = "striver_dsa";

async function testEmbedding() {
  const chunks = await loadChunks();

  const chunk = chunks[0];

  if(!chunk){
    console.log("Chunk is not found");
    
    return;
  }

  console.log("Generating embedding...");
  console.log(`Video: ${chunk.title}`);
  console.log(`Chunk: ${chunk.chunkIndex}`);

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk.text,
  });

  if(!response){
    console.log("Open emabadding not give any response");
    return;
  }

  const vector = response?.data[0]?.embedding;

  if(!vector){
    console.log("OpenAi is not give nay vector");
    return;
  }

  console.log(`✓ Embedding generated`);
  console.log(`Vector dimensions: ${vector.length}`);

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,

    points: [
      {
        id: chunk.id,

        vector,

        payload: {
          videoId: chunk.videoId,
          position: chunk.position,
          title: chunk.title,
          url: chunk.url,
          chunkIndex: chunk.chunkIndex,
          start: chunk.start,
          end: chunk.end,
          text: chunk.text,
          wordCount: chunk.wordCount,
        },
      },
    ],
  });

  console.log("✓ Chunk inserted into Qdrant");
}

testEmbedding().catch((error) => {
  console.error("Embedding test failed:");
  console.error(error);

  process.exit(1);
});
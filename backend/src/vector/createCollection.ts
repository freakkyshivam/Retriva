import { qdrant } from "../config/qdrant.js";

const COLLECTION_NAME = "striver_dsa";

async function createCollection() {
  const collections = await qdrant.getCollections();

  const exists = collections.collections.some(
    (collection) =>
      collection.name === COLLECTION_NAME
  );

  if (exists) {
    console.log(
      `Collection "${COLLECTION_NAME}" already exists.`
    );

    console.log(
      "Delete the old collection first because the embeddings are 384-dimensional."
    );

    return;
  }

  await qdrant.createCollection(
    COLLECTION_NAME,
    {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    }
  );

  console.log(
    `✓ Collection "${COLLECTION_NAME}" created with 384 dimensions`
  );
}

createCollection().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
import { qdrant } from "../config/qdrant.js";

const COLLECTION_NAME = "striver_dsa";

async function resetCollection() {
  const collections = await qdrant.getCollections();

  const exists = collections.collections.some(
    (collection) =>
      collection.name === COLLECTION_NAME
  );

  if (exists) {
    await qdrant.deleteCollection(
      COLLECTION_NAME
    );

    console.log(
      `✓ Deleted collection: ${COLLECTION_NAME}`
    );
  } else {
    console.log(
      `Collection "${COLLECTION_NAME}" does not exist.`
    );
  }
}

resetCollection().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
import { pipeline } from '@huggingface/transformers';

let extractor: any = null;

export const initEmbeddingModel = async () => {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('Embedding model initialized');
    }
};

export const getQueryEmbedding = async (query: string): Promise<number[]> => {
    await initEmbeddingModel();
    const output = await extractor(query, { pooling: 'mean', normalize: true, truncation: true });
    return Array.from(output.data);
};

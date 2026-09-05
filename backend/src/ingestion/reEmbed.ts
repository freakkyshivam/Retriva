import fs from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from '@huggingface/transformers';

const CHUNKS_DIR = path.join(process.cwd(), 'data', 'chunks');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'embeddings.json');
const BATCH_SIZE = 16;

async function reEmbed() {
    console.log('\n' + '='.repeat(70));
    console.log('RE-EMBEDDING WITH TITLE CONTEXT');
    console.log('='.repeat(70));

    console.log('\nLoading embedding model...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✓ Model loaded');

    // Read all chunk files
    console.log(`\nReading chunks from ${CHUNKS_DIR}...`);
    const files = await fs.readdir(CHUNKS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} video files`);

    const allChunks: Array<{
        video_id: string;
        position: number;
        title: string;
        url: string;
        chunk_index: number;
        start: number;
        end: number;
        text: string;
        word_count: number;
    }> = [];

    for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(CHUNKS_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        if (data.chunks && Array.isArray(data.chunks)) {
            for (const chunk of data.chunks) {
                allChunks.push({
                    video_id: data.video_id,
                    position: data.position,
                    title: data.title,
                    url: data.url,
                    chunk_index: chunk.chunk_index,
                    start: chunk.start,
                    end: chunk.end,
                    text: chunk.text,
                    word_count: chunk.word_count
                });
            }
        }
    }

    console.log(`Total chunks: ${allChunks.length}`);
    console.log(`Batch size: ${BATCH_SIZE}`);
    const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);
    console.log(`Total batches: ${totalBatches}\n`);

    // Generate embeddings in batches
    const output: Array<Record<string, unknown>> = [];

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);

        // Title-enriched text for embedding
        const batchTexts = batch.map(c => `${c.title}: ${c.text}`);

        const result = await extractor(batchTexts, { pooling: 'mean', normalize: true });

        for (let j = 0; j < batch.length; j++) {
            const embedding = Array.from(result.data.slice(j * 384, (j + 1) * 384));
            const chunk = batch[j]!;
            output.push({
                id: i + j,
                video_id: chunk.video_id,
                position: chunk.position,
                title: chunk.title,
                url: chunk.url,
                chunk_index: chunk.chunk_index,
                start: chunk.start,
                end: chunk.end,
                text: chunk.text,           // original text (not enriched)
                word_count: chunk.word_count,
                embedding
            });
        }

        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const pct = ((output.length / allChunks.length) * 100).toFixed(1);
        console.log(`✓ Batch ${batchNum}/${totalBatches} | ${output.length}/${allChunks.length} (${pct}%)`);
    }

    // Save
    console.log('\nSaving embeddings...');
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(output), 'utf-8');

    console.log('\n' + '='.repeat(70));
    console.log('RE-EMBEDDING COMPLETE');
    console.log('='.repeat(70));
    console.log(`Total chunks: ${output.length}`);
    console.log(`Dimension: 384`);
    console.log(`Output: ${OUTPUT_FILE}`);
    console.log('='.repeat(70));
}

reEmbed().catch(err => {
    console.error('Re-embedding failed:', err);
    process.exit(1);
});

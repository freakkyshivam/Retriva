import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export interface FailedVideo {
    position: number;
    video_id: string;
    title: string;
    url: string;
    error: string;
}

let failedCache: FailedVideo[] | null = null;
const FAILED_FILE = fileURLToPath(new URL('../../data/failed.json', import.meta.url));

export async function getFailedVideos(): Promise<FailedVideo[]> {
    if (!failedCache) {
        try {
            const content = await fs.readFile(FAILED_FILE, 'utf-8');
            const raw = JSON.parse(content) as Array<Record<string, unknown>>;
            failedCache = raw.map(v => ({
                position: Number(v.position) || 0,
                video_id: String(v.video_id || ''),
                title: String(v.title || ''),
                url: String(v.url || ''),
                error: String(v.error || '')
            }));
        } catch (err) {
            console.warn('Could not load failed.json from', FAILED_FILE, err);
            failedCache = [];
        }
    }
    return failedCache;
}

/**
 * Search failed videos by title keyword match.
 * Returns videos whose titles contain the query words, sorted by relevance.
 */
export async function searchFailedVideos(query: string): Promise<FailedVideo[]> {
    const all = await getFailedVideos();
    if (all.length === 0) return [];

    const qLower = query.toLowerCase().trim();
    if (!qLower) return [];

    const queryWords = qLower.split(/\s+/).filter(w => w.length >= 2);

    const scored = all
        .map(video => {
            const titleLower = String(video.title || '').toLowerCase();
            const hasExact = titleLower.includes(qLower);
            let matchCount = 0;
            if (queryWords.length > 0) {
                matchCount = queryWords.filter(w => titleLower.includes(w)).length;
            }
            const wordScore = queryWords.length > 0 ? matchCount / queryWords.length : 0;
            const score = (hasExact ? 0.7 : 0) + (wordScore * 0.5);
            return { video, score };
        })
        .filter(({ score }) => score > 0.2)
        .sort((a, b) => b.score - a.score);

    return scored.map(s => s.video);
}

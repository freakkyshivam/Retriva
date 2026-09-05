import { getQueryEmbedding } from './embedding.service.js';
import { qdrant } from '../config/qdrant.js';
import { searchFailedVideos } from './failed.service.js';

const COLLECTION_NAME = 'striver_dsa';

export interface Chunk {
    start: number;
    end: number;
    text: string;
    score: number;
    wordCount: number;
    chunkIndex: number;
    timestampUrl: string;
}

export interface VideoResult {
    videoId: string;
    title: string;
    url: string;
    bestScore: number;
    chunks: Chunk[];
    noTranscript?: boolean;
}

// Helper: calculate how many query words appear in a target string
function wordOverlap(query: string, target: string): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const targetLower = target.toLowerCase();
    if (queryWords.length === 0) return 0;
    const matches = queryWords.filter(word => targetLower.includes(word)).length;
    return matches / queryWords.length; // 0 to 1
}

// Helper: check if exact phrase appears
function hasExactPhrase(query: string, target: string): boolean {
    return target.toLowerCase().includes(query.toLowerCase().trim());
}

export const searchCourse = async (query: string): Promise<VideoResult[]> => {
    const vector = await getQueryEmbedding(query);
    
    const searchRes = await qdrant.query(COLLECTION_NAME, {
        query: vector,
        limit: 30, // fetch more candidates for reranking
        with_payload: true
    });
    
    const points = searchRes.points || (Array.isArray(searchRes) ? searchRes : []);

    // Score each point with hybrid formula
    const scoredPoints = points
        .filter(point => point.score >= 0.25) // lower threshold since we'll boost good matches
        .map(point => {
            const payload = point.payload as any;
            if (!payload) return null;

            const semanticScore = point.score;
            const titleOverlap = wordOverlap(query, payload.title || '');
            const textOverlap = wordOverlap(query, payload.text || '');
            const exactInTitle = hasExactPhrase(query, payload.title || '') ? 0.08 : 0;
            const exactInText = hasExactPhrase(query, payload.text || '') ? 0.05 : 0;

            const titleBoost = titleOverlap * 0.15;
            const keywordBoost = textOverlap * 0.10;

            const finalScore = semanticScore + titleBoost + keywordBoost + exactInTitle + exactInText;

            return { point, payload, finalScore };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => b.finalScore - a.finalScore);

    // Group by video
    const videoMap = new Map<string, VideoResult>();

    for (const { payload, finalScore } of scoredPoints) {
        const videoId = payload.videoId;
        if (!videoMap.has(videoId)) {
            videoMap.set(videoId, {
                videoId,
                title: payload.title,
                url: payload.url,
                bestScore: finalScore,
                chunks: []
            });
        }

        const videoInfo = videoMap.get(videoId)!;
        if (finalScore > videoInfo.bestScore) {
            videoInfo.bestScore = finalScore;
        }

        videoInfo.chunks.push({
            start: payload.start,
            end: payload.end,
            text: payload.text,
            score: finalScore,
            wordCount: payload.wordCount || 0,
            chunkIndex: payload.chunkIndex || 0,
            timestampUrl: `${payload.url}&t=${Math.floor(payload.start)}s`
        });
    }

    const videos = Array.from(videoMap.values());
    
    // Deduplicate nearby chunks within each video
    for (const video of videos) {
        video.chunks.sort((a, b) => b.score - a.score);
        
        const keptChunks: Chunk[] = [];
        for (const chunk of video.chunks) {
            const isNear = keptChunks.some(c => Math.abs(c.start - chunk.start) <= 30);
            if (!isNear) {
                keptChunks.push(chunk);
            }
            if (keptChunks.length >= 3) break;
        }
        
        keptChunks.sort((a, b) => a.start - b.start);
        video.chunks = keptChunks;
    }
    
    videos.sort((a, b) => b.bestScore - a.bestScore);
    
    const topVideos = videos.slice(0, 5);

    // Also find matching failed videos (no transcript available)
    try {
        const failedMatches = await searchFailedVideos(query);
        const existingIds = new Set(topVideos.map(v => v.videoId));

        for (const fv of failedMatches) {
            if (existingIds.has(fv.video_id)) continue;
            topVideos.push({
                videoId: fv.video_id,
                title: fv.title,
                url: fv.url,
                bestScore: 0,
                chunks: [],
                noTranscript: true
            });
            if (topVideos.length >= 8) break;
        }
    } catch (err) {
        // Non-critical: don't break search if failed.json can't be read
        console.warn('Failed video lookup error:', err);
    }

    return topVideos;
};

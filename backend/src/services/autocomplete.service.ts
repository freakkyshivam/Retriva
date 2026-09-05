import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFailedVideos } from './failed.service.js';

interface VideoInfo {
    title: string;
    videoId: string;
    url: string;
    position: number;
    noTranscript?: boolean;
}

let videoCache: VideoInfo[] | null = null;
const CHUNKS_DIR = fileURLToPath(new URL('../../data/chunks', import.meta.url));

export const getAutocompleteSuggestions = async (query: string): Promise<VideoInfo[]> => {
    if (!videoCache) {
        videoCache = [];
        try {
            // Load videos with transcripts
            const files = await fs.readdir(CHUNKS_DIR);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            
            for (const file of jsonFiles) {
                try {
                    const content = await fs.readFile(path.join(CHUNKS_DIR, file), 'utf-8');
                    const data = JSON.parse(content);
                    const title = String(data.title || '').trim();
                    if (title) {
                        videoCache.push({
                            title,
                            videoId: String(data.video_id || ''),
                            url: String(data.url || ''),
                            position: Number(data.position) || 0
                        });
                    }
                } catch (e) {
                    console.warn(`Failed reading chunk file: ${file}`, e);
                }
            }

            // Also load failed videos (no transcript)
            const failedVideos = await getFailedVideos();
            for (const fv of failedVideos) {
                const title = String(fv.title || '').trim();
                // Filter out bogus titles like single digits if any
                if (title && title.length > 2) {
                    videoCache.push({
                        title,
                        videoId: fv.video_id,
                        url: fv.url,
                        position: fv.position,
                        noTranscript: true
                    });
                }
            }

            videoCache.sort((a, b) => a.position - b.position);
        } catch (err) {
            console.error('Error loading video cache in autocomplete:', err);
            return [];
        }
    }
    
    const qLower = query.toLowerCase().trim();
    if (!qLower) return [];
    
    const matches = videoCache.filter(v => {
        const titleStr = String(v.title || '').toLowerCase();
        return titleStr.includes(qLower);
    });
    
    matches.sort((a, b) => {
        const aTitle = String(a.title || '').toLowerCase();
        const bTitle = String(b.title || '').toLowerCase();
        const aStartsWord = aTitle.startsWith(qLower) || aTitle.includes(` ${qLower}`);
        const bStartsWord = bTitle.startsWith(qLower) || bTitle.includes(` ${qLower}`);
        
        if (aStartsWord && !bStartsWord) return -1;
        if (!aStartsWord && bStartsWord) return 1;
        
        // Prefer videos with transcripts
        if (!a.noTranscript && b.noTranscript) return -1;
        if (a.noTranscript && !b.noTranscript) return 1;

        return a.position - b.position;
    });
    
    return matches.slice(0, 10);
};

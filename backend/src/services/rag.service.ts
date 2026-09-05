import { searchCourse } from './search.service.js';
import { groq, GROQ_MODEL } from '../config/groq.js';

export interface AskResult {
    answer: string;
    sources: Array<{
        title: string;
        videoId: string;
        start: number;
        end: number;
        url: string;
        timestampUrl: string;
    }>;
}

function formatTimestamp(seconds: number): string {
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

export const askQuestion = async (question: string): Promise<AskResult> => {
    const videos = await searchCourse(question);

    if (videos.length === 0) {
        return {
            answer: "No relevant content found in the course for this question. Try rephrasing or using different keywords.",
            sources: []
        };
    }

    const sources: AskResult['sources'] = [];
    let transcriptContext = '';

    for (const video of videos) {
        sources.push({
            title: video.title,
            videoId: video.videoId,
            start: video.chunks[0]?.start || 0,
            end: video.chunks[0]?.end || 0,
            url: video.url,
            timestampUrl: video.chunks[0]?.timestampUrl || video.url
        });

        if (video.noTranscript) {
            transcriptContext += `Video: ${video.title}\nNote: Transcript is not available for this video, but it is part of the course playlist at ${video.url}.\n\n`;
        }

        for (const chunk of video.chunks) {
            const startTs = formatTimestamp(chunk.start);
            const endTs = formatTimestamp(chunk.end);
            transcriptContext += `Video: ${video.title} (Timestamp: ${startTs} - ${endTs})\nExcerpt: ${chunk.text}\n\n`;
        }
    }

    // If GROQ_API_KEY is configured, synthesize answer using Groq LLM
    if (process.env.GROQ_API_KEY) {
        try {
            const modelToUse = process.env.GROQ_MODEL || GROQ_MODEL;
            const systemPrompt = `You are a DSA Course Learning Assistant helping students understand concepts from Striver's A2Z DSA Course.
Your goal is to provide a clear, accurate, and concise explanation answering the student's question based strictly on the provided video transcripts.
Rules:
1. Ground your explanation in the provided transcripts.
2. Directly answer the question first, then explain the concept step-by-step.
3. Explicitly reference the relevant video title and timestamp when explaining key points.
4. If the provided context does not contain sufficient details to answer, state clearly what is covered and what isn't.
5. Format your output cleanly with markdown (bullet points, bold key terms, code blocks if appropriate).`;

            const userPrompt = `Student Question: ${question}

Course Transcript Context:
${transcriptContext}

Please explain the answer clearly and cite the relevant video timestamps:`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: modelToUse,
                temperature: 0.2,
                max_tokens: 1024,
            });

            const aiAnswer = chatCompletion.choices[0]?.message?.content;
            if (aiAnswer && aiAnswer.trim().length > 0) {
                return {
                    answer: aiAnswer,
                    sources
                };
            }
        } catch (err: unknown) {
            console.error("Groq API error:", err);
            // Graceful fallback to formatted transcript excerpts if model call fails
        }
    }

    // Fallback directly to course transcript excerpts
    let fallbackAnswer = '';
    for (const video of videos) {
        fallbackAnswer += `📹 ${video.title}\n`;
        fallbackAnswer += `   Match Score: ${(video.bestScore * 100).toFixed(0)}%\n\n`;

        if (video.noTranscript) {
            fallbackAnswer += `⚠️ Transcript is not available for this lecture, but you can watch it here: ${video.url}\n\n`;
        }

        for (const chunk of video.chunks) {
            const startTs = formatTimestamp(chunk.start);
            const endTs = formatTimestamp(chunk.end);
            fallbackAnswer += `⏱ ${startTs} → ${endTs}\n`;
            fallbackAnswer += `${chunk.text}\n\n`;
        }
        fallbackAnswer += '---\n\n';
    }

    return {
        answer: fallbackAnswer.trim(),
        sources
    };
};

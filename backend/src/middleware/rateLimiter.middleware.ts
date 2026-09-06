import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Retriva Production-Friendly Rate Limiting Configuration
 * 
 * Endpoints protected:
 * 1. Semantic / Vector Search (/api/search):
 *    - Triggers local 384-dim HuggingFace embedding extraction + Qdrant Cloud vector search.
 *    - Default: 30 requests per minute per IP (configurable via RATE_LIMIT_SEARCH_MAX & RATE_LIMIT_SEARCH_WINDOW_MS).
 * 
 * 2. LLM / RAG Answer Synthesis (/api/ask):
 *    - Triggers vector retrieval + Groq LLM inference (openai/gpt-oss-120b).
 *    - High cost/quota impact.
 *    - Default: 10 requests per minute per IP (configurable via RATE_LIMIT_ASK_MAX & RATE_LIMIT_ASK_WINDOW_MS).
 * 
 * 3. Autocomplete Suggestions (/api/autocomplete):
 *    - In-memory title search triggered on keystrokes.
 *    - Default: 60 requests per minute per IP (configurable via RATE_LIMIT_AUTOCOMPLETE_MAX & RATE_LIMIT_AUTOCOMPLETE_WINDOW_MS).
 * 
 * 4. Global API Protection (/api/*):
 *    - General defense against brute-force DoS across all endpoints.
 *    - Default: 120 requests per minute per IP (configurable via RATE_LIMIT_GLOBAL_MAX & RATE_LIMIT_GLOBAL_WINDOW_MS).
 */

// Helper to create uniform, safe 429 error responses without leaking internal details
const createRateLimitResponse = (customMessage: string) => {
    return (req: Request, res: Response, _next: unknown, options: { statusCode: number; windowMs: number }) => {
        const retryAfterSeconds = Math.ceil(options.windowMs / 1000);
        res.status(options.statusCode).json({
            error: customMessage,
            retryAfter: retryAfterSeconds
        });
    };
};

/**
 * 1. Semantic / Vector Search Rate Limiter
 * Guards CPU-heavy embedding calculation and Qdrant cluster requests.
 */
export const searchRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_SEARCH_WINDOW_MS) || 60 * 1000, // 1 minute window
    max: Number(process.env.RATE_LIMIT_SEARCH_MAX) || 30, // 30 search requests per minute
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: false,  // Disable X-RateLimit-* legacy headers
    handler: createRateLimitResponse('Search rate limit exceeded. Please wait a moment before searching again.')
});

/**
 * 2. LLM / RAG Synthesis Rate Limiter
 * Guards Groq LLM API quota (tokens per minute / requests per minute) and Qdrant retrieval.
 */
export const askRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_ASK_WINDOW_MS) || 60 * 1000, // 1 minute window
    max: Number(process.env.RATE_LIMIT_ASK_MAX) || 10, // 10 AI questions per minute
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitResponse('AI Question limit exceeded. Please wait a moment before asking another question.')
});

/**
 * 3. Autocomplete Rate Limiter
 * Protects against fast repeated queries while permitting smooth debounced typing.
 */
export const autocompleteRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_AUTOCOMPLETE_WINDOW_MS) || 60 * 1000, // 1 minute window
    max: Number(process.env.RATE_LIMIT_AUTOCOMPLETE_MAX) || 60, // 60 autocomplete queries per minute
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitResponse('Autocomplete rate limit exceeded. Please slow down your typing.')
});

/**
 * 4. General Global Rate Limiter
 * Broad safety net applied to all incoming API traffic.
 */
export const globalApiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) || 60 * 1000, // 1 minute window
    max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 120, // 120 general requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitResponse('Too many requests. Please slow down and try again later.')
});

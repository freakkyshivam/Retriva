import 'dotenv/config';

/**
 * Centralized Resource & Validation Limits Configuration
 *
 * All values have safe production defaults and can be customized via environment variables.
 */
export const LIMITS = {
    // Search query parameters (GET /api/search)
    SEARCH_QUERY_MIN: 2,
    SEARCH_QUERY_MAX: Number(process.env.MAX_SEARCH_QUERY_LENGTH) || 500,

    // RAG question parameters (POST /api/ask)
    QUESTION_MIN: 5,
    QUESTION_MAX: Number(process.env.MAX_QUESTION_LENGTH) || 1000,

    // Autocomplete query parameters (GET /api/autocomplete)
    AUTOCOMPLETE_MIN: 1,
    AUTOCOMPLETE_MAX: Number(process.env.MAX_AUTOCOMPLETE_QUERY_LENGTH) || 100,

    // LLM output tokens (Groq chat completion)
    LLM_MAX_TOKENS: Number(process.env.LLM_MAX_TOKENS) || 1024,

    // LLM request timeout (Groq SDK client)
    LLM_TIMEOUT_MS: Number(process.env.LLM_TIMEOUT_MS) || 15000,

    // HTTP request processing timeout
    REQUEST_TIMEOUT_MS: Number(process.env.REQUEST_TIMEOUT_MS) || 20000,

    // Express JSON request body size limit
    JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || '10kb',
};

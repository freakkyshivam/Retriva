import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/search.routes.js';
import askRoutes from './routes/ask.routes.js';
import autocompleteRoutes from './routes/autocomplete.routes.js';
import authRoutes from './routes/auth.routes.js';
import {
    globalApiLimiter,
    searchRateLimiter,
    askRateLimiter,
    autocompleteRateLimiter
} from './middleware/rateLimiter.middleware.js';
import { requestTimeout } from './middleware/timeout.middleware.js';
import { LIMITS } from './config/limits.js';

const app = express();

// Disable X-Powered-By header to prevent server technology fingerprinting
app.disable('x-powered-by');

// Trust reverse proxies (Render, Railway, Fly.io, Vercel) for accurate client IP detection
app.set('trust proxy', 1);

// Standard security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// Enforce request body size limit to prevent memory exhaustion / DoS
app.use(express.json({ limit: LIMITS.JSON_BODY_LIMIT }));

// Apply request processing timeout
app.use(requestTimeout(LIMITS.REQUEST_TIMEOUT_MS));

// CORS configuration with production support
app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : null;

    const origin = req.headers.origin;
    if (allowedOrigins && origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (!allowedOrigins) {
        // Permissive default for local development
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

app.get('/', (_req, res) => {
    res.json({ msg: 'Retriva DSA Course Intelligence API is running' });
});

// Global rate limiting across all API endpoints
app.use('/api', globalApiLimiter);

// Optional auth endpoints (preserved)
app.use('/api/auth', authRoutes);

// Publicly usable core endpoints protected by dedicated rate limiters
app.use('/api/search', searchRateLimiter, searchRoutes);
app.use('/api/ask', askRateLimiter, askRoutes);
app.use('/api/autocomplete', autocompleteRateLimiter, autocompleteRoutes);

// Catch 404 for undefined routes and respond with JSON (never raw HTML)
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler - guarantees no internal stack traces or database errors leak
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Malformed JSON payload handler from express.json()
    if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
        res.status(400).json({ error: 'Malformed JSON payload' });
        return;
    }

    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
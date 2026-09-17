import type { Request, Response, NextFunction } from 'express';

/**
 * Cloudflare Turnstile Server-Side Verification Middleware
 *
 * Validates the Turnstile token sent from the frontend via the `x-turnstile-token` header
 * by calling Cloudflare's siteverify API. Rejects requests with missing or invalid tokens
 * with a 403 Forbidden response.
 *
 * Required environment variable:
 *   TURNSTILE_SECRET_KEY - The secret key from your Cloudflare Turnstile dashboard.
 *
 * If TURNSTILE_SECRET_KEY is not configured, the middleware is bypassed (open access)
 * so local development works without Turnstile.
 */
export const verifyTurnstile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

    // If no secret key is configured, skip verification (dev mode)
    if (!secretKey) {
        return next();
    }

    // Extract the Turnstile token from the request header
    const token = (req.headers['x-turnstile-token'] as string | undefined)?.trim();

    if (!token) {
        res.status(403).json({ error: 'Verification required. Please complete the CAPTCHA challenge.' });
        return;
    }

    try {
        // Verify the token with Cloudflare's siteverify endpoint
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: secretKey,
                response: token,
                // Forward client IP for enhanced verification accuracy
                remoteip: req.ip,
            }),
        });

        const result = await verifyResponse.json() as { success: boolean };

        if (!result.success) {
            res.status(403).json({ error: 'Verification failed. Please try again.' });
            return;
        }

        // Token is valid — proceed to the next middleware / route handler
        next();
    } catch (error) {
        console.error('Turnstile verification error:', error);
        // Fail closed — reject the request if Cloudflare is unreachable
        res.status(500).json({ error: 'Verification service unavailable. Please try again later.' });
    }
};

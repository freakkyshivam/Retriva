import type { Request, Response, NextFunction } from 'express';

/**
 * Cloudflare Turnstile Server-Side Verification Middleware
 *
 * Validates the `cf-turnstile-response` token sent from the frontend
 * by calling Cloudflare's canonical siteverify endpoint. Gates protected
 * routes — the existing handler logic runs only after verification passes.
 *
 * Environment variables:
 *   TURNSTILE_SECRET      – Secret key from the Cloudflare Turnstile dashboard (required in production).
 *   TURNSTILE_HOSTNAMES   – Comma-separated allowlist of frontend hostnames (required in production).
 *
 * If TURNSTILE_SECRET is not configured, the middleware is bypassed so local
 * development works without Turnstile.
 *
 * Canonical reference: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

/**
 * Creates a Turnstile verification middleware for a specific action surface.
 * Each protected route should use its own action (e.g. "search", "ask") so the
 * backend can confirm the token was issued for the intended surface.
 */
export function verifyTurnstile(expectedAction: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const secret = process.env.TURNSTILE_SECRET?.trim();

        // If no secret is configured, skip verification (dev mode / open access)
        if (!secret) {
            return next();
        }

        // Build the hostname allowlist from TURNSTILE_HOSTNAMES env var
        const expectedHostnames = new Set(
            (process.env.TURNSTILE_HOSTNAMES ?? '')
                .split(',')
                .map((h) => h.trim())
                .filter(Boolean),
        );

        // Extract the Turnstile token from the request header
        const token = (req.headers['x-turnstile-token'] as string | undefined)?.trim();

        // Guard: token must be present, non-empty, and ≤ 2048 chars
        if (
            typeof token !== 'string' ||
            token.length === 0 ||
            token.length > 2048 ||
            expectedHostnames.size === 0
        ) {
            res.status(403).json({ error: 'Verification required. Please complete the CAPTCHA challenge.' });
            return;
        }

        let result: {
            success: boolean;
            action?: string;
            hostname?: string;
            'error-codes'?: string[];
        };

        try {
            // Canonical siteverify call using application/x-www-form-urlencoded
            const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                signal: AbortSignal.timeout(10_000),
                body: new URLSearchParams({
                    secret,
                    response: token,
                    remoteip: req.ip ?? '',
                }),
            });

            if (!r.ok) throw new Error(`siteverify ${r.status}`);
            result = await r.json() as typeof result;
        } catch {
            // Fail closed — reject the request if Cloudflare is unreachable
            res.status(403).json({ error: 'Verification service unavailable. Please try again later.' });
            return;
        }

        // Validate success, action, and hostname per canonical Turnstile contract
        if (
            !result.success ||
            result.action !== expectedAction ||
            !result.hostname ||
            !expectedHostnames.has(result.hostname)
        ) {
            res.status(403).json({ error: 'Verification failed. Please try again.' });
            return;
        }

        // Token is valid — proceed to the next middleware / route handler
        next();
    };
}

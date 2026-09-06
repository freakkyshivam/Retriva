import type { Request, Response, NextFunction } from 'express';
import { LIMITS } from '../config/limits.js';

/**
 * Request Timeout Middleware
 *
 * Aborts hanging requests after LIMITS.REQUEST_TIMEOUT_MS milliseconds with HTTP 504 Gateway Timeout.
 * Ensures server resources and sockets are never held indefinitely by slow network or hanging queries.
 */
export const requestTimeout = (timeoutMs: number = LIMITS.REQUEST_TIMEOUT_MS) => {
    return (_req: Request, res: Response, next: NextFunction): void => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(504).json({
                    error: 'Request timed out. Please try again with a shorter query.'
                });
            }
        }, timeoutMs);

        // Clear timer once request finishes or socket closes
        res.on('finish', () => clearTimeout(timer));
        res.on('close', () => clearTimeout(timer));

        next();
    };
};

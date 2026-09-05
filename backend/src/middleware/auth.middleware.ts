import type { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const accessPassword = process.env.ACCESS_PASSWORD?.trim();
    
    // If no password configured in .env, open access (dev mode)
    if (!accessPassword) {
        return next();
    }

    const token = (
        req.headers['x-access-token'] || 
        req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
        req.query['token']
    ) as string | undefined;

    if (!token || token.trim() !== accessPassword) {
        res.status(401).json({ 
            error: 'Unauthorized: Valid access passcode required.' 
        });
        return;
    }

    next();
};

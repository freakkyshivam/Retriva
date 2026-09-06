import type { Request, Response } from 'express';
import { searchCourse } from '../services/search.service.js';
import { LIMITS } from '../config/limits.js';

export const searchHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const rawQ = req.query.q;

        if (typeof rawQ !== 'string') {
            res.status(400).json({ error: 'Query parameter "q" must be a single string' });
            return;
        }

        const q = rawQ.trim();
        if (q.length < LIMITS.SEARCH_QUERY_MIN || q.length > LIMITS.SEARCH_QUERY_MAX) {
            res.status(400).json({
                error: `Query must be between ${LIMITS.SEARCH_QUERY_MIN} and ${LIMITS.SEARCH_QUERY_MAX} characters`
            });
            return;
        }

        const results = await searchCourse(q);
        res.json({ query: q, results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


import type { Request, Response } from 'express';
import { searchCourse } from '../services/search.service.js';

export const searchHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.query.q as string;
        if (!q || q.length < 2 || q.length > 500) {
            res.status(400).json({ error: 'Query must be between 2 and 500 characters' });
            return;
        }

        const results = await searchCourse(q);
        res.json({ query: q, results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

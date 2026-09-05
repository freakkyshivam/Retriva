import type { Request, Response } from 'express';
import { getAutocompleteSuggestions } from '../services/autocomplete.service.js';

export const getAutocomplete = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query.q as string;
        if (!query || query.length < 1) {
            res.status(400).json({ error: 'Query parameter "q" is required and must be at least 1 character long.' });
            return;
        }

        const suggestions = await getAutocompleteSuggestions(query);
        res.json({ suggestions });
    } catch (error) {
        console.error('Error in autocomplete controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

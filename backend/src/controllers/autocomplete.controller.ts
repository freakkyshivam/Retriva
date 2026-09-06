import type { Request, Response } from 'express';
import { getAutocompleteSuggestions } from '../services/autocomplete.service.js';
import { LIMITS } from '../config/limits.js';

export const getAutocomplete = async (req: Request, res: Response): Promise<void> => {
    try {
        const rawQ = req.query.q;

        if (typeof rawQ !== 'string') {
            res.status(400).json({ error: 'Query parameter "q" must be a single string' });
            return;
        }

        const query = rawQ.trim();
        if (query.length < LIMITS.AUTOCOMPLETE_MIN || query.length > LIMITS.AUTOCOMPLETE_MAX) {
            res.status(400).json({
                error: `Query parameter "q" must be between ${LIMITS.AUTOCOMPLETE_MIN} and ${LIMITS.AUTOCOMPLETE_MAX} characters`
            });
            return;
        }

        const suggestions = await getAutocompleteSuggestions(query);
        res.json({ suggestions });
    } catch (error) {
        console.error('Error in autocomplete controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


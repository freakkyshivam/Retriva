import type { Request, Response } from 'express';
import { askQuestion } from '../services/rag.service.js';

export const askHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { question } = req.body;
        if (!question || question.length < 5 || question.length > 1000) {
            res.status(400).json({ error: 'Question must be between 5 and 1000 characters' });
            return;
        }

        const result = await askQuestion(question);
        res.json({ question, ...result });
    } catch (error) {
        console.error('Ask error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

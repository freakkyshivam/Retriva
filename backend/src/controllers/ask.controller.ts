import type { Request, Response } from 'express';
import { askQuestion } from '../services/rag.service.js';
import { LIMITS } from '../config/limits.js';

export const askHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            res.status(400).json({ error: 'Request body must be a JSON object' });
            return;
        }

        const { question: rawQuestion } = req.body;
        if (typeof rawQuestion !== 'string') {
            res.status(400).json({ error: 'Field "question" is required and must be a string' });
            return;
        }

        const question = rawQuestion.trim();
        if (question.length < LIMITS.QUESTION_MIN || question.length > LIMITS.QUESTION_MAX) {
            res.status(400).json({
                error: `Question must be between ${LIMITS.QUESTION_MIN} and ${LIMITS.QUESTION_MAX} characters`
            });
            return;
        }

        const result = await askQuestion(question);
        res.json({ question, ...result });
    } catch (error) {
        console.error('Ask error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


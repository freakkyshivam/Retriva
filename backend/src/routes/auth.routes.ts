import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// Check if authentication is enabled on this instance
router.get('/status', (_req: Request, res: Response): void => {
    const isProtected = Boolean(process.env.ACCESS_PASSWORD && process.env.ACCESS_PASSWORD.trim().length > 0);
    res.json({ isProtected });
});

// Verify user provided passcode
router.post('/verify', (req: Request, res: Response): void => {
    const accessPassword = process.env.ACCESS_PASSWORD?.trim();

    // If not protected, always allow
    if (!accessPassword) {
        res.json({ valid: true, message: 'No passcode configured on server' });
        return;
    }

    const { password } = req.body || {};

    if (password && String(password).trim() === accessPassword) {
        res.json({ valid: true });
    } else {
        res.status(401).json({ valid: false, error: 'Incorrect access passcode' });
    }
});

export default router;

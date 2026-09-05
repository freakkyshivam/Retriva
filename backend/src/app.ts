import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/search.routes.js';
import askRoutes from './routes/ask.routes.js';
import autocompleteRoutes from './routes/autocomplete.routes.js';
import authRoutes from './routes/auth.routes.js';
import { requireAuth } from './middleware/auth.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

app.get('/', (req, res) => {
    res.json({ msg: 'DSA Course Intelligence API is running' });
});

// Public auth endpoints (check protection status, verify passcode)
app.use('/api/auth', authRoutes);

// Protected endpoints (require valid passcode if ACCESS_PASSWORD is configured)
app.use('/api/search', requireAuth, searchRoutes);
app.use('/api/ask', requireAuth, askRoutes);
app.use('/api/autocomplete', requireAuth, autocompleteRoutes);

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Something broke!' });
});

export default app;
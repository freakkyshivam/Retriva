import { Router } from 'express';
import { askHandler } from '../controllers/ask.controller.js';

const router = Router();

router.post('/', askHandler);

export default router;

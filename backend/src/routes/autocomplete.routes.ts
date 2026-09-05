import { Router } from 'express';
import { getAutocomplete } from '../controllers/autocomplete.controller.js';

const router = Router();

router.get('/', getAutocomplete);

export default router;

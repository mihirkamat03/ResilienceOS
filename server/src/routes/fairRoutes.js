import { Router } from 'express';
import { FairController } from '../controllers/fairController.js';

const router = Router();
router.post('/fair/calculate', FairController.calculate);

export default router;

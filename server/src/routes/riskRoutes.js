import { Router } from 'express';
import { RiskController } from '../controllers/riskController.js';

const router = Router();
router.get('/risks', RiskController.getRisks);

export default router;

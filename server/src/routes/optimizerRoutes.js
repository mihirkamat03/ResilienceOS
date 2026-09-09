import { Router } from 'express';
import { OptimizerController } from '../controllers/optimizerController.js';

const router = Router();
router.post('/optimizer/solve', OptimizerController.solve);

export default router;

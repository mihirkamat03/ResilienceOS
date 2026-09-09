import { Router } from 'express';
import { GraphController } from '../controllers/graphController.js';

const router = Router();
router.get('/graph/attack-paths', GraphController.getAttackPaths);
router.get('/graph/chokepoints', GraphController.getChokepoints);

export default router;

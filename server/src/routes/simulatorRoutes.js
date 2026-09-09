import { Router } from 'express';
import { SimulatorController } from '../controllers/simulatorController.js';

const router = Router();
router.get('/simulator/scenarios', SimulatorController.getScenarios);
router.post('/simulator/simulate', SimulatorController.simulate);

export default router;

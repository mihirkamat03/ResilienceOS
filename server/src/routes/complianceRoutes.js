import { Router } from 'express';
import { ComplianceController } from '../controllers/complianceController.js';

const router = Router();
router.get('/compliance/frameworks', ComplianceController.getFrameworks);

export default router;

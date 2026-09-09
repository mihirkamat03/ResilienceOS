import { Router } from 'express';
import { TelemetryController } from '../controllers/telemetryController.js';

const router = Router();
router.get('/telemetry/feeds', TelemetryController.getFeeds);
router.get('/telemetry/preset-events', TelemetryController.getPresetEvents);
router.post('/telemetry/ingest', TelemetryController.ingest);

export default router;

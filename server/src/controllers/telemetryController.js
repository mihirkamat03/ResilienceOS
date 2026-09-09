import { TelemetryService } from '../services/telemetryService.js';

export class TelemetryController {
  static getFeeds(req, res, next) {
    try {
      const feeds = TelemetryService.getFeeds();
      res.json({
        success: true,
        feeds
      });
    } catch (err) {
      next(err);
    }
  }

  static getPresetEvents(req, res, next) {
    try {
      const events = TelemetryService.getPresetEvents();
      res.json({
        success: true,
        events
      });
    } catch (err) {
      next(err);
    }
  }

  static ingest(req, res, next) {
    try {
      const result = TelemetryService.ingestEvent(req.body);
      res.json({
        success: true,
        result
      });
    } catch (err) {
      next(err);
    }
  }
}

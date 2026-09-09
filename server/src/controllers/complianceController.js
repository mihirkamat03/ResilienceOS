import { ComplianceService } from '../services/complianceService.js';

export class ComplianceController {
  static getFrameworks(req, res, next) {
    try {
      const frameworks = ComplianceService.getFrameworks(req.query);
      res.json({
        success: true,
        frameworks
      });
    } catch (err) {
      next(err);
    }
  }
}

import { FairService } from '../services/fairService.js';

export class RiskController {
  static getRisks(req, res, next) {
    try {
      const risks = FairService.getQuantifiedRisks();
      res.json({
        success: true,
        count: risks.length,
        risks,
        totalEAL: risks.reduce((sum, r) => sum + r.fairMetrics.expectedAnnualLoss, 0),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

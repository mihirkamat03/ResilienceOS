import { FairService } from '../services/fairService.js';
import { ApiError } from '../middleware/errorHandler.js';

export class FairController {
  static calculate(req, res, next) {
    try {
      const calculation = FairService.calculate(req.body);
      res.json({
        success: true,
        calculation
      });
    } catch (err) {
      next(err);
    }
  }
}

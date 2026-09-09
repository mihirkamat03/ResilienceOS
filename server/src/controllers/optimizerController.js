import { OptimizerService } from '../services/optimizerService.js';

export class OptimizerController {
  static solve(req, res, next) {
    try {
      const solution = OptimizerService.solve(req.body);
      res.json({
        success: true,
        solution
      });
    } catch (err) {
      next(err);
    }
  }
}

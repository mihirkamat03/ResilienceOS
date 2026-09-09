import { SimulatorService } from '../services/simulatorService.js';

export class SimulatorController {
  static getScenarios(req, res, next) {
    try {
      const scenarios = SimulatorService.getScenarios();
      res.json({
        success: true,
        scenarios
      });
    } catch (err) {
      next(err);
    }
  }

  static simulate(req, res, next) {
    try {
      const simulation = SimulatorService.simulate(req.body);
      res.json({
        success: true,
        simulation
      });
    } catch (err) {
      next(err);
    }
  }
}

import { GraphService } from '../services/graphService.js';

export class GraphController {
  static getAttackPaths(req, res, next) {
    try {
      const graphData = GraphService.getAttackPaths(req.query);
      res.json({
        success: true,
        graphData
      });
    } catch (err) {
      next(err);
    }
  }

  static getChokepoints(req, res, next) {
    try {
      const chokepointData = GraphService.getChokepoints(req.query);
      res.json({
        success: true,
        chokepointData
      });
    } catch (err) {
      next(err);
    }
  }
}

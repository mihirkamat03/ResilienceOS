import {
  solveSecurityBudgetOptimization,
  calculateROSI
} from '../../../src/core/optimizerEngine.js';
import { formatINR } from '../../../src/core/riskEngine.js';

import {
  INITIAL_INVESTMENTS,
  INITIAL_RISKS
} from '../../../src/data/initialData.js';

/**
 * Authoritative 0/1 Knapsack Security Investment Optimization Service
 */
export class OptimizerService {
  /**
   * Runs 0/1 Knapsack optimization to find mathematically optimal security controls
   * @param {Object} params - { budget: number, controls?: Array, baselineExposure?: number }
   */
  static solve(params = {}) {
    const budget = Number(params.budget) || 2000000; // Default ₹20 Lakhs
    const controls = Array.isArray(params.controls) && params.controls.length > 0 
      ? params.controls 
      : INITIAL_INVESTMENTS;
    const baselineExposure = Number(params.baselineExposure) || 15726000; // Default ₹1.57 Cr

    const result = solveSecurityBudgetOptimization(controls, budget, INITIAL_RISKS);
    const selected = result.selectedInvestments || [];
    const residualExposure = Math.max(0, baselineExposure - result.totalRiskReduction);

    return {
      budget,
      formattedBudget: formatINR(budget),
      baselineExposure,
      formattedBaselineExposure: formatINR(baselineExposure),
      selectedControls: selected,
      selectedCount: selected.length,
      totalCost: result.totalCost,
      formattedTotalCost: formatINR(result.totalCost),
      remainingBudget: result.remainingBudget,
      formattedRemainingBudget: formatINR(result.remainingBudget),
      budgetUtilizationPct: budget > 0 ? Math.round((result.totalCost / budget) * 100) : 0,
      totalRiskReduction: result.totalRiskReduction,
      formattedTotalRiskReduction: formatINR(result.totalRiskReduction),
      residualExposure,
      formattedResidualExposure: formatINR(residualExposure),
      rosi: result.portfolioROSI,
      solverMethod: result.solverMethod,
      unselectedControls: result.unselectedInvestments || [],
      assumptions: result.assumptions || [],
      timestamp: new Date().toISOString()
    };
  }
}

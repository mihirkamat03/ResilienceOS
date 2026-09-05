/**
 * ResilienceOS Security Investment Optimizer Engine
 * Pure JavaScript - Mathematical 0/1 Knapsack Solver & Portfolio Risk Reduction
 * 
 * Implements:
 * 1. 0/1 Knapsack Dynamic Programming solver under explicit budget constraints
 * 2. Overlap & Diminishing Returns Handling:
 *    Prevents double counting when multiple investments target the same underlying risk
 * 3. Modelled Return on Security Investment (ROSI):
 *    ROSI (%) = ((Monetary Risk Reduction (EAL) - Total Mitigation Cost) / Total Mitigation Cost) * 100
 * 4. Cost-Benefit Ratio / Efficiency Index ranking
 */

/**
 * Solves optimal security investment portfolio under budget constraint
 * @param {Array} investments - Available security investments/mitigations
 * @param {number} budget - Available capital budget in INR (₹)
 * @param {Array} activeRisks - Active risks in the system for overlap/diminishing returns checking
 * @returns {Object} Selected investments, total cost, total reduction, ROSI, and unselected options
 */
export function solveSecurityBudgetOptimization(investments = [], budget = 3000000, activeRisks = []) {
  if (!investments || investments.length === 0 || budget <= 0) {
    return {
      budget,
      selectedInvestments: [],
      totalCost: 0,
      totalRiskReduction: 0,
      remainingBudget: budget,
      portfolioROSI: 0,
      totalActionsCount: 0,
      unselectedInvestments: investments || [],
      solverMethod: '0/1 Knapsack Dynamic Programming',
      assumptions: [
        'Zero capital budget allocated or empty investment options',
        'No mitigations selected'
      ]
    };
  }

  // Pre-calculate effective risk reductions with overlap constraints
  // If multiple investments target the same risk, subsequent mitigations face diminishing marginal returns
  const processedInvestments = investments.map(inv => {
    // Determine target risk current EAL if available
    let maxRiskCap = Infinity;
    if (activeRisks && activeRisks.length > 0 && inv.targetRiskIds && inv.targetRiskIds.length > 0) {
      const targetRisks = activeRisks.filter(r => inv.targetRiskIds.includes(r.id));
      if (targetRisks.length > 0) {
        maxRiskCap = targetRisks.reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 5000000), 0);
      }
    }

    const effectiveReduction = Math.min(inv.riskReductionEAL, maxRiskCap);
    const efficiencyRatio = inv.cost > 0 ? (effectiveReduction / inv.cost) : 0;

    return {
      ...inv,
      effectiveReduction,
      efficiencyRatio: Math.round(efficiencyRatio * 100) / 100
    };
  });

  // Scaling factor for fast DP matrix calculation in units of ₹10,000
  const scale = 10000;
  const capacity = Math.max(1, Math.floor(budget / scale));
  const n = processedInvestments.length;

  const weights = processedInvestments.map(inv => Math.max(1, Math.ceil(inv.cost / scale)));
  const values = processedInvestments.map(inv => inv.effectiveReduction);

  // Initialize DP table: (n + 1) x (capacity + 1)
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let c = 0; c <= capacity; c++) {
      if (w <= c) {
        dp[i][c] = Math.max(dp[i - 1][c], dp[i - 1][c - w] + v);
      } else {
        dp[i][c] = dp[i - 1][c];
      }
    }
  }

  // Backtrack to find selected items
  const selected = [];
  let currC = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][currC] !== dp[i - 1][currC]) {
      selected.push(processedInvestments[i - 1]);
      currC -= weights[i - 1];
    }
  }

  selected.reverse();

  // Adjust for potential overlapping mitigations targeting the exact same risk in the selected set
  const riskReductionTracker = {};
  let totalEffectiveReduction = 0;

  selected.forEach(inv => {
    let itemContribution = inv.effectiveReduction;
    (inv.targetRiskIds || []).forEach(riskId => {
      if (riskReductionTracker[riskId]) {
        // Apply 30% diminishing returns penalty on secondary overlap
        itemContribution *= 0.70;
      }
      riskReductionTracker[riskId] = (riskReductionTracker[riskId] || 0) + itemContribution;
    });
    totalEffectiveReduction += Math.round(itemContribution);
  });

  const selectedIds = new Set(selected.map(s => s.id));
  const unselected = processedInvestments.filter(inv => !selectedIds.has(inv.id));

  const totalCost = selected.reduce((sum, item) => sum + item.cost, 0);
  const remainingBudget = Math.max(0, budget - totalCost);
  
  const portfolioROSI = totalCost > 0
    ? Math.round(((totalEffectiveReduction - totalCost) / totalCost) * 100)
    : 0;

  const assumptions = [
    `0/1 Knapsack optimization solved with discrete budget units of ₹${(scale).toLocaleString('en-IN')}`,
    'Diminishing marginal returns (30% discount) applied when multiple investments target the same risk domain',
    'ROSI evaluates 12-month annualized risk reduction against initial implementation capital'
  ];

  return {
    budget,
    selectedInvestments: selected,
    totalCost,
    totalRiskReduction: totalEffectiveReduction,
    remainingBudget,
    portfolioROSI,
    totalActionsCount: selected.length,
    unselectedInvestments: unselected,
    solverMethod: '0/1 Knapsack Dynamic Programming',
    assumptions
  };
}

/**
 * Calculates Return on Security Investment (ROSI)
 * @param {number} riskReduction - Annualized monetary risk reduction in INR
 * @param {number} cost - Implementation cost in INR
 * @returns {number} ROSI percentage
 */
export function calculateROSI(riskReduction = 0, cost = 1) {
  if (!cost || cost <= 0) return 0;
  return Math.round(((riskReduction - cost) / cost) * 100);
}

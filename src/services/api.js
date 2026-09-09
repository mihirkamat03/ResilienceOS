/**
 * ResilienceOS Authoritative API Client & Hybrid Execution Layer
 * 
 * Implements Backend-First Execution with Graceful Local In-Browser Fallback:
 * - Attempts to call the authoritative Node.js Decision Engine backend first (VITE_API_BASE_URL)
 * - If the backend is unavailable, unreachable, or times out (>2s), it falls back seamlessly
 *   to the verified local mathematical engines (src/core/*)
 * - Ensures 100% zero-latency demo resilience during SIH evaluations without mutating business logic
 */

import {
  computeFAIRRiskMetrics,
  calculateLossBreakdown,
  calculateContextualRiskScore,
  formatINR
} from '../core/riskEngine.js';

import {
  solveSecurityBudgetOptimization,
  calculateROSI
} from '../core/optimizerEngine.js';

import {
  computeGraphState,
  getAssetAttackPath,
  getAssetBlastRadius
} from '../core/graphEngine.js';

import {
  processTelemetryEvent,
  TELEMETRY_FEEDS_CONFIG,
  PRESET_TELEMETRY_EVENTS
} from '../core/telemetryEngine.js';

import {
  FRAMEWORKS,
  calculateFrameworkSummaries,
  getPrioritizedComplianceGaps
} from '../core/complianceEngine.js';

import {
  INITIAL_ASSETS,
  INITIAL_RISKS,
  INITIAL_VULNERABILITIES,
  INITIAL_INVESTMENTS,
  INITIAL_COMPLIANCE_CONTROLS,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_REMEDIATIONS
} from '../data/initialData.js';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:5000/api';

// Connection status cache
let isBackendConnected = null;
let lastConnectionCheck = 0;
const CHECK_INTERVAL_MS = 15000; // Check health at most every 15 seconds

/**
 * Executes a network fetch with a strict timeout to ensure zero UI freezing
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    isBackendConnected = true;
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    isBackendConnected = false;
    throw err;
  }
}

export const ResilienceAPI = {
  baseUrl: API_BASE_URL,

  /**
   * Checks if the backend decision engine is currently reachable
   */
  async checkHealth() {
    const now = Date.now();
    if (isBackendConnected !== null && (now - lastConnectionCheck < CHECK_INTERVAL_MS)) {
      return isBackendConnected;
    }

    try {
      const data = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 1500);
      isBackendConnected = data.success === true;
      lastConnectionCheck = now;
      return isBackendConnected;
    } catch {
      isBackendConnected = false;
      lastConnectionCheck = now;
      return false;
    }
  },

  get isOnline() {
    return isBackendConnected;
  },

  /**
   * Retrieves active quantified risks (Backend-first with local fallback)
   */
  async getRisks() {
    try {
      const result = await fetchWithTimeout(`${API_BASE_URL}/risks`);
      return {
        source: 'BACKEND_API',
        risks: result.risks,
        totalEAL: result.totalEAL
      };
    } catch (err) {
      // Local fallback calculation using identical verified logic
      const fallbackRisks = INITIAL_RISKS.map(risk => {
        const asset = INITIAL_ASSETS.find(a => a.id === risk.assetId) || {};
        const vuln = INITIAL_VULNERABILITIES.find(v => v.id === risk.vulnId) || {};
        const fairMetrics = computeFAIRRiskMetrics(asset, vuln);
        return {
          ...risk,
          assetName: asset.name || risk.assetName,
          fairMetrics,
          formattedEAL: formatINR(fairMetrics.expectedAnnualLoss),
          formattedSLE: formatINR(fairMetrics.singleLossExpectancy)
        };
      });

      return {
        source: 'LOCAL_FALLBACK',
        risks: fallbackRisks,
        totalEAL: fallbackRisks.reduce((sum, r) => sum + r.fairMetrics.expectedAnnualLoss, 0)
      };
    }
  },

  /**
   * Solves 0/1 Knapsack optimal investment portfolio (Backend-first with local fallback)
   */
  async solveOptimizer(budget, controls, baselineExposure) {
    try {
      const result = await fetchWithTimeout(`${API_BASE_URL}/optimizer/solve`, {
        method: 'POST',
        body: JSON.stringify({ budget, controls, baselineExposure })
      });
      return {
        source: 'BACKEND_API',
        ...result.solution
      };
    } catch (err) {
      const targetControls = controls || INITIAL_INVESTMENTS;
      const targetBudget = budget || 2000000;
      const targetBaseline = baselineExposure || 15726000;
      const localResult = solveSecurityBudgetOptimization(targetControls, targetBudget, INITIAL_RISKS);
      const selected = localResult.selectedInvestments || [];
      const residual = Math.max(0, targetBaseline - localResult.totalRiskReduction);

      return {
        source: 'LOCAL_FALLBACK',
        budget: targetBudget,
        selectedControls: selected,
        selectedCount: selected.length,
        totalCost: localResult.totalCost,
        remainingBudget: localResult.remainingBudget,
        totalRiskReduction: localResult.totalRiskReduction,
        residualExposure: residual,
        rosi: localResult.portfolioROSI,
        solverMethod: localResult.solverMethod
      };
    }
  },

  /**
   * Computes Attack Graph Topology & Traversal Paths (Backend-first with local fallback)
   */
  async getAttackPaths(assets, risks) {
    try {
      const result = await fetchWithTimeout(`${API_BASE_URL}/graph/attack-paths`);
      return {
        source: 'BACKEND_API',
        ...result.graphData
      };
    } catch (err) {
      const targetAssets = assets || INITIAL_ASSETS;
      const targetRisks = risks || INITIAL_RISKS;
      const localGraph = computeGraphState(targetAssets, targetRisks);

      return {
        source: 'LOCAL_FALLBACK',
        ...localGraph
      };
    }
  },

  /**
   * Ingests a telemetry finding event (Backend-first with local fallback)
   */
  async ingestTelemetry(eventKey, currentState) {
    try {
      const result = await fetchWithTimeout(`${API_BASE_URL}/telemetry/ingest`, {
        method: 'POST',
        body: JSON.stringify({ eventKey, state: currentState })
      });
      return {
        source: 'BACKEND_API',
        ...result.result
      };
    } catch (err) {
      const targetEvent = PRESET_TELEMETRY_EVENTS[eventKey] || PRESET_TELEMETRY_EVENTS.EVENT_A_CRITICAL_VULN;
      const localProcessed = processTelemetryEvent(targetEvent, currentState);

      return {
        source: 'LOCAL_FALLBACK',
        processed: true,
        event: targetEvent,
        deltaExposureINR: localProcessed.deltaExposureINR,
        formattedDeltaExposure: formatINR(localProcessed.deltaExposureINR),
        logDescription: localProcessed.logDescription
      };
    }
  },

  /**
   * Retrieves regulatory framework compliance coverage (Backend-first with local fallback)
   */
  async getComplianceFrameworks(controls, evidence) {
    try {
      const result = await fetchWithTimeout(`${API_BASE_URL}/compliance/frameworks`);
      return {
        source: 'BACKEND_API',
        ...result.frameworks
      };
    } catch (err) {
      const targetControls = controls || INITIAL_COMPLIANCE_CONTROLS;
      const targetEvidence = evidence || INITIAL_EVIDENCE_RECORDS;
      const summaries = calculateFrameworkSummaries(targetControls, targetEvidence);

      return {
        source: 'LOCAL_FALLBACK',
        frameworks: FRAMEWORKS,
        summaries
      };
    }
  }
};

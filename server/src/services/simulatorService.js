import {
  computeFAIRRiskMetrics,
  formatINR
} from '../../../src/core/riskEngine.js';

import {
  INITIAL_ASSETS,
  INITIAL_RISKS,
  INITIAL_VULNERABILITIES
} from '../../../src/data/initialData.js';

export const PRECONFIGURED_SCENARIOS = [
  {
    id: 'SCENARIO_MFA',
    name: 'Enforce FIDO2 Hardware MFA & PAM on Database',
    targetAssetId: 'AST-DB-01',
    targetVulnId: 'VULN-2023-39417',
    category: 'Mitigation',
    cost: 800000,
    description: 'Deploy just-in-time privileged access vaulting on Core Banking DB and mandate hardware security keys.',
    modifiers: {
      targetControlName: 'Privileged Access Management (PAM)',
      targetEffectiveness: 0.95
    }
  },
  {
    id: 'SCENARIO_DELAY_PATCH',
    name: 'Delay Emergency PAN-OS Patch by 30 Days',
    targetAssetId: 'AST-GW-01',
    targetVulnId: 'VULN-2024-3400',
    category: 'Operational Delay',
    cost: 0,
    description: 'Simulate business exposure if patching CVE-2024-3400 is postponed due to change-freeze windows.',
    modifiers: {
      patchDelayDays: 30
    }
  },
  {
    id: 'SCENARIO_MICROSEG',
    name: 'Implement Kubernetes Cilium eBPF Microsegmentation',
    targetAssetId: 'AST-K8S-01',
    targetVulnId: 'VULN-2023-5043',
    category: 'Architecture Shift',
    cost: 500000,
    description: 'Isolate ingress pods and block lateral east-west traversal between payment services and database tiers.',
    modifiers: {
      targetControlName: 'Kubernetes Network Policies',
      targetEffectiveness: 0.92
    }
  },
  {
    id: 'SCENARIO_BACKUP',
    name: 'Air-Gapped Immutable Backups & Rapid DR',
    targetAssetId: 'AST-DB-01',
    targetVulnId: 'VULN-2023-39417',
    category: 'Resilience',
    cost: 700000,
    description: 'Enforce AWS WORM storage lock to cap maximum downtime loss during a database incident.',
    modifiers: {
      targetControlName: 'Immutable Air-Gapped Backups',
      targetEffectiveness: 0.90
    }
  }
];

/**
 * Deterministic What-If Sensitivity Simulation Service
 */
export class SimulatorService {
  /**
   * Returns all available scenario templates
   */
  static getScenarios() {
    return PRECONFIGURED_SCENARIOS;
  }

  /**
   * Executes deterministic sensitivity analysis for a scenario and custom modifiers
   * @param {Object} params - { scenarioId, customPatchDelayDays, customControlEff, customWafActive, totalBaselineExposure }
   */
  static simulate(params = {}) {
    const {
      scenarioId = 'SCENARIO_MFA',
      customPatchDelayDays = 0,
      customControlEff = 75,
      customWafActive = true,
      totalBaselineExposure = 15726000 // Default ₹1.57 Cr baseline
    } = params;

    const scenarioDef = PRECONFIGURED_SCENARIOS.find(s => s.id === scenarioId) || PRECONFIGURED_SCENARIOS[0];

    const targetAsset = INITIAL_ASSETS.find(a => a.id === scenarioDef.targetAssetId) || INITIAL_ASSETS[0];
    const targetVuln = INITIAL_VULNERABILITIES.find(v => v.id === scenarioDef.targetVulnId) || INITIAL_VULNERABILITIES[0];

    // 1. Baseline calculation from live engine
    const baselineMetrics = computeFAIRRiskMetrics(targetAsset, targetVuln);
    const baselineEAL = baselineMetrics.expectedAnnualLoss;

    // 2. Combined modifiers from scenario + custom sensitivity parameters
    const combinedModifiers = {
      ...scenarioDef.modifiers,
      patchDelayDays: (scenarioDef.modifiers.patchDelayDays || 0) + Number(customPatchDelayDays || 0),
      globalControlEffTarget: Number(customControlEff || 75),
      wafActive: Boolean(customWafActive)
    };

    // 3. Simulated calculation from live engine
    const simulatedMetrics = computeFAIRRiskMetrics(targetAsset, targetVuln, combinedModifiers);
    const simulatedEAL = simulatedMetrics.expectedAnnualLoss;

    const riskDelta = baselineEAL - simulatedEAL; // Positive = Risk Reduced; Negative = Risk Increased
    const projectedTotalExposure = Math.max(0, totalBaselineExposure - riskDelta);

    return {
      scenario: {
        id: scenarioDef.id,
        name: scenarioDef.name,
        category: scenarioDef.category,
        description: scenarioDef.description,
        targetAsset: { id: targetAsset.id, name: targetAsset.name },
        targetVulnerability: { id: targetVuln.id, cveId: targetVuln.cveId }
      },
      appliedModifiers: combinedModifiers,
      baselineMetrics: {
        expectedAnnualLoss: baselineEAL,
        formattedEAL: formatINR(baselineEAL),
        singleLossExpectancy: baselineMetrics.singleLossExpectancy,
        threatEventFrequency: baselineMetrics.threatEventFrequency,
        vulnerabilityFactor: baselineMetrics.vulnerabilityFactor
      },
      simulatedMetrics: {
        expectedAnnualLoss: simulatedEAL,
        formattedEAL: formatINR(simulatedEAL),
        singleLossExpectancy: simulatedMetrics.singleLossExpectancy,
        threatEventFrequency: simulatedMetrics.threatEventFrequency,
        vulnerabilityFactor: simulatedMetrics.vulnerabilityFactor
      },
      impact: {
        riskDelta,
        formattedRiskDelta: formatINR(Math.abs(riskDelta)),
        direction: riskDelta >= 0 ? 'REDUCED' : 'INCREASED',
        projectedTotalExposure,
        formattedProjectedExposure: formatINR(projectedTotalExposure),
        exposureChangePct: totalBaselineExposure > 0
          ? ((simulatedEAL - baselineEAL) / baselineEAL) * 100
          : 0
      },
      timestamp: new Date().toISOString()
    };
  }
}

import {
  calculateThreatEventFrequency,
  calculateVulnerabilityFactor,
  calculateLossBreakdown,
  calculateContextualRiskScore,
  calculateRiskDrivers,
  computeFAIRRiskMetrics,
  recalculateRisk,
  formatINR
} from '../../../src/core/riskEngine.js';

import {
  INITIAL_ASSETS,
  INITIAL_RISKS,
  INITIAL_VULNERABILITIES
} from '../../../src/data/initialData.js';

/**
 * Service providing authoritative Open FAIR calculations
 */
export class FairService {
  /**
   * Retrieves all baseline enterprise risks with live FAIR quantification
   */
  static getQuantifiedRisks() {
    return INITIAL_RISKS.map(risk => {
      const asset = INITIAL_ASSETS.find(a => a.id === risk.assetId) || {};
      const vuln = INITIAL_VULNERABILITIES.find(v => v.id === risk.vulnId) || {};
      const fairMetrics = computeFAIRRiskMetrics(asset, vuln);

      return {
        ...risk,
        assetName: asset.name || risk.assetName,
        assetCriticality: asset.criticality || 'Tier 2',
        cveId: vuln.cveId || risk.cveId,
        cvssScore: vuln.cvssV3 || 7.5,
        cisaKev: vuln.cisaKev || false,
        fairMetrics: {
          threatEventFrequency: fairMetrics.threatEventFrequency,
          vulnerabilityFactor: fairMetrics.vulnerabilityFactor,
          lossEventFrequency: fairMetrics.lossEventFrequency,
          singleLossExpectancy: fairMetrics.singleLossExpectancy,
          expectedAnnualLoss: fairMetrics.expectedAnnualLoss,
          valueAtRisk95: fairMetrics.valueAtRisk95,
          lossBreakdown: fairMetrics.lossBreakdown,
          confidenceRange: fairMetrics.confidenceRange,
          assumptions: fairMetrics.assumptions
        },
        riskScore: fairMetrics.riskScore,
        riskDrivers: fairMetrics.riskDrivers,
        formattedEAL: formatINR(fairMetrics.expectedAnnualLoss),
        formattedSLE: formatINR(fairMetrics.singleLossExpectancy)
      };
    });
  }

  /**
   * Calculates Open FAIR metrics for custom or modified asset/vuln parameters
   * @param {Object} params
   */
  static calculate(params = {}) {
    const { asset, vulnerability, modifiers, assetId, vulnId } = params;

    // Resolve asset and vulnerability either from payload or by ID
    const targetAsset = asset || INITIAL_ASSETS.find(a => a.id === assetId) || INITIAL_ASSETS[0];
    const targetVuln = vulnerability || INITIAL_VULNERABILITIES.find(v => v.id === vulnId) || INITIAL_VULNERABILITIES[0];

    const metrics = computeFAIRRiskMetrics(targetAsset, targetVuln, modifiers || {});

    return {
      targetAsset: {
        id: targetAsset.id,
        name: targetAsset.name,
        criticality: targetAsset.criticality
      },
      targetVulnerability: {
        id: targetVuln.id,
        cveId: targetVuln.cveId,
        cvssV3: targetVuln.cvssV3
      },
      modifiersApplied: modifiers || {},
      fairMetrics: {
        threatEventFrequency: metrics.threatEventFrequency,
        vulnerabilityFactor: metrics.vulnerabilityFactor,
        lossEventFrequency: metrics.lossEventFrequency,
        singleLossExpectancy: metrics.singleLossExpectancy,
        expectedAnnualLoss: metrics.expectedAnnualLoss,
        valueAtRisk95: metrics.valueAtRisk95,
        lossBreakdown: metrics.lossBreakdown,
        confidenceRange: metrics.confidenceRange,
        assumptions: metrics.assumptions
      },
      riskScore: metrics.riskScore,
      riskDrivers: metrics.riskDrivers,
      formattedEAL: formatINR(metrics.expectedAnnualLoss),
      formattedSLE: formatINR(metrics.singleLossExpectancy),
      timestamp: new Date().toISOString()
    };
  }
}

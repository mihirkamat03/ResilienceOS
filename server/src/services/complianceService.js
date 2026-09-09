import {
  FRAMEWORKS,
  calculateFrameworkSummaries,
  getPrioritizedComplianceGaps
} from '../../../src/core/complianceEngine.js';

import {
  INITIAL_COMPLIANCE_CONTROLS,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_RISKS,
  INITIAL_ASSETS,
  INITIAL_REMEDIATIONS
} from '../../../src/data/initialData.js';

/**
 * Compliance Framework Intelligence Service
 */
export class ComplianceService {
  /**
   * Returns framework summaries, coverage metrics, and prioritized gaps
   * @param {Object} params - { controls?: Array, evidence?: Array }
   */
  static getFrameworks(params = {}) {
    const controls = Array.isArray(params.controls) && params.controls.length > 0
      ? params.controls
      : INITIAL_COMPLIANCE_CONTROLS;
    const evidence = Array.isArray(params.evidence) && params.evidence.length > 0
      ? params.evidence
      : INITIAL_EVIDENCE_RECORDS;
    const risks = Array.isArray(params.risks) && params.risks.length > 0
      ? params.risks
      : INITIAL_RISKS;
    const assets = Array.isArray(params.assets) && params.assets.length > 0
      ? params.assets
      : INITIAL_ASSETS;
    const remediations = Array.isArray(params.remediations) && params.remediations.length > 0
      ? params.remediations
      : INITIAL_REMEDIATIONS;

    const summaries = calculateFrameworkSummaries(controls, evidence);
    const prioritizedGaps = getPrioritizedComplianceGaps(controls, risks, assets, evidence, remediations);

    return {
      frameworks: FRAMEWORKS,
      summaries,
      prioritizedGaps,
      totalControlsCount: controls.length,
      totalEvidenceCount: evidence.length,
      timestamp: new Date().toISOString()
    };
  }
}
